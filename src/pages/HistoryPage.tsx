import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { attemptsApi } from '@/api/client';
import { ScoreTrendChart, calculateStats } from '@/components/History/TrendChart';

interface AttemptRecord {
    id: number;
    paperId: string;
    status: string;
    startedAt: string;
    endedAt?: string;
    finalScore?: number;
}

function HistoryPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadAttempts();
    }, [isAuthenticated, navigate]);

    const loadAttempts = async () => {
        try {
            setLoading(true);
            const data = await attemptsApi.list();
            setAttempts(data.sort((a, b) =>
                new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const chartData = useMemo(() =>
        attempts
            .filter(a => a.status === 'completed' && a.finalScore !== undefined)
            .map(a => ({
                id: a.id,
                date: a.startedAt,
                score: a.finalScore!,
                paperId: a.paperId,
            })),
        [attempts]
    );

    const stats = useMemo(() => calculateStats(chartData), [chartData]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                    Loading history...
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
            <header style={{ marginBottom: 'var(--spacing-6)' }}>
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/')}
                    style={{ marginBottom: 'var(--spacing-4)' }}
                >
                    ← Back to Home
                </button>
                <h1>Exam History</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Track your progress and performance over time
                </p>
            </header>

            {error ? (
                <div className="card" style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-8)',
                    borderColor: 'var(--color-error)',
                }}>
                    <p style={{ color: 'var(--color-error)' }}>{error}</p>
                    <button className="btn btn-primary" onClick={loadAttempts} style={{ marginTop: 'var(--spacing-4)' }}>
                        Retry
                    </button>
                </div>
            ) : attempts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-4)' }}>No attempts yet</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                        Start an exam to see your history here
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Browse Exams
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalAttempts}</div>
                            <div className="stat-label">Total Attempts</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value info">{stats.avgScore.toFixed(1)}</div>
                            <div className="stat-label">Average Score</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value success">{stats.bestScore.toFixed(1)}</div>
                            <div className="stat-label">Best Score</div>
                        </div>
                        <div className="stat-card">
                            <div className={`stat-value ${stats.improvement >= 0 ? 'success' : 'error'}`}>
                                {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
                            </div>
                            <div className="stat-label">Improvement</div>
                        </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>📈 Score Trend</h3>
                        <ScoreTrendChart attempts={chartData} />
                    </div>

                    {/* Attempt List */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>📋 Recent Attempts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            {attempts.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="card-hover"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-4)',
                                        background: 'var(--color-bg-secondary)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => navigate(`/history/${attempt.id}`)}
                                >
                                    <div>
                                        <h4 style={{ marginBottom: 'var(--spacing-1)' }}>
                                            {attempt.paperId}
                                        </h4>
                                        <p style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            {formatDate(attempt.startedAt)}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                                        <span className={`tag ${attempt.status === 'completed' ? 'tag-success' : 'tag-warning'}`}>
                                            {attempt.status}
                                        </span>

                                        {attempt.finalScore !== undefined && (
                                            <div style={{
                                                fontSize: 'var(--font-size-xl)',
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: attempt.finalScore >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                                                minWidth: '60px',
                                                textAlign: 'right',
                                            }}>
                                                {attempt.finalScore.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default HistoryPage;

