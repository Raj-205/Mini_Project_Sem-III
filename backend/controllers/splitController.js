const mongoose = require('mongoose');
const User = require('../models/User');
const Split = require('../models/Split');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const { computeShares, round2 } = require('../utils/analysis');
const { isFutureDate } = require('../utils/dates');

// GET /users/lookup?username=abc  -> is this friend registered on the site?
exports.lookupUser = async (req, res) => {
    try {
        const username = String(req.query.username || '').trim();
        if (!username) return res.status(400).json({ message: 'username is required' });

        const user = await User.findOne({ username }).select('username fullName');
        if (!user) return res.json({ found: false });
        if (String(user._id) === req.user.id) return res.status(400).json({ message: 'You cannot split a bill with yourself' });
        res.json({ found: true, user: { id: user._id, username: user.username, fullName: user.fullName } });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// POST /splits
// body: { title, category, totalAmount, date, friends: [{ username?, name?, share? }] }
// The logged-in user paid the whole bill. Their own part goes into their Expenses;
// each registered friend gets a bell notification and can accept (-> expense) or decline.
exports.createSplit = async (req, res) => {
    try {
        const { title, category, date } = req.body;
        const totalAmount = Number(req.body.totalAmount);
        const friends = Array.isArray(req.body.friends) ? req.body.friends : [];

        if (!title || !String(title).trim()) return res.status(400).json({ message: 'Title is required' });
        if (!(totalAmount > 0)) return res.status(400).json({ message: 'Total amount must be greater than 0' });
        if (friends.length === 0) return res.status(400).json({ message: 'Add at least one friend' });
        if (date && isFutureDate(date)) return res.status(400).json({ message: 'Date cannot be in the future' });

        const me = await User.findById(req.user.id).select('username fullName');
        if (!me) return res.status(404).json({ message: 'User not found' });

        // resolve friends (registered by username, otherwise a plain guest name)
        const usernames = friends.map((f) => String(f.username || '').trim()).filter(Boolean);
        const found = await User.find({ username: { $in: usernames } }).select('username fullName');
        const byUsername = Object.fromEntries(found.map((u) => [u.username, u]));

        const seen = new Set();
        const participants = [];
        for (const f of friends) {
            const uname = String(f.username || '').trim();
            const guestName = String(f.name || '').trim();
            const reg = uname ? byUsername[uname] : null;

            if (reg && String(reg._id) === req.user.id) return res.status(400).json({ message: 'You cannot add yourself as a friend' });
            const key = reg ? `u:${reg._id}` : `g:${(guestName || uname).toLowerCase()}`;
            if (seen.has(key)) return res.status(400).json({ message: `${reg ? reg.username : (guestName || uname)} was added twice` });
            seen.add(key);

            if (!reg && !guestName && !uname) return res.status(400).json({ message: 'Every friend needs a username or a name' });

            participants.push({
                userId: reg ? reg._id : null,
                username: reg ? reg.username : '',
                name: reg ? reg.fullName : (guestName || uname),
                status: reg ? 'pending' : 'guest',
            });
        }

        let calc;
        try {
            const custom = friends.map((f) => f.share);
            calc = computeShares(totalAmount, participants.length, custom.every((s) => s !== undefined && s !== '' && s !== null) ? custom : null);
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
        participants.forEach((p, i) => { p.share = calc.shares[i]; });

        const splitDate = date ? new Date(date) : new Date();
        const cat = (category && String(category).trim()) || 'Split';

        const split = await Split.create({
            payerId: req.user.id,
            title: String(title).trim(),
            category: cat,
            totalAmount: round2(totalAmount),
            payerShare: calc.payerShare,
            date: splitDate,
            participants,
        });

        // payer's own part -> payer's Expense section
        if (calc.payerShare > 0) {
            await Expense.create({
                userId: req.user.id, category: cat, amount: calc.payerShare, date: splitDate,
                note: `Split: ${split.title}`, splitId: split._id,
            });
        }

        // notify registered friends (bell dropdown)
        const notes = split.participants
            .filter((p) => p.userId)
            .map((p) => ({
                userId: p.userId, type: 'split_request', fromUserId: req.user.id, splitId: split._id,
                message: `${me.fullName} (@${me.username}) split "${split.title}" with you. Your share is ₹${p.share}.`,
                amount: p.share, status: 'pending',
            }));
        if (notes.length) await Notification.insertMany(notes);

        res.status(201).json(split);
    } catch (err) {
        console.error('createSplit error:', err);
        res.status(500).json({ message: 'Error creating split', error: err.message });
    }
};

// GET /splits  -> splits I paid for + splits other people shared with me
exports.getSplits = async (req, res) => {
    try {
        const uid = new mongoose.Types.ObjectId(req.user.id);
        const splits = await Split.find({ $or: [{ payerId: uid }, { 'participants.userId': uid }] })
            .sort({ date: -1, createdAt: -1 })
            .populate('payerId', 'username fullName')
            .lean();

        res.json(splits.map((s) => {
            const mine = String(s.payerId._id) === req.user.id;
            const myPart = mine ? null : s.participants.find((p) => p.userId && String(p.userId) === req.user.id);
            return {
                _id: s._id,
                title: s.title,
                category: s.category,
                totalAmount: s.totalAmount,
                date: s.date,
                role: mine ? 'payer' : 'participant',
                paidBy: { username: s.payerId.username, fullName: s.payerId.fullName },
                myShare: mine ? s.payerShare : (myPart ? myPart.share : 0),
                myStatus: mine ? 'paid' : (myPart ? myPart.status : 'pending'),
                // payers see everyone; friends only see their own row + the payer
                participants: (mine ? s.participants : s.participants.filter((p) => p.userId && String(p.userId) === req.user.id))
                    .map((p) => ({ name: p.name, username: p.username, share: p.share, status: p.status })),
            };
        }));
    } catch (err) {
        res.status(500).json({ message: 'Error fetching splits', error: err.message });
    }
};
