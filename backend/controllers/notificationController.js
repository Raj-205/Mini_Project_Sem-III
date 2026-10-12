const User = require('../models/User');
const Split = require('../models/Split');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

// GET /notifications
exports.getNotifications = async (req, res) => {
    try {
        const [items, unread] = await Promise.all([
            Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(30).lean(),
            Notification.countDocuments({ userId: req.user.id, read: false }),
        ]);
        res.json({ unread, items });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notifications', error: err.message });
    }
};

// PUT /notifications/read-all
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// PUT /notifications/:id/read
exports.markRead = async (req, res) => {
    try {
        const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true }, { new: true });
        if (!n) return res.status(404).json({ message: 'Notification not found' });
        res.json(n);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const respond = (accept) => async (req, res) => {
    try {
        const n = await Notification.findOne({ _id: req.params.id, userId: req.user.id, type: 'split_request' });
        if (!n) return res.status(404).json({ message: 'Notification not found' });
        if (n.status !== 'pending') return res.status(400).json({ message: `Already ${n.status}` });

        const split = await Split.findById(n.splitId);
        const part = split && split.participants.find((p) => p.userId && String(p.userId) === req.user.id && p.status === 'pending');
        if (!part) return res.status(404).json({ message: 'Split no longer exists' });

        const me = await User.findById(req.user.id).select('fullName username');

        if (accept) {
            // friend's share -> friend's Expense section
            await Expense.create({
                userId: req.user.id, category: split.category, amount: part.share, date: split.date,
                note: `Split: ${split.title}`, splitId: split._id,
            });
        }
        part.status = accept ? 'accepted' : 'declined';
        await split.save();

        n.status = accept ? 'accepted' : 'declined';
        n.read = true;
        await n.save();

        // tell the payer
        await Notification.create({
            userId: split.payerId, type: 'split_update', fromUserId: req.user.id, splitId: split._id, status: 'info',
            message: `${me.fullName} (@${me.username}) ${accept ? 'accepted' : 'declined'} ₹${part.share} for "${split.title}".`,
            amount: part.share,
        });

        res.json(n);
    } catch (err) {
        console.error('respond error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.acceptSplit = respond(true);
exports.declineSplit = respond(false);
