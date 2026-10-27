import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type { LecturerDashboard, TeachingCourse } from "../types/lecturer.types";

export async function getMyTeachingCourses() {
  return get<ApiResponse<TeachingCourse[]>>("/my/teaching-courses/");
}

export async function getLecturerDashboard() {
  return get<ApiResponse<LecturerDashboard>>("/lecturer/dashboard/stats/");
}
