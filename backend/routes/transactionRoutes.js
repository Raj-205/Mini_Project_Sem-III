const express = require('express');
const router = express.Router();
const {
    addIncome, getIncome, deleteIncome,
    addExpense, getExpenses, deleteExpense,
    getDashboardData, getHistory, deleteHistoryItem, getAnalysis,
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all transaction routes
router.use(authMiddleware);

// Income
router.post('/income', addIncome);
router.get('/income', getIncome);
router.delete('/income/:id', deleteIncome);

// Expense
router.post('/expenses', addExpense);
router.get('/expenses', getExpenses);
router.delete('/expenses/:id', deleteExpense);

// Dashboard + analysis
router.get('/dashboard', getDashboardData);
router.get('/analysis', getAnalysis);

// History
router.get('/history', getHistory);
router.delete('/history/:type/:id', deleteHistoryItem);

module.exports = router;
