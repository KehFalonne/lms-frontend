export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_ANSWER"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "NUMERIC"
  | "MATCHING"
  | "FILL_BLANK";

export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_GRADED"
  | "MANUAL_GRADING"
  | "GRADED"
  | "EXPIRED"
  | "INVALIDATED";

export interface MyAssessmentLastAttempt {
  id: string;
  status: AttemptStatus;
  totalScore: string;
  percentage: string;
  submittedAt: string | null;
}

export interface MyAssessment {
  id: string;
  title: string;
  description: string;
  courseOfferingId: string;
  courseCode: string;
  courseTitle: string;
  assessmentType: string;
  totalPoints: string;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  attemptsUsed: number;
  availableFrom: string | null;
  availableUntil: string | null;
  passingScore: string;
  canStart: boolean;
  lastAttempt: MyAssessmentLastAttempt | null;
  isCodeGated?: boolean;
  caOpensAt?: string | null;
}

export interface AssessmentDetail {
  id: string;
  title: string;
  description: string;
  instructions: string;
  assessmentType: string;
  totalPoints: string;
  availableFrom: string | null;
  availableUntil: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  attemptsUsed: number;
  canStart: boolean;
  passingScore: string;
  // ── Staff-only fields (missing when a student fetches the same endpoint) ──
  status?: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  publishedAt?: string | null;
  questionCount?: number;
  isCodeGated?: boolean;
  hasAccessCode?: boolean;
  caOpensAt?: string | null;
  caLastEntryAt?: string | null;
  serveQuestionCount?: number | null;
  randomizeQuestionOrder?: boolean;
}

export interface AttemptLiveQuestion {
  id: string; // assessment-question ID
  questionId: string; // underlying question ID
  position: number;
  points: string;
  questionType: QuestionType;
  text: string;
  options: { id: string; text: string; position: number }[];
  blankCount: number | null;
  matchingPairs: { left: string }[];
}

export interface AttemptAnswerState {
  answerText: string;
  selectedOptionIds: string[];
  numericAnswer: string | null;
  answerData: Record<string, unknown>;
}

export interface AttemptLive {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  timeLimitMinutes: number | null;
  startedAt: string;
  expiresAt: string | null;
  status: AttemptStatus;
  totalPoints: string;
  questions: AttemptLiveQuestion[];
  answers: Record<string, AttemptAnswerState>;
}

export interface AttemptResult {
  id: string;
  assessment: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  totalScore: string;
  percentage: string;
  gradedAt: string | null;
}
