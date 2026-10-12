const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // who receives it
    type: { type: String, enum: ['split_request', 'split_update'], required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    splitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Split' },
    message: { type: String, required: true },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'info'], default: 'info' },
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
