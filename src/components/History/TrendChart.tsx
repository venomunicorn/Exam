import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AttemptData {
    id: number;
    date: string;
    score: number;
    paperId: string;
}

interface ScoreTrendChartProps {
    attempts: AttemptData[];
}

export function ScoreTrendChart({ attempts }: ScoreTrendChartProps) {
    // Sort by date ascending
    const sorted = [...attempts].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sorted.map((_, i) => `#${i + 1}`);
    const scores = sorted.map((a) => a.score);

    // Calculate moving average
    const movingAvg = scores.map((_, i) => {
        const start = Math.max(0, i - 2);
        const slice = scores.slice(start, i + 1);
        return slice.reduce((sum, s) => sum + s, 0) / slice.length;
    });

    const data = {
        labels,
        datasets: [
            {
                label: 'Score',
                data: scores,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            },
            {
                label: 'Trend',
                data: movingAvg,
                borderColor: 'rgba(16, 185, 129, 0.8)',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.8)' },
            },
            y: {
                min: 0,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.6)' },
            },
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: 16,
                },
            },
            tooltip: {
                callbacks: {
                    afterLabel: (context: { dataIndex: number }) => {
                        return `Exam: ${sorted[context.dataIndex]?.paperId || ''}`;
                    },
                },
            },
        },
    };

    if (attempts.length < 2) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-8)',
                color: 'var(--color-text-muted)',
            }}>
                Complete at least 2 exams to see your score trend
            </div>
        );
    }

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <Line data={data} options={options} />
        </div>
    );
}

interface PerformanceStats {
    totalAttempts: number;
    avgScore: number;
    bestScore: number;
    worstScore: number;
    completedExams: number;
    improvement: number; // percentage change from first to last
}

export function calculateStats(attempts: AttemptData[]): PerformanceStats {
    if (attempts.length === 0) {
        return {
            totalAttempts: 0,
            avgScore: 0,
            bestScore: 0,
            worstScore: 0,
            completedExams: 0,
            improvement: 0,
        };
    }

    const scores = attempts.map((a) => a.score);
    const sorted = [...attempts].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstScore = sorted[0]?.score || 0;
    const lastScore = sorted[sorted.length - 1]?.score || 0;
    const improvement = firstScore !== 0
        ? ((lastScore - firstScore) / Math.abs(firstScore)) * 100
        : 0;

    return {
        totalAttempts: attempts.length,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        completedExams: attempts.length,
        improvement: Math.round(improvement),
    };
}
