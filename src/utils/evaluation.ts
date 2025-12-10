import type {
    Question,
    UserAnswer,
    CorrectAnswer,
    ExamPaper,
    QuestionAttemptState,
    QuestionEvaluationResult,
    TopicStats,
    ExamResult,
    FlattenedQuestion,
} from '@/types/exam';

/**
 * Evaluate a single question answer
 */
export function evaluateQuestion(
    question: Question,
    userAnswer: UserAnswer
): { isCorrect: boolean; marksObtained: number } {
    const { correct_answer, marks_scheme } = question;

    // Unattempted
    if (userAnswer.type === 'none') {
        return {
            isCorrect: false,
            marksObtained: marks_scheme.marks_unattempted,
        };
    }

    // Type mismatch - treat as wrong
    if (userAnswer.type !== correct_answer.type) {
        return {
            isCorrect: false,
            marksObtained: marks_scheme.marks_incorrect,
        };
    }

    let isCorrect = false;

    switch (correct_answer.type) {
        case 'mcq_single': {
            const userAns = userAnswer as { type: 'mcq_single'; selectedIndex: number | null };
            isCorrect = userAns.selectedIndex === correct_answer.correct_option_index;
            break;
        }

        case 'mcq_multi': {
            const userAns = userAnswer as { type: 'mcq_multi'; selectedIndices: number[] };
            const correctSet = new Set(correct_answer.correct_option_indices);
            const userSet = new Set(userAns.selectedIndices);

            // Must match exactly
            isCorrect =
                correctSet.size === userSet.size &&
                [...correctSet].every((idx) => userSet.has(idx));
            break;
        }

        case 'nat': {
            const userAns = userAnswer as { type: 'nat'; value: number | null };
            if (userAns.value === null) {
                isCorrect = false;
            } else {
                // Check if value falls within any accepted range
                isCorrect = correct_answer.accepted_ranges.some(
                    (range) => userAns.value! >= range.min && userAns.value! <= range.max
                );
            }
            break;
        }
    }

    return {
        isCorrect,
        marksObtained: isCorrect
            ? marks_scheme.marks_correct
            : marks_scheme.marks_incorrect,
    };
}

/**
 * Calculate topic-wise statistics
 */
function calculateTopicStats(
    questions: FlattenedQuestion[],
    questionStates: Map<string, QuestionAttemptState>,
    evaluationResults: Map<string, QuestionEvaluationResult>
): TopicStats[] {
    const topicMap = new Map<string, TopicStats>();

    for (const question of questions) {
        const state = questionStates.get(question.question_id);
        const result = evaluationResults.get(question.question_id);
        if (!state || !result) continue;

        for (const topic of question.topics) {
            if (!topicMap.has(topic)) {
                topicMap.set(topic, {
                    topic,
                    totalQuestions: 0,
                    attemptedQuestions: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                    unattemptedCount: 0,
                    marksObtained: 0,
                    maxMarks: 0,
                    accuracy: 0,
                    totalTimeSeconds: 0,
                    avgTimePerQuestion: 0,
                    strength: 'moderate',
                });
            }

            const stats = topicMap.get(topic)!;
            stats.totalQuestions++;
            stats.maxMarks += question.marks_scheme.marks_correct;
            stats.totalTimeSeconds += state.timeSpentSeconds;

            if (state.answer.type === 'none') {
                stats.unattemptedCount++;
            } else {
                stats.attemptedQuestions++;
                stats.marksObtained += result.marksObtained;

                if (result.isCorrect) {
                    stats.correctCount++;
                } else {
                    stats.incorrectCount++;
                }
            }
        }
    }

    // Calculate derived values and strength
    const result: TopicStats[] = [];
    const MIN_QUESTIONS_THRESHOLD = 2;

    topicMap.forEach((stats) => {
        // Accuracy
        if (stats.attemptedQuestions > 0) {
            stats.accuracy = (stats.correctCount / stats.attemptedQuestions) * 100;
        }

        // Average time
        if (stats.totalQuestions > 0) {
            stats.avgTimePerQuestion = Math.round(stats.totalTimeSeconds / stats.totalQuestions);
        }

        // Strength classification
        if (stats.attemptedQuestions >= MIN_QUESTIONS_THRESHOLD) {
            if (stats.accuracy >= 80) {
                stats.strength = 'strong';
            } else if (stats.accuracy < 50) {
                stats.strength = 'weak';
            } else {
                stats.strength = 'moderate';
            }
        }

        result.push(stats);
    });

    // Sort by total questions (most to least)
    return result.sort((a, b) => b.totalQuestions - a.totalQuestions);
}

