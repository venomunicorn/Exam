import { useState, useEffect } from 'react';

interface NATInputProps {
    value: number | null;
    onChange: (value: number | null) => void;
}

function NATInput({ value, onChange }: NATInputProps) {
    const [inputValue, setInputValue] = useState(value?.toString() ?? '');

    useEffect(() => {
        setInputValue(value?.toString() ?? '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (val === '' || val === '-') {
            onChange(null);
        } else {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                onChange(num);
            }
        }
    };

    return (
        <div className="nat-input-container">
            <p style={{
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--spacing-3)',
            }}>
                Enter your numerical answer (up to 2 decimal places)
            </p>
            <input
                type="text"
                className="input nat-input"
                value={inputValue}
                onChange={handleChange}
                placeholder="0.00"
                pattern="-?[0-9]*\.?[0-9]*"
            />
            <p style={{
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-xs)',
                marginTop: 'var(--spacing-2)',
            }}>
                Note: NAT questions have no negative marking
            </p>
        </div>
    );
}

export default NATInput;
