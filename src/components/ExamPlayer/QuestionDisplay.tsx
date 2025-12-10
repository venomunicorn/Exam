import { useExamStore } from '@/store/examStore';
import type { FlattenedQuestion, UserAnswer } from '@/types/exam';
import MCQSingleInput from './MCQSingleInput';
import MCQMultiInput from './MCQMultiInput';
import NATInput from './NATInput';

interface QuestionDisplayProps {
    question: FlattenedQuestion;
    questionNumber: number;
    totalQuestions: number;
    onNext: () => void;
    onPrevious: () => void;
    isFirst: boolean;
    isLast: boolean;
}

function QuestionDisplay({
    question,
    questionNumber,
    totalQuestions,
    onNext,
    onPrevious,
    isFirst,
    isLast,
}: QuestionDisplayProps) {
    const { getQuestionState, setAnswer, clearAnswer, toggleMarkForReview } = useExamStore();
    const state = getQuestionState(question.question_id);

    const handleAnswerChange = (answer: UserAnswer) => {
        setAnswer(question.question_id, answer);
    };

    const handleClear = () => {
        clearAnswer(question.question_id);
    };

    const handleToggleMark = () => {
        toggleMarkForReview(question.question_id);
    };

    return (
        <div className="question-panel">
            {/* Question Header */}
            <div style={{
                padding: 'var(--spacing-4) var(--spacing-6)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    <span style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                    }}>
                        Question {questionNumber}
                    </span>
                    <span style={{
                        color: 'var(--color-text-muted)',
                        marginLeft: 'var(--spacing-2)',
                    }}>
                        of {totalQuestions}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <span className={`tag ${question.type === 'nat' ? 'tag-warning' : 'tag-default'
                        }`}>
                        {question.type === 'mcq_single' && 'Single Choice'}
                        {question.type === 'mcq_multi' && 'Multiple Choice'}
                        {question.type === 'nat' && 'Numerical'}
                    </span>
                    <span style={{
                        color: 'var(--color-success)',
                        fontWeight: 'var(--font-weight-semibold)',
                    }}>
                        +{question.marks_scheme.marks_correct} marks
                    </span>
                    {question.marks_scheme.marks_incorrect < 0 && (
                        <span style={{
                            color: 'var(--color-error)',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            ({question.marks_scheme.marks_incorrect})
                        </span>
                    )}
                </div>
            </div>

            {/* Question Content */}
            <div className="question-content">
                {/* Question Text */}
                <div className="question-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {question.question_text}
                </div>

                {/* Question Image */}
                {question.image && (
                    <div style={{
                        marginBottom: 'var(--spacing-6)',
                        textAlign: 'center',
                    }}>
                        <img
                            src={`/images/${question.image}`}
                            alt="Question diagram"
                            className="question-image"
                            style={{ maxHeight: '300px' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Topics */}
                <div style={{
                    marginBottom: 'var(--spacing-6)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-2)',
                }}>
                    {question.topics.map((topic) => (
                        <span key={topic} className="tag tag-default">
                            {topic}
                        </span>
                    ))}
                </div>

                {/* Answer Input */}
                <div>
                    {question.type === 'mcq_single' && (
                        <MCQSingleInput
                            options={question.options}
                            selectedIndex={
                                state?.answer.type === 'mcq_single'
                                    ? state.answer.selectedIndex
                                    : null
                            }
                            onChange={(idx) => handleAnswerChange({
                                type: 'mcq_single',
                                selectedIndex: idx
                            })}
                        />
                    )}

                    {question.type === 'mcq_multi' && (
                        <MCQMultiInput
                            options={question.options}
                            selectedIndices={
                                state?.answer.type === 'mcq_multi'
                                    ? state.answer.selectedIndices
                                    : []
                            }
                            onChange={(indices) => handleAnswerChange({
                                type: 'mcq_multi',
                                selectedIndices: indices,
                            })}
                        />
                    )}

                    {question.type === 'nat' && (
                        <NATInput
                            value={
                                state?.answer.type === 'nat'
                                    ? state.answer.value
                                    : null
                            }
                            onChange={(value) => handleAnswerChange({
                                type: 'nat',
                                value,
                            })}
                        />
                    )}
                </div>
            </div>

            {/* Question Footer */}
            <div className="question-footer">
                <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleClear}
                    >
                        Clear Response
                    </button>
                    <button
                        className={`btn ${state?.markedForReview ? 'btn-warning' : 'btn-secondary'}`}
                        onClick={handleToggleMark}
                        style={{
                            background: state?.markedForReview ? 'var(--color-warning)' : undefined,
                            color: state?.markedForReview ? 'white' : undefined,
                        }}
                    >
                        {state?.markedForReview ? '★ Marked' : '☆ Mark for Review'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onPrevious}
                        disabled={isFirst}
                    >
                        ← Previous
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onNext}
                        disabled={isLast}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuestionDisplay;
