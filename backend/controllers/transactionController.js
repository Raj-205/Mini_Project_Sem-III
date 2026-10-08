const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Income Controllers
exports.addIncome = async (req, res) => {
    try {
        const { source, amount, date } = req.body;
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

// Expense Controllers
exports.addExpense = async (req, res) => {
    try {
        const { category, amount, date } = req.body;
        const expense = new Expense({ userId: req.user.id, category, amount, date });
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

// Dashboard Controller
exports.getDashboardData = async (req, res) => {
    try {
        const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });

        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalBalance = totalIncome - totalExpense;

        // Merge and sort for recent transactions
        const recentTransactions = [
            ...incomes.map(i => ({ _id: i._id, title: i.source, category: 'Income', amount: i.amount, type: 'income', date: i.date })),
            ...expenses.map(e => ({ _id: e._id, title: e.category, category: e.category, amount: e.amount, type: 'expense', date: e.date }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            totalBalance,
            totalIncome,
            totalExpense,
            recentTransactions
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};
