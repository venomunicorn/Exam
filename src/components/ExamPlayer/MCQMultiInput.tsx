interface MCQMultiInputProps {
    options: string[];
    selectedIndices: number[];
    onChange: (indices: number[]) => void;
}

function MCQMultiInput({ options, selectedIndices, onChange }: MCQMultiInputProps) {
    const handleToggle = (index: number) => {
        if (selectedIndices.includes(index)) {
            onChange(selectedIndices.filter((i) => i !== index));
        } else {
            onChange([...selectedIndices, index]);
        }
    };

    return (
        <div className="option-group">
            <p style={{
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--spacing-3)',
            }}>
                Select all that apply
            </p>
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`option-item ${selectedIndices.includes(index) ? 'selected' : ''}`}
                    onClick={() => handleToggle(index)}
                >
                    <div className="option-indicator checkbox">
                        {selectedIndices.includes(index) && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                                <path d="M11.5 3.5L5.5 10.5L2.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        )}
                    </div>
                    <div className="option-label">
                        <span style={{
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-accent-primary)',
                            marginRight: 'var(--spacing-2)',
                        }}>
                            {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default MCQMultiInput;
