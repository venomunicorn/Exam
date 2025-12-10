interface MCQSingleInputProps {
    options: string[];
    selectedIndex: number | null;
    onChange: (index: number) => void;
}

function MCQSingleInput({ options, selectedIndex, onChange }: MCQSingleInputProps) {
    return (
        <div className="option-group">
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`option-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => onChange(index)}
                >
                    <div className="option-indicator">
                        {selectedIndex === index && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                                <circle cx="6" cy="6" r="4" />
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

export default MCQSingleInput;
