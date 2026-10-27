import { get, patch, post, put } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type {
  CategoryWeightInput,
  CourseFinalGrade,
  CourseGradeDetail,
  GradeCategory,
  GradebookData,
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
