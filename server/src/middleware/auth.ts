import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById, StoredUser } from '../storage/fileStorage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gate-testprep-secret';

export interface AuthRequest extends Request {
    user?: StoredUser;
}

export function generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = getUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Optional auth - attaches user if token present but doesn't require it
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            req.user = getUserById(decoded.userId);
        } catch {
            // Ignore invalid tokens for optional auth
        }
    }

    next();
}
