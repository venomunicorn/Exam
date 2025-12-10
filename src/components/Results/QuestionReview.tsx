import { useState } from 'react';
import type { QuestionEvaluationResult, FlattenedQuestion } from '@/types/exam';
import { formatUserAnswer, formatCorrectAnswer } from '@/utils/evaluation';

interface QuestionReviewProps {
    questionResults: QuestionEvaluationResult[];
    questions: FlattenedQuestion[];
}

function QuestionReview({ questionResults, questions }: QuestionReviewProps) {
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');

    const questionMap = new Map(questions.map((q) => [q.question_id, q]));

    const filteredResults = questionResults.filter((result) => {
        if (filter === 'all') return true;
        if (filter === 'correct') return result.isCorrect;
        if (filter === 'incorrect') return !result.isCorrect && result.userAnswer.type !== 'none';
        if (filter === 'unattempted') return result.userAnswer.type === 'none';
        return true;
    });

    return (
        <div className="card">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-6)',
            }}>
                <h3>Question-wise Review</h3>

                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'correct', label: '✓ Correct' },
                        { id: 'incorrect', label: '✗ Incorrect' },
                        { id: 'unattempted', label: '○ Unattempted' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter(f.id as typeof filter)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {filteredResults.map((result) => {
                    const question = questionMap.get(result.questionId);
                    if (!question) return null;

                    const isUnattempted = result.userAnswer.type === 'none';

                    return (
                        <div
                            key={result.questionId}
                            style={{
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                border: `2px solid ${result.isCorrect
                                    ? 'var(--color-success)'
                                    : isUnattempted
                                        ? 'var(--color-border)'
                                        : 'var(--color-error)'
                                    }`,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Question Header */}
                            <div style={{
                                padding: 'var(--spacing-4)',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                    <span style={{
                                        fontWeight: 'var(--font-weight-semibold)',
                                        fontSize: 'var(--font-size-lg)',
                                    }}>
                                        Q{question.globalIndex + 1}
                                    </span>
                                    <span className={`tag ${result.isCorrect ? 'tag-success' : isUnattempted ? 'tag-default' : 'tag-error'
                                        }`}>
                                        {result.isCorrect ? '✓ Correct' : isUnattempted ? '○ Unattempted' : '✗ Incorrect'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                                    <span style={{
                                        color: result.marksObtained >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                    }}>
                                        {result.marksObtained > 0 ? '+' : ''}{result.marksObtained.toFixed(2)} marks
                                    </span>
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                        ⏱ {result.timeSpentSeconds}s
                                    </span>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div style={{ padding: 'var(--spacing-4)' }}>
                                <p style={{
                                    marginBottom: 'var(--spacing-4)',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 'var(--line-height-relaxed)',
                                }}>
                                    {question.question_text}
                                </p>

                                {/* Options (for MCQ) */}
                                {question.options.length > 0 && (
                                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                        {question.options.map((option, optIdx) => {
                                            const isSelected =
                                                (result.userAnswer.type === 'mcq_single' &&
                                                    result.userAnswer.selectedIndex === optIdx) ||
                                                (result.userAnswer.type === 'mcq_multi' &&
                                                    result.userAnswer.selectedIndices.includes(optIdx));

                                            const isCorrectOption =
                                                (result.correctAnswer.type === 'mcq_single' &&
                                                    result.correctAnswer.correct_option_index === optIdx) ||
                                                (result.correctAnswer.type === 'mcq_multi' &&
                                                    result.correctAnswer.correct_option_indices.includes(optIdx));

                                            return (
                                                <div
                                                    key={optIdx}
                                                    className={`option-item ${isCorrectOption ? 'correct' : isSelected && !isCorrectOption ? 'incorrect' : ''
                                                        }`}
                                                    style={{
                                                        cursor: 'default',
                                                        marginBottom: 'var(--spacing-2)',
                                                    }}
                                                >
                                                    <div className="option-label">
                                                        <span style={{
                                                            fontWeight: 'var(--font-weight-semibold)',
                                                            color: isCorrectOption
                                                                ? 'var(--color-success)'
                                                                : isSelected
                                                                    ? 'var(--color-error)'
                                                                    : 'var(--color-accent-primary)',
                                                            marginRight: 'var(--spacing-2)',
                                                        }}>
                                                            {String.fromCharCode(65 + optIdx)}.
                                                        </span>
                                                        {option}
                                                        {isSelected && !isCorrectOption && (
                                                            <span style={{ color: 'var(--color-error)', marginLeft: 'var(--spacing-2)' }}>
                                                                (Your answer)
                                                            </span>
                                                        )}
                                                        {isCorrectOption && (
                                                            <span style={{ color: 'var(--color-success)', marginLeft: 'var(--spacing-2)' }}>
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* NAT Answer */}
                                {question.type === 'nat' && (
                                    <div style={{
                                        display: 'flex',
                                        gap: 'var(--spacing-6)',
                                        marginBottom: 'var(--spacing-4)',
                                    }}>
                                        <div>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Your Answer: </span>
                                            <span style={{
                                                fontWeight: 'var(--font-weight-semibold)',
                                                color: result.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                                            }}>
                                                {formatUserAnswer(question, result.userAnswer)}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Correct Answer: </span>
                                            <span style={{
                                                fontWeight: 'var(--font-weight-semibold)',
                                                color: 'var(--color-success)',
                                            }}>
                                                {formatCorrectAnswer(question, result.correctAnswer)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Topics */}
                                <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                                    {result.topics.map((topic) => (
                                        <span key={topic} className="tag tag-default">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredResults.length === 0 && (
                <p style={{
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    padding: 'var(--spacing-8)',
                }}>
                    No questions match the selected filter
                </p>
            )}
        </div>
    );
}

export default QuestionReview;
