import { get, patch, post } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  AssignmentDetail,
  MyAssignment,
  MySubmission,
} from "../types/assignment.types";

export async function getMyAssignments() {
  return get<ApiResponse<MyAssignment[]>>(endpoints.my.assignments);
}

export async function getAssignment(id: string) {
  return get<ApiResponse<AssignmentDetail>>(endpoints.assignments.detail(id));
}

export async function getMySubmission(
  assignmentId: string
): Promise<ApiResponse<MySubmission | null>> {
  return get<ApiResponse<MySubmission | null>>(
    endpoints.assignments.mySubmission(assignmentId)
  );
}

export interface SubmitAssignmentPayload {
  textContent?: string;
  fileIds?: string[];
}

export async function submitAssignment(
  assignmentId: string,
  payload: SubmitAssignmentPayload
) {
  return post<ApiResponse<MySubmission>>(
    endpoints.assignments.submissions(assignmentId),
    payload
  );
}

// ── Lecturer endpoints ────────────────────────────────────────────

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  instructions?: string;
  maxScore: string;
  dueAt: string;
  availableFrom?: string | null;
  availableUntil?: string | null;
  allowLateSubmission?: boolean;
  latePenaltyType?: "NONE" | "PERCENTAGE" | "POINTS";
  latePenaltyValue?: string;
  submissionType: "FILE_UPLOAD" | "TEXT_ENTRY" | "FILE_AND_TEXT" | "EXTERNAL_TOOL";
  maxAttempts?: number;
}

export async function createAssignment(
  offeringId: string,
  payload: CreateAssignmentPayload
) {
  return post<ApiResponse<AssignmentDetail>>(
    endpoints.courseOfferings.assignments(offeringId),
    payload
  );
}

export async function updateAssignment(
  id: string,
  payload: Partial<CreateAssignmentPayload>
) {
  return patch<ApiResponse<AssignmentDetail>>(endpoints.assignments.detail(id), payload);
}

export async function publishAssignment(id: string) {
  return post<ApiResponse<AssignmentDetail>>(endpoints.assignments.publish(id));
}

export async function closeAssignment(id: string) {
  return post<ApiResponse<AssignmentDetail>>(endpoints.assignments.close(id));
}

export interface SubmissionListItem {
  id: string;
  assignment: string;
  student: {
    id: string;
    universityId: string;
    firstName: string;
    lastName: string;
  };
  attemptNumber: number;
  status: string;
  submittedAt: string | null;
  isLate: boolean;
  textContent: string;
  files: { id: string; file: string; createdAt: string }[];
  score: string | null;
  feedback: string;
  gradedAt: string | null;
}

export async function getSubmissions(assignmentId: string) {
  return get<ApiResponse<SubmissionListItem[]>>(
    endpoints.assignments.submissions(assignmentId)
  );
}

export interface GradeSubmissionPayload {
  score: string;
  feedback?: string;
}

export async function gradeSubmission(
  submissionId: string,
  payload: GradeSubmissionPayload
) {
  return patch<ApiResponse<SubmissionListItem>>(
    endpoints.assignments.grade(submissionId),
    payload
  );
}
