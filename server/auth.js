
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
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
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
        const { email, password } = req.body;
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

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
