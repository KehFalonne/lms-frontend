import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type {
  CourseAnalytics,
  LecturerAnalytics,
  LecturerDashboard,
  TeachingCourse,
} from "../types/lecturer.types";

export async function getMyTeachingCourses() {
  return get<ApiResponse<TeachingCourse[]>>("/my/teaching-courses/");
}

export async function getLecturerDashboard() {
  return get<ApiResponse<LecturerDashboard>>("/lecturer/dashboard/stats/");
}

export async function getCourseAnalytics(offeringId: string) {
  return get<ApiResponse<CourseAnalytics>>(
    `/course-offerings/${offeringId}/analytics/`
  );
}

export async function getLecturerAnalytics() {
  return get<ApiResponse<LecturerAnalytics>>("/lecturer/analytics/");
}
