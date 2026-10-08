const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    mobileNo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ePin: { type: String, required: true },
    resetOtp: { type: String },
    otpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
