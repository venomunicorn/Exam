import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    ExamPaper,
    FlattenedQuestion,
    UserAnswer,
    QuestionAttemptState,
    ExamStatus,
    QuestionStatus,
} from '@/types/exam';

// Flatten questions from sections for easy access
function flattenQuestions(paper: ExamPaper): FlattenedQuestion[] {
    const flattened: FlattenedQuestion[] = [];
    let globalIndex = 0;

    for (const section of paper.sections) {
        for (const question of section.questions) {
            flattened.push({
                ...question,
                sectionId: section.section_id,
                sectionTitle: section.title,
                globalIndex,
            });
            globalIndex++;
        }
    }

    return flattened;
}

interface ExamState {
    // Exam Data
    paper: ExamPaper | null;
    questions: FlattenedQuestion[];

    // Attempt State
    status: ExamStatus;
    currentQuestionIndex: number;
    questionStates: Map<string, QuestionAttemptState>;

    // Timing
    remainingTimeSeconds: number;
    lastViewStart: number; // timestamp when current question started being viewed

    // Actions
    loadExam: (paper: ExamPaper) => void;
    startExam: () => void;

    // Navigation
    goToQuestion: (index: number) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;

    // Answer Management
    setAnswer: (questionId: string, answer: UserAnswer) => void;
    clearAnswer: (questionId: string) => void;
    toggleMarkForReview: (questionId: string) => void;

    // Timing
    updateRemainingTime: (seconds: number) => void;
    recordTimeSpent: () => void;

    // Submission
    submitExam: () => void;

    // Queries
    getQuestionStatus: (questionId: string) => QuestionStatus;
    getQuestionState: (questionId: string) => QuestionAttemptState | undefined;
    getCurrentQuestion: () => FlattenedQuestion | null;
    getTotalAnswered: () => number;
    getTotalMarkedForReview: () => number;

    // Reset
    resetExam: () => void;
}

const initialQuestionState = (questionId: string): QuestionAttemptState => ({
    questionId,
    answer: { type: 'none' },
    timeSpentSeconds: 0,
    markedForReview: false,
    visited: false,
});

