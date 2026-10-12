const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    note: { type: String, default: '' },                       // e.g. "Split: Pizza night"
    splitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Split', default: null },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
