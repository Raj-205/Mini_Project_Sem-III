const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const User = require('../models/User');

// ─── Gmail OAuth2 Transporter ────────────────────────────────────────────────
const getTransporter = async () => {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GOOGLE_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: accessToken.token,
        },
    });
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { username, name, mobileNo, email, password, E_pin } = req.body;

        if (!username || !name || !email || !password || !E_pin) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User with this email already exists' });

        user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already taken' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedPin = await bcrypt.hash(String(E_pin), salt);

        user = new User({
            username,
            fullName: name,
            mobileNo: mobileNo || '',
            email,
            password: hashedPassword,
            ePin: hashedPin
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { username, password, ePin } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        // If ePin is provided, validate it
        if (ePin && String(ePin).trim() !== '') {
            const isPinMatch = await bcrypt.compare(String(ePin), user.ePin);
            if (!isPinMatch) return res.status(400).json({ message: 'Invalid E-PIN' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                mobileNo: user.mobileNo
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -ePin -resetOtp -otpExpiry');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Me Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ─── Forgot Password (via Email OTP) ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        const user = await User.findOne({ username, email });
        if (!user) return res.status(400).json({ message: 'No account found with these details' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send OTP via Gmail
        try {
            const transporter = await getTransporter();
            await transporter.sendMail({
                from: `"Student Expense Tracker" <${process.env.GOOGLE_USER}>`,
                to: user.email,
                subject: 'Password Reset OTP - Student Expense Tracker',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #f8fafc; border-radius: 12px;">
                        <h2 style="color: #04344C; text-align: center;">Student Expense Tracker</h2>
                        <p>Hello <strong>${user.fullName}</strong>,</p>
                        <p>You requested a password reset. Use the OTP below to reset your password:</p>
                        <div style="text-align: center; margin: 28px 0;">
                            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #04344C; background: #B0EDF9; padding: 14px 28px; border-radius: 10px;">${otp}</span>
                        </div>
                        <p style="color: #64748b;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">Student Expense Tracker &mdash; Manage your finances.</p>
                    </div>
                `,
            });
            res.json({ message: `OTP sent to ${user.email}` });
        } catch (emailErr) {
            console.error('Email send failed:', emailErr.message);
            // Fallback: log OTP for dev testing
            console.log(`[DEV] OTP for ${username}: ${otp}`);
            res.json({ message: 'OTP generated (email delivery failed in dev). Check server console.' });
        }
    } catch (error) {
        console.error('ForgotPassword Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    try {
        const { username, otp, newPassword, newEPin } = req.body;

        if (!username || !otp) {
            return res.status(400).json({ message: 'Username and OTP are required' });
        }

        const user = await User.findOne({
            username,
            resetOtp: otp,
            otpExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const salt = await bcrypt.genSalt(10);
        if (newPassword) user.password = await bcrypt.hash(newPassword, salt);
        if (newEPin) user.ePin = await bcrypt.hash(String(newEPin), salt);

        user.resetOtp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error('ResetPassword Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