export const useExamStore = create<ExamState>()(
    persist(
        (set, get) => ({
            // Initial State
            paper: null,
            questions: [],
            status: 'not_started',
            currentQuestionIndex: 0,
            questionStates: new Map(),
            remainingTimeSeconds: 0,
            lastViewStart: 0,

            // Load exam paper
            loadExam: (paper: ExamPaper) => {
                const questions = flattenQuestions(paper);
                const questionStates = new Map<string, QuestionAttemptState>();

                for (const q of questions) {
                    questionStates.set(q.question_id, initialQuestionState(q.question_id));
                }

                set({
                    paper,
                    questions,
                    questionStates,
                    remainingTimeSeconds: paper.duration_minutes * 60,
                    status: 'not_started',
                    currentQuestionIndex: 0,
                });
            },

            // Start the exam
            startExam: () => {
                const { questions, questionStates } = get();
                if (questions.length === 0) return;

                // Mark first question as visited
                const firstQ = questions[0];
                const state = questionStates.get(firstQ.question_id);
                if (state) {
                    state.visited = true;
                    questionStates.set(firstQ.question_id, state);
                }

                set({
                    status: 'in_progress',
                    lastViewStart: Date.now(),
                    questionStates: new Map(questionStates),
                });
            },

            // Navigate to specific question
            goToQuestion: (index: number) => {
                const { questions, questionStates, status } = get();
                if (index < 0 || index >= questions.length || status !== 'in_progress') return;

                // Record time spent on current question
                get().recordTimeSpent();

                // Mark new question as visited
                const newQ = questions[index];
                const state = questionStates.get(newQ.question_id);
                if (state) {
                    state.visited = true;
                    questionStates.set(newQ.question_id, state);
                }

                set({
                    currentQuestionIndex: index,
                    lastViewStart: Date.now(),
                    questionStates: new Map(questionStates),
                });
            },

            nextQuestion: () => {
                const { currentQuestionIndex, questions } = get();
                if (currentQuestionIndex < questions.length - 1) {
                    get().goToQuestion(currentQuestionIndex + 1);
                }
            },

            previousQuestion: () => {
                const { currentQuestionIndex } = get();
                if (currentQuestionIndex > 0) {
                    get().goToQuestion(currentQuestionIndex - 1);
                }
            },

            // Set answer for a question
            setAnswer: (questionId: string, answer: UserAnswer) => {
                const { questionStates } = get();
                const state = questionStates.get(questionId);
                if (state) {
                    state.answer = answer;
                    questionStates.set(questionId, state);
                    set({ questionStates: new Map(questionStates) });
                }
            },

            // Clear answer
            clearAnswer: (questionId: string) => {
                const { questionStates } = get();
                const state = questionStates.get(questionId);
                if (state) {
                    state.answer = { type: 'none' };
                    questionStates.set(questionId, state);
                    set({ questionStates: new Map(questionStates) });
                }
            },

            // Toggle mark for review
            toggleMarkForReview: (questionId: string) => {
                const { questionStates } = get();
                const state = questionStates.get(questionId);
                if (state) {
                    state.markedForReview = !state.markedForReview;
                    questionStates.set(questionId, state);
                    set({ questionStates: new Map(questionStates) });
                }
            },

            // Update remaining time (called by timer interval)
            updateRemainingTime: (seconds: number) => {
                set({ remainingTimeSeconds: Math.max(0, seconds) });

                // Auto-submit when time runs out
                if (seconds <= 0) {
                    get().submitExam();
                }
            },

            // Record time spent on current question
            recordTimeSpent: () => {
                const { currentQuestionIndex, questions, questionStates, lastViewStart } = get();
                if (questions.length === 0) return;

                const currentQ = questions[currentQuestionIndex];
                const state = questionStates.get(currentQ.question_id);
                if (state && lastViewStart > 0) {
                    const delta = Math.floor((Date.now() - lastViewStart) / 1000);
                    state.timeSpentSeconds += delta;
                    questionStates.set(currentQ.question_id, state);
                    set({ questionStates: new Map(questionStates) });
                }
            },

            // Submit the exam
            submitExam: () => {
                const { status } = get();
                if (status !== 'in_progress') return;

                // Record final time spent
                get().recordTimeSpent();

                set({ status: 'submitted' });
            },

            // Get question status for navigation panel
            getQuestionStatus: (questionId: string): QuestionStatus => {
                const { questionStates } = get();
                const state = questionStates.get(questionId);
                if (!state) return 'not_visited';

                const hasAnswer = state.answer.type !== 'none';
                const isMarked = state.markedForReview;

                if (hasAnswer && isMarked) return 'answered_and_marked';
                if (isMarked) return 'marked_for_review';
                if (hasAnswer) return 'answered';
                if (state.visited) return 'not_answered';
                return 'not_visited';
            },

            getQuestionState: (questionId: string) => {
                return get().questionStates.get(questionId);
            },

            getCurrentQuestion: () => {
                const { questions, currentQuestionIndex } = get();
                return questions[currentQuestionIndex] || null;
            },

            getTotalAnswered: () => {
                const { questionStates } = get();
                let count = 0;
                questionStates.forEach((state) => {
                    if (state.answer.type !== 'none') count++;
                });
                return count;
            },

            getTotalMarkedForReview: () => {
                const { questionStates } = get();
                let count = 0;
                questionStates.forEach((state) => {
                    if (state.markedForReview) count++;
                });
                return count;
            },

            // Reset exam state
            resetExam: () => {
                set({
                    paper: null,
                    questions: [],
                    status: 'not_started',
                    currentQuestionIndex: 0,
                    questionStates: new Map(),
                    remainingTimeSeconds: 0,
                    lastViewStart: 0,
                });
            },
        }),
        {
            name: 'exam-storage',
            // Custom serializer for Map
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const data = JSON.parse(str);
                    // Convert questionStates array back to Map
                    if (data.state?.questionStates) {
                        data.state.questionStates = new Map(data.state.questionStates);
                    }
                    return data;
                },
                setItem: (name, value) => {
                    // Convert Map to array for serialization
                    const toStore = {
                        ...value,
                        state: {
                            ...value.state,
                            questionStates: value.state?.questionStates
                                ? Array.from(value.state.questionStates.entries())
                                : [],
                        },
                    };
                    localStorage.setItem(name, JSON.stringify(toStore));
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
        }
    )
);
