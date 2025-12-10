import { useNavigate } from 'react-router-dom';
import type { ExamCatalogEntry } from '@/types/exam';
import { useAuthStore } from '@/store/authStore';
import { useExamStore } from '@/store/examStore';
import { formatTime } from '@/utils/timeUtils';

// Import exam data
import gateDA2025 from '../../GATE_DA_2025_Complete.json';
import gateDA2024 from '../../GATE_DA_2024_S1_EXAM.json';
import sampleExam from '@/data/sample_exam.json';

// Build catalog from available JSON files
const examCatalog: ExamCatalogEntry[] = [
    {
        exam_id: 'GATE_DA',
        name: 'GATE Data Science & AI',
        description: 'Graduate Aptitude Test in Engineering - Data Science and Artificial Intelligence',
        papers: [
            {
                paper_id: gateDA2025.paper_id,
                label: gateDA2025.label,
                year: gateDA2025.year,
                type: gateDA2025.type as 'PYQ' | 'Mock',
                duration_minutes: gateDA2025.duration_minutes,
                total_questions: gateDA2025.sections.reduce((acc, s) => acc + s.questions.length, 0),
                total_marks: gateDA2025.total_marks,
            },
            {
                paper_id: gateDA2024.paper_id,
                label: gateDA2024.label,
                year: gateDA2024.year,
                type: gateDA2024.type as 'PYQ' | 'Mock',
                duration_minutes: gateDA2024.duration_minutes,
                total_questions: gateDA2024.sections.reduce((acc, s) => acc + s.questions.length, 0),
                total_marks: gateDA2024.total_marks,
            },
        ],
    },
    {
        exam_id: 'GATE_CSE',
        name: 'GATE Computer Science',
        description: 'Graduate Aptitude Test in Engineering - Computer Science and Information Technology',
        papers: [
            {
                paper_id: sampleExam.paper_id,
                label: sampleExam.label,
                year: sampleExam.year,
                type: sampleExam.type as 'PYQ' | 'Mock',
                duration_minutes: sampleExam.duration_minutes,
                total_questions: sampleExam.sections.reduce((acc, s) => acc + s.questions.length, 0),
                total_marks: sampleExam.total_marks,
            },
        ],
    },
];

function HomePage() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();
    const { paper, status, remainingTimeSeconds, resetExam } = useExamStore();

    // Check for active exam that can be resumed
    const hasActiveExam = paper && status === 'in_progress' && remainingTimeSeconds > 0;

    const handleStartExam = (paperId: string) => {
        navigate(`/exam/${paperId}/confirm`);
    };

    const handleResumeExam = () => {
        if (paper) {
            navigate(`/exam/${paper.paper_id}/attempt`);
        }
    };

    const handleAbandonExam = () => {
        resetExam();
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
            {/* Navigation Bar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--spacing-3)',
                marginBottom: 'var(--spacing-4)',
            }}>
                {isAuthenticated ? (
                    <>
                        <span style={{
                            color: 'var(--color-text-muted)',
                            alignSelf: 'center',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            {user?.email}
                        </span>
                        <button className="btn btn-ghost" onClick={() => navigate('/history')}>
                            📊 History
                        </button>
                        <button className="btn btn-secondary" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                )}
            </nav>

            {/* Resume Exam Banner */}
            {hasActiveExam && (
                <div style={{
                    background: 'linear-gradient(135deg, var(--color-warning-bg), var(--color-info-bg))',
                    border: '1px solid var(--color-warning)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-4) var(--spacing-6)',
                    marginBottom: 'var(--spacing-6)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-1)', color: 'var(--color-warning)' }}>
                            ⚠️ Exam In Progress
                        </h3>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                            {paper.label} • {formatTime(remainingTimeSeconds)} remaining
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                        <button className="btn btn-ghost" onClick={handleAbandonExam}>
                            Abandon
                        </button>
                        <button className="btn btn-primary" onClick={handleResumeExam}>
                            Resume Exam →
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
                <h1 style={{
                    marginBottom: 'var(--spacing-4)',
                    background: 'var(--color-accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    GATE TestPrep Engine
                </h1>
                <p style={{ fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
                    Practice with real exam conditions, track your performance, and identify your weak areas
                </p>
            </header>

            {/* Exam List */}
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {examCatalog.map((exam) => (
                    <div key={exam.exam_id} className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
                        <div style={{ marginBottom: 'var(--spacing-4)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-2)' }}>
                                {exam.name}
                            </h2>
                            <p>{exam.description}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            {exam.papers.map((paper) => (
                                <div
                                    key={paper.paper_id}
                                    className="card-hover"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--spacing-4)',
                                        background: 'var(--color-bg-secondary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleStartExam(paper.paper_id)}
                                >
                                    <div>
                                        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-1)' }}>
                                            {paper.label}
                                        </h3>
                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--spacing-4)',
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            <span>📝 {paper.total_questions} Questions</span>
                                            <span>⏱️ {paper.duration_minutes} mins</span>
                                            <span>🎯 {paper.total_marks} marks</span>
                                            <span className={`tag ${paper.type === 'PYQ' ? 'tag-success' : 'tag-warning'}`}>
                                                {paper.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary">
                                        Start Exam →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <footer style={{
                textAlign: 'center',
                marginTop: 'var(--spacing-16)',
                padding: 'var(--spacing-6)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)',
            }}>
                <p>GATE TestPrep Engine v1.0 • Built for focused exam preparation</p>
            </footer>
        </div>
    );
}

export default HomePage;
