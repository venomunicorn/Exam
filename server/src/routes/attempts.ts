import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import {
    createAttempt,
    getAttemptById,
    getAttemptsByUser,
    updateAttempt
} from '../storage/fileStorage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAM_DIR = path.join(__dirname, '../../../');

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Start a new attempt
router.post('/', (req: AuthRequest, res: Response) => {
    try {
        const { paperId } = req.body;

        if (!paperId) {
            return res.status(400).json({ error: 'paperId required' });
        }

        // Get exam duration
        let durationMinutes = 180; // default
        const examFiles = fs.readdirSync(EXAM_DIR).filter(f => f.endsWith('.json'));
        for (const file of examFiles) {
            try {
                const content = fs.readFileSync(path.join(EXAM_DIR, file), 'utf-8');
                const paper = JSON.parse(content);
                if (paper.paper_id === paperId) {
                    durationMinutes = paper.duration_minutes;
                    break;
                }
            } catch {
                continue;
            }
        }

        const attempt = createAttempt(req.user!.id, paperId, durationMinutes);

        res.status(201).json({
            attemptId: attempt.id,
            paperId: attempt.paperId,
            startedAt: attempt.startedAt,
            expectedEnd: attempt.expectedEnd,
        });
    } catch (err) {
        console.error('Error creating attempt:', err);
        res.status(500).json({ error: 'Failed to create attempt' });
    }
});

// Get user's attempts
router.get('/', (req: AuthRequest, res: Response) => {
    try {
        const attempts = getAttemptsByUser(req.user!.id);

        res.json(attempts.map(a => ({
            id: a.id,
            paperId: a.paperId,
            status: a.status,
            startedAt: a.startedAt,
            endedAt: a.endedAt,
            finalScore: a.finalScore,
        })));
    } catch (err) {
        console.error('Error fetching attempts:', err);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
});

// Get specific attempt
router.get('/:id', (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const attempt = getAttemptById(id);

        if (!attempt || attempt.odId !== req.user!.id) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        res.json(attempt);
    } catch (err) {
        console.error('Error fetching attempt:', err);
        res.status(500).json({ error: 'Failed to fetch attempt' });
    }
});

// Update attempt progress (autosave)
router.patch('/:id/progress', (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { answers, times } = req.body;

        const attempt = getAttemptById(id);
        if (!attempt || attempt.odId !== req.user!.id) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        if (attempt.status !== 'started') {
            return res.status(400).json({ error: 'Attempt already completed' });
        }

        // Merge answers and times
        const updatedAnswers = { ...attempt.answersJson, ...answers };
        const updatedTimes = { ...attempt.timesJson, ...times };

        updateAttempt(id, {
            answersJson: updatedAnswers,
            timesJson: updatedTimes,
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Submit attempt
router.post('/:id/submit', (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { answers, times, summary } = req.body;

        const attempt = getAttemptById(id);
        if (!attempt || attempt.odId !== req.user!.id) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        if (attempt.status === 'completed') {
            return res.status(400).json({ error: 'Attempt already submitted' });
        }

        // Calculate score from summary if provided
        const finalScore = summary?.totalScore ?? 0;

        updateAttempt(id, {
            status: 'completed',
            endedAt: new Date().toISOString(),
            answersJson: answers || attempt.answersJson,
            timesJson: times || attempt.timesJson,
            finalScore,
            summaryJson: summary,
        });

        res.json({
            success: true,
            finalScore,
            message: 'Exam submitted successfully',
        });
    } catch (err) {
        console.error('Error submitting attempt:', err);
        res.status(500).json({ error: 'Failed to submit attempt' });
    }
});

export default router;
