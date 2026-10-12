const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { buildAnalysis } = require('../utils/analysis');
const { isFutureDate } = require('../utils/dates');

// ─── Income ──────────────────────────────────────────────────────────────────
exports.addIncome = async (req, res) => {
    try {
        const { source, amount, date } = req.body;
        if (isFutureDate(date)) return res.status(400).json({ message: 'Date cannot be in the future' });
        const income = new Income({ userId: req.user.id, source, amount, date });
        await income.save();
        res.status(201).json(income);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getIncome = async (req, res) => {
    try {
        const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!income) return res.status(404).json({ message: 'Income not found' });
        res.json({ message: 'Income deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ─── Expense ─────────────────────────────────────────────────────────────────
exports.addExpense = async (req, res) => {
    try {
        const { category, amount, date, note } = req.body;
        if (isFutureDate(date)) return res.status(400).json({ message: 'Date cannot be in the future' });
        const expense = new Expense({ userId: req.user.id, category, amount, date, note: note || '' });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ─── Shared mapper: Income + Expense -> one transaction list ─────────────────
const toTransactions = (incomes, expenses) => [
    ...incomes.map((i) => ({
        _id: i._id, type: 'income', title: i.source, category: 'Income', note: '',
        amount: i.amount, date: i.date,
    })),
    ...expenses.map((e) => ({
        _id: e._id, type: 'expense', title: e.note || e.category, category: e.category, note: e.note || '',
        amount: e.amount, date: e.date, splitId: e.splitId || null,
    })),
].sort((a, b) => new Date(b.date) - new Date(a.date));

// ─── Dashboard ───────────────────────────────────────────────────────────────
// GET /dashboard?month=YYYY-MM  (defaults to the current month)
//  - income / expense / recent transactions are for the selected month
//  - totalBalance is everything earned minus everything spent up to the END of the selected month
exports.getDashboardData = async (req, res) => {
    try {
        const now = new Date();
        const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(req.query.month || '')
            ? req.query.month
            : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
        const [y, m] = month.split('-').map(Number);
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end = new Date(Date.UTC(y, m, 1)); // first day of next month (exclusive)

        const [incomes, expenses] = await Promise.all([
            Income.find({ userId: req.user.id, date: { $lt: end } }),
            Expense.find({ userId: req.user.id, date: { $lt: end } }),
        ]);
        const inMonth = (x) => x.date >= start;
        const monthIncomes = incomes.filter(inMonth);
        const monthExpenses = expenses.filter(inMonth);

        const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
        const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
        const balance = incomes.reduce((s, i) => s + i.amount, 0) - expenses.reduce((s, e) => s + e.amount, 0);

        res.json({
            month,
            totalBalance: balance,
            totalIncome,
            totalExpense,
            recentTransactions: toTransactions(monthIncomes, monthExpenses).slice(0, 10),
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ─── History (logged-in user's income + expenses) ────────────────────────────
// The old code read a separate "History" collection that nothing ever wrote to.
// History is now built live from the Income and Expense collections.
exports.getHistory = async (req, res) => {
    try {
        const [incomes, expenses] = await Promise.all([
            Income.find({ userId: req.user.id }),
            Expense.find({ userId: req.user.id }),
        ]);
        res.json(toTransactions(incomes, expenses));
    } catch (err) {
        res.status(500).json({ message: 'Error fetching history', error: err.message });
    }
};

// DELETE /history/:type/:id   (type = income | expense)
exports.deleteHistoryItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = type === 'income' ? Income : type === 'expense' ? Expense : null;
        if (!Model) return res.status(400).json({ message: 'type must be income or expense' });

        const tx = await Model.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!tx) return res.status(404).json({ message: 'Transaction not found or not authorized' });
        res.json({ message: 'Transaction deleted successfully', id });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── Analysis (real data of the logged-in user) ──────────────────────────────
exports.getAnalysis = async (req, res) => {
    try {
        const [incomes, expenses] = await Promise.all([
            Income.find({ userId: req.user.id }).lean(),
            Expense.find({ userId: req.user.id }).lean(),
        ]);
        res.json(buildAnalysis(incomes, expenses));
    } catch (err) {
        res.status(500).json({ message: 'Error building analysis', error: err.message });
    }
};
