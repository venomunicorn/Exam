import { formatTime, getTimerClass } from '@/utils/timeUtils';

interface TimerProps {
    remainingSeconds: number;
    totalSeconds: number;
}

function Timer({ remainingSeconds, totalSeconds }: TimerProps) {
    const timerClass = getTimerClass(remainingSeconds, totalSeconds);

    return (
        <div className={`timer ${timerClass}`}>
            <span style={{ fontSize: 'var(--font-size-lg)' }}>⏱️</span>
            <span>{formatTime(remainingSeconds)}</span>
        </div>
    );
}

export default Timer;
