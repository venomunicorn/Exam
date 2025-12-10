import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamStore } from '@/store/examStore';
import { useAuthStore } from '@/store/authStore';
import { attemptsApi } from '@/api/client';
import Timer from '@/components/ExamPlayer/Timer';
import QuestionDisplay from '@/components/ExamPlayer/QuestionDisplay';
import NavigationPanel from '@/components/ExamPlayer/NavigationPanel';
import SubmitModal from '@/components/ExamPlayer/SubmitModal';

function ExamPage() {
    const { paperId } = useParams<{ paperId: string }>();
    const navigate = useNavigate();
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const lastSaveRef = useRef<number>(Date.now());
    const attemptIdRef = useRef<number | null>(null);

    const { isAuthenticated } = useAuthStore();

    const {
        paper,
        status,
        remainingTimeSeconds,
        currentQuestionIndex,
        questions,
        questionStates,
        updateRemainingTime,
        nextQuestion,
        previousQuestion,
        goToQuestion,
        submitExam,
        getCurrentQuestion,
        getTotalAnswered,
        getTotalMarkedForReview,
    } = useExamStore();

    // Redirect if no exam is loaded
    useEffect(() => {
        if (!paper || status === 'not_started') {
            navigate(`/exam/${paperId}/confirm`);
        } else if (status === 'submitted') {
            navigate(`/exam/${paperId}/results`);
        }
    }, [paper, status, paperId, navigate]);

    // Start attempt on backend if authenticated
    useEffect(() => {
        if (isAuthenticated && paper && status === 'in_progress' && !attemptIdRef.current) {
            attemptsApi.start(paper.paper_id)
                .then((res) => {
                    attemptIdRef.current = res.attemptId;
                    console.log('Attempt started:', res.attemptId);
                })
                .catch((err) => console.warn('Failed to start attempt:', err));
        }
    }, [isAuthenticated, paper, status]);

    // Timer countdown
    useEffect(() => {
        if (status !== 'in_progress') return;

        const interval = setInterval(() => {
            updateRemainingTime(remainingTimeSeconds - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [status, remainingTimeSeconds, updateRemainingTime]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (remainingTimeSeconds <= 0 && status === 'in_progress') {
            handleSubmit();
        }
    }, [remainingTimeSeconds, status]);

    // Autosave every 30 seconds
    useEffect(() => {
        if (status !== 'in_progress' || !isAuthenticated || !attemptIdRef.current) return;

        const saveInterval = setInterval(() => {
            const now = Date.now();
            if (now - lastSaveRef.current >= 30000) {
                saveProgress();
                lastSaveRef.current = now;
            }
        }, 10000); // Check every 10s, save if 30s elapsed

        return () => clearInterval(saveInterval);
    }, [status, isAuthenticated, questionStates]);

    const saveProgress = async () => {
        if (!attemptIdRef.current) return;

        try {
            const answers: Record<string, unknown> = {};
            const times: Record<string, number> = {};

            questionStates.forEach((state, qId) => {
                answers[qId] = state.answer;
                times[qId] = state.timeSpentSeconds;
            });

            await attemptsApi.saveProgress(attemptIdRef.current, answers, times);
            console.log('Progress saved');
        } catch (err) {
            console.warn('Autosave failed:', err);
        }
    };

    // Fullscreen handling
    const enterFullscreen = useCallback(async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } catch (err) {
            console.warn('Fullscreen not supported or denied');
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const inFullscreen = !!document.fullscreenElement;
            setIsFullscreen(inFullscreen);

            // Count fullscreen exits as potential cheating
            if (!inFullscreen && status === 'in_progress') {
                setTabSwitchCount(c => c + 1);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [status]);

    // Visibility API - detect tab switches
    useEffect(() => {
        if (status !== 'in_progress') return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount(c => c + 1);
                setShowTabWarning(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [status]);

    // Beforeunload warning
    useEffect(() => {
        if (status !== 'in_progress') return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Your exam is in progress. Are you sure you want to leave?';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [status]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent common shortcuts that might exit
            if (e.key === 'Escape') {
                e.preventDefault();
                return;
            }

            if (e.key === 'ArrowRight' || e.key === 'n') {
                nextQuestion();
            } else if (e.key === 'ArrowLeft' || e.key === 'p') {
                previousQuestion();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextQuestion, previousQuestion]);

    const handleSubmit = async () => {
        // Save final state to backend
        if (attemptIdRef.current && isAuthenticated) {
            try {
                const answers: Record<string, unknown> = {};
                const times: Record<string, number> = {};

                questionStates.forEach((state, qId) => {
                    answers[qId] = state.answer;
                    times[qId] = state.timeSpentSeconds;
                });

                await attemptsApi.submit(attemptIdRef.current, answers, times, {
                    totalScore: 0, // Will be calculated on results page
                    tabSwitchCount,
                });
            } catch (err) {
                console.warn('Submit to backend failed:', err);
            }
        }

        submitExam();
        navigate(`/exam/${paperId}/results`);
    };

    const currentQuestion = getCurrentQuestion();

    if (!paper || !currentQuestion) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}>
                <div className="card">Loading exam...</div>
            </div>
        );
    }

    return (
        <>
            {/* Tab Switch Warning */}
            {showTabWarning && (
                <div className="modal-overlay" style={{ zIndex: 1001 }}>
                    <div className="modal animate-slide-up">
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ color: 'var(--color-error)' }}>
                                ⚠️ Warning: Tab Switch Detected
                            </h2>
                        </div>
                        <div className="modal-body">
                            <p>
                                You switched away from the exam. This has been recorded.
                            </p>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                                Tab switches: <strong>{tabSwitchCount}</strong>
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowTabWarning(false);
                                    enterFullscreen();
                                }}
                            >
                                Return to Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen warning overlay */}
            {!isFullscreen && status === 'in_progress' && !showTabWarning && (
                <div className="fullscreen-overlay">
                    <h2>⚠️ Fullscreen Required</h2>
                    <p>
                        Please return to fullscreen mode to continue your exam.
                        The timer is still running.
                    </p>
                    {tabSwitchCount > 0 && (
                        <p style={{ color: 'var(--color-warning)', marginTop: 'var(--spacing-2)' }}>
                            ⚠️ Tab switches recorded: {tabSwitchCount}
                        </p>
                    )}
                    <button className="btn btn-primary" onClick={enterFullscreen}>
                        Enter Fullscreen
                    </button>
                </div>
            )}

            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header className="exam-header">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        maxWidth: '1400px',
                        margin: '0 auto',
                    }}>
                        <div>
                            <h1 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-1)' }}>
                                {paper.label}
                            </h1>
                            <p style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-muted)'
                            }}>
                                {currentQuestion.sectionTitle}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: 'var(--spacing-1)',
                                }}>
                                    Answered: {getTotalAnswered()} / {questions.length}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-warning)',
                                }}>
                                    Marked: {getTotalMarkedForReview()}
                                </div>
                            </div>

                            <Timer
                                remainingSeconds={remainingTimeSeconds}
                                totalSeconds={paper.duration_minutes * 60}
                            />

                            <button
                                className="btn btn-danger"
                                onClick={() => setShowSubmitModal(true)}
                            >
                                Submit Exam
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="exam-container" style={{ flex: 1, overflow: 'hidden' }}>
                    {/* Question Panel */}
                    <QuestionDisplay
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        onNext={nextQuestion}
                        onPrevious={previousQuestion}
                        isFirst={currentQuestionIndex === 0}
                        isLast={currentQuestionIndex === questions.length - 1}
                    />

                    {/* Navigation Panel */}
                    <NavigationPanel
                        questions={questions}
                        currentIndex={currentQuestionIndex}
                        onQuestionSelect={goToQuestion}
                    />
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitModal && (
                <SubmitModal
                    totalQuestions={questions.length}
                    answeredCount={getTotalAnswered()}
                    markedCount={getTotalMarkedForReview()}
                    onConfirm={handleSubmit}
                    onCancel={() => setShowSubmitModal(false)}
                />
            )}
        </>
    );
}

export default ExamPage;

