import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamStore } from '@/store/examStore';
import { evaluateExam } from '@/utils/evaluation';
import { formatTime } from '@/utils/timeUtils';
import type { ExamResult } from '@/types/exam';
import TopicWiseTable from '@/components/Results/TopicWiseTable';
import QuestionReview from '@/components/Results/QuestionReview';
import { ScoreDonutChart, TopicBarChart, TimeDistributionChart } from '@/components/Results/Charts';

function ResultsPage() {
    const { paperId } = useParams<{ paperId: string }>();
    const navigate = useNavigate();
    const { paper, questions, questionStates, status, resetExam } = useExamStore();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'questions'>('overview');

    useEffect(() => {
        if (!paper || status !== 'submitted') {
            navigate(`/exam/${paperId}/confirm`);
            return;
        }

        const examResult = evaluateExam(paper, questions, questionStates);
        setResult(examResult);
    }, [paper, questions, questionStates, status, paperId, navigate]);

    const handleRetakeExam = () => {
        resetExam();
        navigate(`/exam/${paperId}/confirm`);
    };

    const handleGoHome = () => {
        resetExam();
        navigate('/');
    };

    if (!result) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}>
                <div className="card">Calculating results...</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
                <h1 style={{ marginBottom: 'var(--spacing-2)' }}>
                    Exam Results
                </h1>
                <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)' }}>
                    {result.paperLabel}
                </p>
            </header>

            {/* Overall Score Card */}
            <div className="card animate-slide-up" style={{
                maxWidth: '900px',
                margin: '0 auto var(--spacing-8)',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: 'var(--font-size-4xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    marginBottom: 'var(--spacing-2)',
                    background: result.percentage >= 50
                        ? 'linear-gradient(135deg, var(--color-success), var(--color-info))'
                        : 'linear-gradient(135deg, var(--color-warning), var(--color-error))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    {result.totalScore.toFixed(2)} / {result.maxScore}
                </div>
                <p style={{
                    fontSize: 'var(--font-size-xl)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-6)',
                }}>
                    {result.percentage.toFixed(1)}% Score
                </p>

                {/* Stats Grid */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="stat-card">
                        <div className="stat-value success">{result.correctCount}</div>
                        <div className="stat-label">Correct</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value error">{result.incorrectCount}</div>
                        <div className="stat-label">Incorrect</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{result.unattemptedCount}</div>
                        <div className="stat-label">Unattempted</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value info">{result.accuracy.toFixed(1)}%</div>
                        <div className="stat-label">Accuracy</div>
                    </div>
                </div>

                {/* Time Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--spacing-8)',
                    padding: 'var(--spacing-4)',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                }}>
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                            Time Used
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {formatTime(result.totalTimeUsedSeconds)}
                        </p>
                    </div>
                    <div style={{
                        width: '1px',
                        background: 'var(--color-border)',
                    }} />
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                            Avg. per Question
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {result.avgTimePerQuestion}s
                        </p>
                    </div>
                    <div style={{
                        width: '1px',
                        background: 'var(--color-border)',
                    }} />
                    <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                            Questions Attempted
                        </p>
                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {result.attemptedQuestions} / {result.totalQuestions}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-2)',
                    marginBottom: 'var(--spacing-6)',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: 'var(--spacing-2)',
                }}>
                    {[
                        { id: 'overview', label: '📊 Overview' },
                        { id: 'topics', label: '📚 Topic Analysis' },
                        { id: 'questions', label: '📝 Question Review' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'overview' && (
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--spacing-6)' }}>Performance Summary</h3>

                            {/* Charts Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 2fr',
                                gap: 'var(--spacing-6)',
                                marginBottom: 'var(--spacing-6)',
                            }}>
                                {/* Score Donut */}
                                <div style={{
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--spacing-4)',
                                }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-3)', textAlign: 'center' }}>
                                        Answer Distribution
                                    </h4>
                                    <ScoreDonutChart
                                        correct={result.correctCount}
                                        incorrect={result.incorrectCount}
                                        unattempted={result.unattemptedCount}
                                    />
                                </div>

                                {/* Topic Bar Chart */}
                                <div style={{
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--spacing-4)',
                                }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-3)' }}>
                                        Topic Performance
                                    </h4>
                                    <TopicBarChart topicStats={result.topicStats} />
                                </div>
                            </div>

                            {/* Time Distribution Chart */}
                            <div style={{
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-4)',
                                marginBottom: 'var(--spacing-6)',
                            }}>
                                <h4 style={{ marginBottom: 'var(--spacing-3)' }}>
                                    Time Spent per Question
                                </h4>
                                <TimeDistributionChart
                                    questions={result.questionResults.map(r => ({
                                        qId: r.questionId,
                                        time: r.timeSpentSeconds,
                                        correct: r.isCorrect,
                                    }))}
                                />
                            </div>

                            {/* Progress Bars */}
                            <div style={{ marginBottom: 'var(--spacing-6)' }}>
                                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 'var(--spacing-2)',
                                    }}>
                                        <span>Score Progress</span>
                                        <span>{result.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${Math.max(0, result.percentage)}%` }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 'var(--spacing-2)',
                                    }}>
                                        <span>Accuracy</span>
                                        <span>{result.accuracy.toFixed(1)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${result.accuracy}%`,
                                                background: result.accuracy >= 70
                                                    ? 'var(--color-success)'
                                                    : result.accuracy >= 50
                                                        ? 'var(--color-warning)'
                                                        : 'var(--color-error)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Weak/Strong Areas */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                                <div style={{
                                    background: 'var(--color-success-bg)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--spacing-4)',
                                }}>
                                    <h4 style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-3)' }}>
                                        💪 Strong Areas
                                    </h4>
                                    <ul style={{ paddingLeft: 'var(--spacing-4)' }}>
                                        {result.topicStats
                                            .filter((t) => t.strength === 'strong')
                                            .slice(0, 5)
                                            .map((t) => (
                                                <li key={t.topic} style={{ color: 'var(--color-text-secondary)' }}>
                                                    {t.topic} ({t.accuracy.toFixed(0)}%)
                                                </li>
                                            ))}
                                        {result.topicStats.filter((t) => t.strength === 'strong').length === 0 && (
                                            <li style={{ color: 'var(--color-text-muted)' }}>None identified yet</li>
                                        )}
                                    </ul>
                                </div>

                                <div style={{
                                    background: 'var(--color-error-bg)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--spacing-4)',
                                }}>
                                    <h4 style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-3)' }}>
                                        📈 Needs Improvement
                                    </h4>
                                    <ul style={{ paddingLeft: 'var(--spacing-4)' }}>
                                        {result.topicStats
                                            .filter((t) => t.strength === 'weak')
                                            .slice(0, 5)
                                            .map((t) => (
                                                <li key={t.topic} style={{ color: 'var(--color-text-secondary)' }}>
                                                    {t.topic} ({t.accuracy.toFixed(0)}%)
                                                </li>
                                            ))}
                                        {result.topicStats.filter((t) => t.strength === 'weak').length === 0 && (
                                            <li style={{ color: 'var(--color-text-muted)' }}>Great job! None identified</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'topics' && (
                        <TopicWiseTable topicStats={result.topicStats} />
                    )}

                    {activeTab === 'questions' && (
                        <QuestionReview
                            questionResults={result.questionResults}
                            questions={questions}
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--spacing-4)',
                    marginTop: 'var(--spacing-8)',
                }}>
                    <button className="btn btn-secondary" onClick={handleGoHome}>
                        ← Back to Home
                    </button>
                    <button className="btn btn-primary" onClick={handleRetakeExam}>
                        Retake Exam →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResultsPage;
