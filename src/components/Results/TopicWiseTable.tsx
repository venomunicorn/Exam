import type { TopicStats } from '@/types/exam';

interface TopicWiseTableProps {
    topicStats: TopicStats[];
}

function TopicWiseTable({ topicStats }: TopicWiseTableProps) {
    return (
        <div className="card">
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Topic-wise Performance</h3>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Topic</th>
                            <th style={{ textAlign: 'center' }}>Questions</th>
                            <th style={{ textAlign: 'center' }}>Correct</th>
                            <th style={{ textAlign: 'center' }}>Incorrect</th>
                            <th style={{ textAlign: 'center' }}>Unattempted</th>
                            <th style={{ textAlign: 'center' }}>Accuracy</th>
                            <th style={{ textAlign: 'center' }}>Avg Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topicStats.map((stats) => (
                            <tr key={stats.topic}>
                                <td>
                                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                        {stats.topic}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>{stats.totalQuestions}</td>
                                <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>
                                    {stats.correctCount}
                                </td>
                                <td style={{ textAlign: 'center', color: 'var(--color-error)' }}>
                                    {stats.incorrectCount}
                                </td>
                                <td style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    {stats.unattemptedCount}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        color: stats.accuracy >= 70
                                            ? 'var(--color-success)'
                                            : stats.accuracy >= 50
                                                ? 'var(--color-warning)'
                                                : 'var(--color-error)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                    }}>
                                        {stats.accuracy.toFixed(1)}%
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {stats.avgTimePerQuestion}s
                                </td>
                                <td>
                                    <span className={`tag ${stats.strength === 'strong'
                                            ? 'tag-success'
                                            : stats.strength === 'weak'
                                                ? 'tag-error'
                                                : 'tag-warning'
                                        }`}>
                                        {stats.strength === 'strong' ? '💪 Strong' :
                                            stats.strength === 'weak' ? '📈 Weak' :
                                                '➡️ Moderate'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {topicStats.length === 0 && (
                <p style={{
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    padding: 'var(--spacing-8)',
                }}>
                    No topic data available
                </p>
            )}
        </div>
    );
}

export default TopicWiseTable;