/**
 * Evaluate the entire exam and produce comprehensive results
 */
export function evaluateExam(
    paper: ExamPaper,
    questions: FlattenedQuestion[],
    questionStates: Map<string, QuestionAttemptState>
): ExamResult {
    const questionResults: QuestionEvaluationResult[] = [];
    const evaluationMap = new Map<string, QuestionEvaluationResult>();

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalTimeUsed = 0;

    // Evaluate each question
    for (const question of questions) {
        const state = questionStates.get(question.question_id);
        const userAnswer = state?.answer || { type: 'none' as const };
        const timeSpent = state?.timeSpentSeconds || 0;

        const { isCorrect, marksObtained } = evaluateQuestion(question, userAnswer);

        const result: QuestionEvaluationResult = {
            questionId: question.question_id,
            isCorrect,
            marksObtained,
            userAnswer,
            correctAnswer: question.correct_answer,
            timeSpentSeconds: timeSpent,
            topics: question.topics,
        };

        questionResults.push(result);
        evaluationMap.set(question.question_id, result);

        // Aggregate statistics
        totalScore += marksObtained;
        maxScore += question.marks_scheme.marks_correct;
        totalTimeUsed += timeSpent;

        if (userAnswer.type === 'none') {
            unattemptedCount++;
        } else if (isCorrect) {
            correctCount++;
        } else {
            incorrectCount++;
        }
    }

    // Calculate topic stats
    const topicStats = calculateTopicStats(questions, questionStates, evaluationMap);

    const attemptedQuestions = correctCount + incorrectCount;
    const accuracy = attemptedQuestions > 0
        ? (correctCount / attemptedQuestions) * 100
        : 0;

    return {
        paperId: paper.paper_id,
        paperLabel: paper.label,
        totalScore,
        maxScore,
        percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
        totalQuestions: questions.length,
        attemptedQuestions,
        correctCount,
        incorrectCount,
        unattemptedCount,
        accuracy,
        totalTimeUsedSeconds: totalTimeUsed,
        totalTimeAllowedSeconds: paper.duration_minutes * 60,
        avgTimePerQuestion: questions.length > 0
            ? Math.round(totalTimeUsed / questions.length)
            : 0,
        topicStats,
        questionResults,
    };
}

/**
 * Get display text for user answer
 */
export function formatUserAnswer(
    question: Question,
    userAnswer: UserAnswer
): string {
    if (userAnswer.type === 'none') {
        return 'Not Attempted';
    }

    switch (userAnswer.type) {
        case 'mcq_single':
            if (userAnswer.selectedIndex === null) return 'Not Attempted';
            return `Option ${String.fromCharCode(65 + userAnswer.selectedIndex)}`;

        case 'mcq_multi':
            if (userAnswer.selectedIndices.length === 0) return 'Not Attempted';
            return userAnswer.selectedIndices
                .map((idx) => String.fromCharCode(65 + idx))
                .sort()
                .join(', ');

        case 'nat':
            if (userAnswer.value === null) return 'Not Attempted';
            return String(userAnswer.value);

        default:
            return 'Unknown';
    }
}

/**
 * Get display text for correct answer
 */
export function formatCorrectAnswer(
    question: Question,
    correctAnswer: CorrectAnswer
): string {
    switch (correctAnswer.type) {
        case 'mcq_single':
            return `Option ${String.fromCharCode(65 + correctAnswer.correct_option_index)}`;

        case 'mcq_multi':
            return correctAnswer.correct_option_indices
                .map((idx) => String.fromCharCode(65 + idx))
                .sort()
                .join(', ');

        case 'nat':
            const ranges = correctAnswer.accepted_ranges
                .map((r) => (r.min === r.max ? `${r.min}` : `${r.min} to ${r.max}`))
                .join(' or ');
            return ranges;

        default:
            return 'Unknown';
    }
}
