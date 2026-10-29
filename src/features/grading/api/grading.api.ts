import { get, patch, post, put } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type {
  CategoryWeightInput,
  CourseFinalGrade,
  CourseGradeDetail,
  GradeCategory,
  GradebookData,
  GradeAppeal,
} from "../types/grading.types";

// ── Student ───────────────────────────────────────────────────────

export async function getMyGrades() {
  return get<ApiResponse<CourseFinalGrade[]>>("/my/grades/");
}

export async function getMyCourseGrades(offeringId: string) {
  return get<ApiResponse<CourseGradeDetail>>(
    `/my/course-offerings/${offeringId}/grades/`
  );
}

// ── Lecturer / gradebook ──────────────────────────────────────────

export async function getGradebook(offeringId: string) {
  return get<ApiResponse<GradebookData>>(`/course-offerings/${offeringId}/gradebook/`);
}

export async function setGrade(
  gradeItemId: string,
  studentId: string,
  payload: { score: string | null; feedback?: string; reason?: string }
) {
  return patch<ApiResponse<unknown>>(
    `/grade-items/${gradeItemId}/grades/${studentId}/`,
    payload
  );
}

export async function publishGradeItem(gradeItemId: string) {
  return post<ApiResponse<{ published: number }>>(`/grade-items/${gradeItemId}/publish/`);
}

export async function publishAllGrades(offeringId: string) {
  return post<ApiResponse<{ published: number }>>(
    `/course-offerings/${offeringId}/grades/publish/`
  );
}

export async function getGradeCategories(offeringId: string) {
  return get<ApiResponse<GradeCategory[]>>(
    `/course-offerings/${offeringId}/grade-categories/`
  );
}

export async function setCategoryWeights(
  offeringId: string,
  weights: CategoryWeightInput[]
) {
  return put<ApiResponse<GradeCategory[]>>(
    `/course-offerings/${offeringId}/grade-categories/set-weights/`,
    { weights }
  );
}

export async function listGradeAppeals(gradeId: string) {
  return get<ApiResponse<GradeAppeal[]>>(`/grades/${gradeId}/appeals/`);
}

export async function createAppeal(gradeId: string, reason: string) {
  return post<ApiResponse<GradeAppeal>>(`/grades/${gradeId}/appeals/`, { reason });
}

export async function getAppealQueue(params?: { status?: string; mine?: boolean }) {
  return get<ApiResponse<GradeAppeal[]>>("/appeals/", {
    params: {
      status: params?.status ?? "ACTIVE",
      mine: params?.mine ? "true" : undefined,
    },
  });
}

export async function resolveAppeal(
  appealId: string,
  payload: {
    decision: "APPROVED" | "DENIED";
    reviewerNotes?: string;
    newScore?: string | null;
  }
) {
  return post<ApiResponse<GradeAppeal>>(`/appeals/${appealId}/resolve/`, payload);
}

export async function withdrawAppeal(appealId: string) {
  return post<ApiResponse<GradeAppeal>>(`/appeals/${appealId}/withdraw/`);
}
