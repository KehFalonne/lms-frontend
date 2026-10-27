import { get, post, put, patch, del } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AssessmentDetail,
  AttemptLive,
  AttemptResult,
  MyAssessment,
} from "../types/assessment.types";

export async function getMyAssessments() {
  return get<ApiResponse<MyAssessment[]>>("/my/assessments/");
}

export async function getAssessment(id: string) {
  return get<ApiResponse<AssessmentDetail>>(`/assessments/${id}/`);
}

export async function startAttempt(assessmentId: string) {
  return post<ApiResponse<AttemptLive>>(`/assessments/${assessmentId}/attempts/start/`);
}

export async function getLiveAttempt(attemptId: string) {
  return get<ApiResponse<AttemptLive>>(`/assessment-attempts/${attemptId}/live/`);
}

export async function getAttemptResult(attemptId: string) {
  return get<ApiResponse<AttemptResult>>(`/assessment-attempts/${attemptId}/`);
}

export interface SaveAnswerPayload {
  answerText?: string;
  selectedOptionIds?: string[];
  numericAnswer?: number | null;
  answerData?: Record<string, unknown>;
}

export async function saveAnswer(
  attemptId: string,
  assessmentQuestionId: string,
  payload: SaveAnswerPayload
) {
  return put<ApiResponse<unknown>>(
    `/assessment-attempts/${attemptId}/answers/${assessmentQuestionId}/`,
    payload
  );
}

export async function submitAttempt(attemptId: string) {
  return post<ApiResponse<AttemptResult>>(`/assessment-attempts/${attemptId}/submit/`);
}

// ── Lecturer endpoints ────────────────────────────────────────────

export interface CreateAssessmentPayload {
  title: string;
  description?: string;
  instructions?: string;
  assessmentType: "QUIZ" | "TEST" | "MIDTERM" | "FINAL_EXAM" | "PRACTICE";
  availableFrom?: string | null;
  availableUntil?: string | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  passingScore?: string;
}

export async function createAssessment(
  offeringId: string,
  payload: CreateAssessmentPayload
) {
  return post<ApiResponse<AssessmentDetail>>(
    endpoints.courseOfferings.assessments(offeringId),
    payload
  );
}

export async function updateAssessment(
  id: string,
  payload: Partial<CreateAssessmentPayload>
) {
  return patch<ApiResponse<AssessmentDetail>>(endpoints.assessments.detail(id), payload);
}

export async function publishAssessment(id: string) {
  return post<ApiResponse<AssessmentDetail>>(endpoints.assessments.publish(id));
}

export async function closeAssessment(id: string) {
  return post<ApiResponse<AssessmentDetail>>(endpoints.assessments.close(id));
}
// ── Question banks ────────────────────────────────────────────────

export interface QuestionBankSummary {
  id: string;
  title: string;
  description: string;
  visibility: string;
  questionCount: number;
}

export interface BankQuestionSummary {
  id: string;
  questionBankId: string;
  questionType: string;
  text: string;
  defaultPoints: string;
  difficulty: string;
  status: string;
}

export async function getQuestionBanks() {
  return get<ApiResponse<QuestionBankSummary[]>>(`/question-banks/`);
}

export async function getBankQuestions(bankId: string) {
  return get<ApiResponse<BankQuestionSummary[]>>(`/question-banks/${bankId}/questions/`);
}

// ── Assessment question attachment ────────────────────────────────

export interface AssessmentQuestionRow {
  id: string;
  position: number;
  points: string;
  question: {
    id: string;
    questionType: string;
    text: string;
    options: { id: string; text: string; isCorrect: boolean; position: number }[];
    blankCount: number | null;
  };
}

export async function getAssessmentQuestions(assessmentId: string) {
  return get<ApiResponse<AssessmentQuestionRow[]>>(
    `/assessments/${assessmentId}/questions/`
  );
}

export async function attachQuestion(
  assessmentId: string,
  payload: { questionId: string; position?: number; points?: string }
) {
  return post<ApiResponse<AssessmentQuestionRow>>(
    `/assessments/${assessmentId}/questions/`,
    payload
  );
}

export async function updateAssessmentQuestion(
  assessmentId: string,
  aqId: string,
  payload: { position?: number; points?: string }
) {
  return patch<ApiResponse<AssessmentQuestionRow>>(
    `/assessments/${assessmentId}/questions/${aqId}/`,
    payload
  );
}

export async function detachQuestion(assessmentId: string, aqId: string) {
  return del(`/assessments/${assessmentId}/questions/${aqId}/`);
}

// ── Inline question creation ──────────────────────────────────────

export interface CreateQuestionPayload {
  questionBankId: string;
  questionType: string;
  text: string;
  defaultPoints?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  answerKey?: string[];
  numericAnswer?: string | null;
  numericTolerance?: string | null;
  sampleAnswer?: string;
  options?: { text: string; isCorrect: boolean; position: number }[];
}

export async function createBankQuestion(bankId: string, payload: CreateQuestionPayload) {
  return post<ApiResponse<BankQuestionSummary>>(
    `/question-banks/${bankId}/questions/`,
    payload
  );
}
