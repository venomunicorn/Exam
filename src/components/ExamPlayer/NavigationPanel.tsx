import { useExamStore } from '@/store/examStore';
import type { FlattenedQuestion, QuestionStatus } from '@/types/exam';

interface NavigationPanelProps {
    questions: FlattenedQuestion[];
    currentIndex: number;
    onQuestionSelect: (index: number) => void;
}

const statusColors: Record<QuestionStatus, string> = {
    'not_visited': 'not-visited',
    'not_answered': 'not-answered',
    'answered': 'answered',
    'marked_for_review': 'marked',
    'answered_and_marked': 'answered-marked',
};

function NavigationPanel({ questions, currentIndex, onQuestionSelect }: NavigationPanelProps) {
    const { getQuestionStatus } = useExamStore();

    // Group by section
    const sections = questions.reduce((acc, q) => {
        if (!acc[q.sectionId]) {
            acc[q.sectionId] = {
                title: q.sectionTitle,
                questions: [],
            };
        }
        acc[q.sectionId].questions.push(q);
        return acc;
    }, {} as Record<string, { title: string; questions: FlattenedQuestion[] }>);

    return (
        <div className="navigation-panel">
            <h3 style={{
                fontSize: 'var(--font-size-base)',
                marginBottom: 'var(--spacing-2)',
            }}>
                Question Navigator
            </h3>

            {Object.entries(sections).map(([sectionId, section]) => (
                <div key={sectionId} style={{ marginBottom: 'var(--spacing-4)' }}>
                    <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-2)',
                    }}>
                        {section.title}
                    </p>
                    <div className="question-grid">
                        {section.questions.map((q) => {
                            const status = getQuestionStatus(q.question_id);
                            const isCurrent = q.globalIndex === currentIndex;

                            return (
                                <button
                                    key={q.question_id}
                                    className={`status-badge ${statusColors[status]} ${isCurrent ? 'current' : ''}`}
                                    onClick={() => onQuestionSelect(q.globalIndex)}
                                    title={`Question ${q.globalIndex + 1}`}
                                >
                                    {q.globalIndex + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Legend */}
            <div className="legend">
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--status-answered)' }} />
                    <span>Answered</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--status-not-answered)' }} />
                    <span>Not Answered</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--status-marked)' }} />
                    <span>Marked</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--status-not-visited)' }} />
                    <span>Not Visited</span>
                </div>
            </div>
        </div>
    );
}

export default NavigationPanel;
