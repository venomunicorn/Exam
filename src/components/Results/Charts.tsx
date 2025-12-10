import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import type { TopicStats } from '@/types/exam';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ScoreChartProps {
    correct: number;
    incorrect: number;
    unattempted: number;
}

export function ScoreDonutChart({ correct, incorrect, unattempted }: ScoreChartProps) {
    const data = {
        labels: ['Correct', 'Incorrect', 'Unattempted'],
        datasets: [
            {
                data: [correct, incorrect, unattempted],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',  // Emerald
                    'rgba(239, 68, 68, 0.8)',   // Red
                    'rgba(107, 114, 128, 0.8)', // Gray
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(107, 114, 128, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: 16,
                    font: { size: 12 },
                },
            },
        },
    };

    return (
        <div style={{ height: '250px', width: '100%' }}>
            <Doughnut data={data} options={options} />
        </div>
    );
}

interface TopicBarChartProps {
    topicStats: TopicStats[];
}

export function TopicBarChart({ topicStats }: TopicBarChartProps) {
    // Sort by accuracy and take top 10
    const sorted = [...topicStats]
        .filter(t => t.totalQuestions > 0)
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 10);

    const data = {
        labels: sorted.map(t =>
            t.topic.length > 20 ? t.topic.substring(0, 18) + '...' : t.topic
        ),
        datasets: [
            {
                label: 'Accuracy %',
                data: sorted.map(t => t.accuracy),
                backgroundColor: sorted.map(t =>
                    t.strength === 'strong'
                        ? 'rgba(16, 185, 129, 0.8)'
                        : t.strength === 'weak'
                            ? 'rgba(239, 68, 68, 0.8)'
                            : 'rgba(245, 158, 11, 0.8)'
                ),
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        scales: {
            x: {
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.8)',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div style={{ height: `${Math.max(200, sorted.length * 35)}px`, width: '100%' }}>
            <Bar data={data} options={options} />
        </div>
    );
}

interface TimeDistributionChartProps {
    questions: Array<{ qId: string; time: number; correct: boolean }>;
}

export function TimeDistributionChart({ questions }: TimeDistributionChartProps) {
    // Group by time ranges
    const ranges = [
        { label: '0-30s', min: 0, max: 30 },
        { label: '30-60s', min: 30, max: 60 },
        { label: '1-2min', min: 60, max: 120 },
        { label: '2-3min', min: 120, max: 180 },
        { label: '3-5min', min: 180, max: 300 },
        { label: '5min+', min: 300, max: Infinity },
    ];

    const correctCounts = ranges.map(r =>
        questions.filter(q => q.time >= r.min && q.time < r.max && q.correct).length
    );
    const incorrectCounts = ranges.map(r =>
        questions.filter(q => q.time >= r.min && q.time < r.max && !q.correct).length
    );

    const data = {
        labels: ranges.map(r => r.label),
        datasets: [
            {
                label: 'Correct',
                data: correctCounts,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 4,
            },
            {
                label: 'Incorrect',
                data: incorrectCounts,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.8)' },
            },
            y: {
                stacked: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    stepSize: 1,
                },
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
        },
    };

    return (
        <div style={{ height: '250px', width: '100%' }}>
            <Bar data={data} options={options} />
        </div>
    );
}
