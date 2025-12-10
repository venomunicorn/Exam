import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Exam files are stored in the project root
const EXAM_DIR = path.join(__dirname, '../../../');

interface ExamPaperMeta {
    paper_id: string;
    exam_id: string;
    label: string;
    year: number;
    type: string;
    duration_minutes: number;
    total_marks: number;
    total_questions: number;
}

// Get list of available exams
router.get('/', (req: Request, res: Response) => {
    try {
        const examFiles = fs.readdirSync(EXAM_DIR)
            .filter(f => f.endsWith('.json') && f.includes('GATE'));

        const exams: ExamPaperMeta[] = [];

        for (const file of examFiles) {
            try {
                const content = fs.readFileSync(path.join(EXAM_DIR, file), 'utf-8');
                const paper = JSON.parse(content);

                const totalQuestions = paper.sections?.reduce(
                    (acc: number, s: { questions: unknown[] }) => acc + s.questions.length,
                    0
                ) || 0;

                exams.push({
                    paper_id: paper.paper_id,
                    exam_id: paper.exam_id,
                    label: paper.label,
                    year: paper.year,
                    type: paper.type,
                    duration_minutes: paper.duration_minutes,
                    total_marks: paper.total_marks,
                    total_questions: totalQuestions,
                });
            } catch (err) {
                console.error(`Failed to parse ${file}:`, err);
            }
        }

        // Also include sample exam
        const samplePath = path.join(EXAM_DIR, 'src/data/sample_exam.json');
        if (fs.existsSync(samplePath)) {
            try {
                const content = fs.readFileSync(samplePath, 'utf-8');
                const paper = JSON.parse(content);
                const totalQuestions = paper.sections?.reduce(
                    (acc: number, s: { questions: unknown[] }) => acc + s.questions.length,
                    0
                ) || 0;
                exams.push({
                    paper_id: paper.paper_id,
                    exam_id: paper.exam_id,
                    label: paper.label,
                    year: paper.year,
                    type: paper.type,
                    duration_minutes: paper.duration_minutes,
                    total_marks: paper.total_marks,
                    total_questions: totalQuestions,
                });
            } catch {
                // Ignore
            }
        }

        // Group by exam_id
        const grouped: Record<string, {
            exam_id: string;
            name: string;
            papers: ExamPaperMeta[];
        }> = {};

        for (const exam of exams) {
            if (!grouped[exam.exam_id]) {
                grouped[exam.exam_id] = {
                    exam_id: exam.exam_id,
                    name: exam.exam_id.replace('_', ' '),
                    papers: [],
                };
            }
            grouped[exam.exam_id].papers.push(exam);
        }

        res.json(Object.values(grouped));
    } catch (err) {
        console.error('Error listing exams:', err);
        res.status(500).json({ error: 'Failed to list exams' });
    }
});

// Get specific exam paper content
router.get('/:paperId', (req: Request, res: Response) => {
    try {
        const { paperId } = req.params;

        // Search for the exam file
        const examFiles = fs.readdirSync(EXAM_DIR)
            .filter(f => f.endsWith('.json'));

        for (const file of examFiles) {
            try {
                const content = fs.readFileSync(path.join(EXAM_DIR, file), 'utf-8');
                const paper = JSON.parse(content);
                if (paper.paper_id === paperId) {
                    return res.json(paper);
                }
            } catch {
                continue;
            }
        }

        // Check sample exam
        const samplePath = path.join(EXAM_DIR, 'src/data/sample_exam.json');
        if (fs.existsSync(samplePath)) {
            const content = fs.readFileSync(samplePath, 'utf-8');
            const paper = JSON.parse(content);
            if (paper.paper_id === paperId) {
                return res.json(paper);
            }
        }

        res.status(404).json({ error: 'Exam not found' });
    } catch (err) {
        console.error('Error fetching exam:', err);
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
});

export default router;
