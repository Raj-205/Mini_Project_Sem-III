const express = require('express');
const router = express.Router();
const { addIncome, getIncome, deleteIncome, addExpense, getExpenses, deleteExpense, getDashboardData } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all transaction routes
router.use(authMiddleware);

// Income routes
router.post('/income', addIncome);
router.get('/income', getIncome);
router.delete('/income/:id', deleteIncome);

// Expense routes
router.post('/expenses', addExpense);
router.get('/expenses', getExpenses);
router.delete('/expenses/:id', deleteExpense);

// Dashboard
router.get('/dashboard', getDashboardData);

module.exports = router;
