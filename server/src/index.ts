import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import examsRoutes from './routes/exams.js';
import attemptsRoutes from './routes/attempts.js';
import { initStorage } from './storage/fileStorage.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Initialize storage
initStorage();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/attempts', attemptsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 GATE TestPrep Server running on http://localhost:${PORT}`);
});
