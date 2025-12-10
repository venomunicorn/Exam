interface SubmitModalProps {
    totalQuestions: number;
    answeredCount: number;
    markedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

function SubmitModal({
    totalQuestions,
    answeredCount,
    markedCount,
    onConfirm,
    onCancel,
}: SubmitModalProps) {
    const unanswered = totalQuestions - answeredCount;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Submit Exam?</h2>
                </div>

                <div className="modal-body">
                    <p style={{ marginBottom: 'var(--spacing-4)' }}>
                        Are you sure you want to submit your exam? This action cannot be undone.
                    </p>

                    <div className="stats-grid" style={{ marginBottom: 'var(--spacing-4)' }}>
                        <div className="stat-card">
                            <div className="stat-value success">{answeredCount}</div>
                            <div className="stat-label">Answered</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value error">{unanswered}</div>
                            <div className="stat-label">Unanswered</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value warning">{markedCount}</div>
                            <div className="stat-label">Marked</div>
                        </div>
                    </div>

                    {unanswered > 0 && (
                        <div style={{
                            background: 'var(--color-warning-bg)',
                            border: '1px solid var(--color-warning)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-3)',
                            color: 'var(--color-warning)',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            ⚠️ You have {unanswered} unanswered question{unanswered > 1 ? 's' : ''}.
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>
                        Continue Exam
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm}>
                        Submit Exam
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SubmitModal;
