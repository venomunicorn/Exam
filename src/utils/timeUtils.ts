/**
 * Format seconds into HH:MM:SS or MM:SS
 */
export function formatTime(totalSeconds: number, showHours = true): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (showHours && hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Get timer class based on remaining time
 */
export function getTimerClass(remainingSeconds: number, totalSeconds: number): string {
    const percentage = remainingSeconds / totalSeconds;

    if (percentage <= 0.05) return 'danger'; // Last 5%
    if (percentage <= 0.15) return 'warning'; // Last 15%
    return '';
}

/**
 * Calculate average time per question
 */
export function calculateAvgTimePerQuestion(
    totalTimeSeconds: number,
    questionCount: number
): number {
    if (questionCount === 0) return 0;
    return Math.round(totalTimeSeconds / questionCount);
}
