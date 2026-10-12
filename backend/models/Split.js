const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null => friend is not on the site
    username: { type: String, default: '' },
    name: { type: String, required: true },
    share: { type: Number, required: true },
    // pending  = registered friend, has not accepted yet
    // accepted = registered friend accepted (share was added to their expenses)
    // declined = registered friend declined
    // guest    = friend not registered on the site (tracked only by the payer)
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'guest'], default: 'pending' },
}, { _id: true });

const SplitSchema = new mongoose.Schema({
    payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true },   // full bill paid by payer
    payerShare: { type: Number, required: true },    // payer's own part (added to payer's expenses)
    date: { type: Date, required: true },
    participants: [ParticipantSchema],
}, { timestamps: true });

SplitSchema.index({ 'participants.userId': 1 });

module.exports = mongoose.model('Split', SplitSchema);
