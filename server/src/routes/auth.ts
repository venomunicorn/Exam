import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail } from '../storage/fileStorage.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        if (getUserByEmail(email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(password, 10);
        const user = createUser(email, passwordHash);

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            user: { id: user.id, email: user.email },
            token,
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            user: { id: user.id, email: user.email },
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
