import { useParams, useNavigate } from 'react-router-dom';
import { useExamStore } from '@/store/examStore';
import type { ExamPaper } from '@/types/exam';

// Import exam data
import gateDA2025 from '../../GATE_DA_2025_Complete.json';
import gateDA2024 from '../../GATE_DA_2024_S1_EXAM.json';
import sampleExam from '@/data/sample_exam.json';

// Map paper IDs to their data
const paperMap: Record<string, ExamPaper> = {
    [gateDA2025.paper_id]: gateDA2025 as ExamPaper,
    [gateDA2024.paper_id]: gateDA2024 as ExamPaper,
    [sampleExam.paper_id]: sampleExam as ExamPaper,
};

function ExamConfirmPage() {
    const { paperId } = useParams<{ paperId: string }>();
    const navigate = useNavigate();
    const { loadExam, startExam } = useExamStore();

    const paper = paperId ? paperMap[paperId] : null;

    if (!paper) {
        return (
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <h2 style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-4)' }}>
                        Exam Not Found
                    </h2>
                    <p style={{ marginBottom: 'var(--spacing-6)' }}>
                        The requested exam paper could not be found.
                    </p>
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const totalQuestions = paper.sections.reduce((acc, s) => acc + s.questions.length, 0);

    const handleStartExam = async () => {
        // Request fullscreen first (must be from user gesture)
        try {
            await document.documentElement.requestFullscreen();
        } catch (err) {
            console.warn('Fullscreen request failed:', err);
        }

        loadExam(paper);
        startExam();
        navigate(`/exam/${paperId}/attempt`);
    };

    return (
        <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--spacing-8) var(--spacing-4)',
        }}>
            <div className="card animate-slide-up" style={{ maxWidth: '700px', width: '100%' }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    paddingBottom: 'var(--spacing-6)',
                    borderBottom: '1px solid var(--color-border)',
                    marginBottom: 'var(--spacing-6)',
                }}>
                    <span className={`tag ${paper.type === 'PYQ' ? 'tag-success' : 'tag-warning'}`} style={{ marginBottom: 'var(--spacing-3)' }}>
                        {paper.type}
                    </span>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>
                        {paper.label}
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {paper.exam_id} • Year {paper.year}
                    </p>
                </div>

                {/* Exam Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="stat-card">
                        <div className="stat-value info">{paper.duration_minutes}</div>
                        <div className="stat-label">Minutes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalQuestions}</div>
                        <div className="stat-label">Questions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value success">{paper.total_marks}</div>
                        <div className="stat-label">Total Marks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{paper.sections.length}</div>
                        <div className="stat-label">Sections</div>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-5)',
                    marginBottom: 'var(--spacing-6)',
                }}>
                    <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        marginBottom: 'var(--spacing-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                    }}>
                        📋 Instructions
                    </h3>
                    <ul style={{
                        lineHeight: 'var(--line-height-relaxed)',
                        color: 'var(--color-text-secondary)',
                        paddingLeft: 'var(--spacing-6)',
                    }}>
                        <li>The exam will start in <strong>fullscreen mode</strong>. Please do not exit fullscreen during the exam.</li>
                        <li>There is <strong>negative marking</strong> for incorrect answers in MCQ questions.</li>
                        <li>For Numerical Answer Type (NAT) questions, there is no negative marking.</li>
                        <li>You can navigate between questions and mark questions for review.</li>
                        <li>Your answers are automatically saved every few seconds.</li>
                        <li>The exam will be <strong>auto-submitted</strong> when time runs out.</li>
                    </ul>
                </div>

                {/* Section Breakdown */}
                <div style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        marginBottom: 'var(--spacing-4)',
                    }}>
                        📊 Section Breakdown
                    </h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Section</th>
                                    <th>Questions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paper.sections.map((section) => (
                                    <tr key={section.section_id}>
                                        <td>{section.title}</td>
                                        <td>{section.questions.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 'var(--spacing-4)',
                    borderTop: '1px solid var(--color-border)',
                }}>
                    <button className="btn btn-ghost" onClick={() => navigate('/')}>
                        ← Back
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={handleStartExam}>
                        🚀 Start Exam
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamConfirmPage;
