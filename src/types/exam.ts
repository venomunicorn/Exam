// ============================================
// GATE TestPrep Engine - Type Definitions
// ============================================

// Question Types
export type QuestionType = 'mcq_single' | 'mcq_multi' | 'nat';

// Correct Answer Variants
export type CorrectAnswer =
    | { type: 'mcq_single'; correct_option_index: number }
    | { type: 'mcq_multi'; correct_option_indices: number[] }
    | { type: 'nat'; accepted_ranges: Array<{ min: number; max: number }> };

// Marking Scheme
export interface MarksScheme {
    marks_correct: number;
    marks_incorrect: number;
    marks_unattempted: number;
}

// Individual Question
export interface Question {
    question_id: string;
    index: number;
    type: QuestionType;
    question_text: string;
    image?: string | null;
    options: string[];
    correct_answer: CorrectAnswer;
    marks_scheme: MarksScheme;
    topics: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    tags: string[];
}

// Section within an Exam
export interface Section {
    section_id: string;
    title: string;
    order: number;
    questions: Question[];
}

// Complete Exam Paper
export interface ExamPaper {
    exam_id: string;
    paper_id: string;
    year: number;
    label: string;
    type: 'PYQ' | 'Mock';
    duration_minutes: number;
    total_marks: number;
    sections: Section[];
}

// User Answer Types
export type UserAnswer =
    | { type: 'mcq_single'; selectedIndex: number | null }
    | { type: 'mcq_multi'; selectedIndices: number[] }
    | { type: 'nat'; value: number | null }
    | { type: 'none' };

// Question Attempt State
export interface QuestionAttemptState {
    questionId: string;
    answer: UserAnswer;
    timeSpentSeconds: number;
    markedForReview: boolean;
    visited: boolean;
}

// Question Status for Navigation Panel
export type QuestionStatus =
    | 'not_visited'
    | 'answered'
    | 'not_answered'
    | 'marked_for_review'
    | 'answered_and_marked';

// Evaluation Result for Single Question
export interface QuestionEvaluationResult {
    questionId: string;
    isCorrect: boolean;
    marksObtained: number;
    userAnswer: UserAnswer;
    correctAnswer: CorrectAnswer;
    timeSpentSeconds: number;
    topics: string[];
}

// Topic-wise Statistics
export interface TopicStats {
    topic: string;
    totalQuestions: number;
    attemptedQuestions: number;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    marksObtained: number;
    maxMarks: number;
    accuracy: number; // percentage
    totalTimeSeconds: number;
    avgTimePerQuestion: number;
    strength: 'weak' | 'moderate' | 'strong';
}

// Overall Exam Result
export interface ExamResult {
    paperId: string;
    paperLabel: string;
    // Overall Stats
    totalScore: number;
    maxScore: number;
    percentage: number;
    totalQuestions: number;
    attemptedQuestions: number;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    accuracy: number; // correct / attempted
    totalTimeUsedSeconds: number;
    totalTimeAllowedSeconds: number;
    avgTimePerQuestion: number;
    // Breakdown
    topicStats: TopicStats[];
    questionResults: QuestionEvaluationResult[];
}

// Exam Status
export type ExamStatus = 'not_started' | 'in_progress' | 'submitted';

// Flattened Question (for easy access during exam)
export interface FlattenedQuestion extends Question {
    sectionId: string;
    sectionTitle: string;
    globalIndex: number; // 0-based index across all sections
}

// Exam Catalog Types
export interface ExamInfo {
    exam_id: string;
    name: string;
    description: string;
}

export interface PaperInfo {
    paper_id: string;
    label: string;
    year: number;
    type: 'PYQ' | 'Mock';
    duration_minutes: number;
    total_questions: number;
    total_marks: number;
}

export interface ExamCatalogEntry extends ExamInfo {
    papers: PaperInfo[];
}
