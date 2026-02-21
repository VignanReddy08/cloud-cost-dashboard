
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'dotenv/config'; // Ensure env vars are loaded

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Nodemailer Transporter
// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Helper to read/write users
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const users = readUsers();
        const existingUserIndex = users.findIndex(u => u.email === email);

        if (existingUserIndex !== -1) {
            const existingUser = users[existingUserIndex];
            if (existingUser.verified) {
                return res.status(400).json({ error: 'User already exists' });
            }
            // If user exists but not verified, we allow overwriting/resending
            // Remove the old unverified user entry
            users.splice(existingUserIndex, 1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code

        const newUser = {
            id: Date.now().toString(),
            name: name || '',
            email,
            password: hashedPassword,
            verified: false,
            verificationCode,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        // Send Email
        try {
            const transporter = createTransporter();
            console.log('Attempting to send email to:', email);
            console.log('Using Email User:', process.env.EMAIL_USER); // Log to verify env var

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify your Cloud Cost Dashboard Account',
                text: `Your verification code is: ${verificationCode}`,
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
            });
            console.log(`Verification email sent to ${email}`);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Log full error object properties if available
            if (emailError.response) console.error('SMTP Response:', emailError.response);

            return res.status(500).json({
                error: 'Failed to send verification email. Check server logs.',
                details: emailError.message
            });
        }

        res.json({ success: true, message: 'Verification code sent to email' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Email
router.post('/verify', (req, res) => {
    const { email, code } = req.body;
    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    const user = users[userIndex];

    if (user.verified) return res.status(400).json({ error: 'User already verified' });
    if (user.verificationCode !== code) return res.status(400).json({ error: 'Invalid code' });

    user.verified = true;
    user.verificationCode = null; // Clear code
    writeUsers(users);

    res.json({ success: true, message: 'Account verified successfully' });
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = readUsers();
        const user = users.find(u => u.email === email);

        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        if (!user.verified) return res.status(403).json({ error: 'Account not verified. Please verify your email.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Resend Verification Code
router.post('/resend-code', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const users = readUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
        const user = users[userIndex];

        if (user.verified) return res.status(400).json({ error: 'User already verified' });

        // Generate new code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        writeUsers(users);

        // Send Email
        const transporter = createTransporter();
        console.log('Resending verification email to:', email);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Resend: Verify your Cloud Cost Dashboard Account',
            text: `Your new verification code is: ${verificationCode}`,
            html: `<p>Your new verification code is: <strong>${verificationCode}</strong></p>`
        });

        res.json({ success: true, message: 'Verification code resent' });
    } catch (error) {
        console.error('Resend code error:', error);
        res.status(500).json({ error: 'Failed to resend code' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const users = readUsers();
        const userIndex = users.findIndex(u => u.email === email);

        // We don't error out explicitly if user not found to prevent email enumeration,
        // but for this simple app we can return an error or just pretend it sent.
        // Let's return error for UX.
        if (userIndex === -1) return res.status(404).json({ error: 'No account with that email found' });

        const user = users[userIndex];

        // Generate reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code and expiration (e.g., 15 mins)
        user.resetToken = resetCode;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

        writeUsers(users);

        // Send Email
        const transporter = createTransporter();
        console.log('Sending password reset email to:', email);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Cloud Cost Dashboard - Password Reset',
            text: `Your password reset code is: ${resetCode}. It will expire in 15 minutes.`,
            html: `<p>Your password reset code is: <strong>${resetCode}</strong></p><p>It will expire in 15 minutes.</p>`
        });

        res.json({ success: true, message: 'Password reset code sent to email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, code, and new password are required' });
        }

        const users = readUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

        const user = users[userIndex];

        // Check if token matches and is not expired
        if (!user.resetToken || user.resetToken !== code) {
            return res.status(400).json({ error: 'Invalid reset code' });
        }

        if (!user.resetTokenExpiry || Date.now() > user.resetTokenExpiry) {
            return res.status(400).json({ error: 'Reset code has expired' });
        }

        // Hash new password and save
        user.password = await bcrypt.hash(newPassword, 10);

        // Clear reset token fields
        user.resetToken = null;
        user.resetTokenExpiry = null;

        writeUsers(users);

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Middleware for authenticating requests
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

        // If email is changing, check if new email already exists
        if (email && email !== users[userIndex].email) {
            const emailExists = users.some(u => u.email === email);
            if (emailExists) return res.status(400).json({ error: 'Email already in use' });
        }

        const updatedUser = {
            ...users[userIndex],
            name: name !== undefined ? name : users[userIndex].name,
            email: email || users[userIndex].email
        };

        users[userIndex] = updatedUser;
        writeUsers(users);

        res.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email } });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change Password
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, users[userIndex].password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

        users[userIndex].password = await bcrypt.hash(newPassword, 10);
        writeUsers(users);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Account
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        let users = readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

        users.splice(userIndex, 1);
        writeUsers(users);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
