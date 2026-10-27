import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type { Enrollment, FullCourseOffering } from "../types/course.types";

export async function getMyCourses() {
  return get<ApiResponse<Enrollment[]>>("/my/courses/");
}

export async function getCourseOffering(offeringId: string) {
  return get<ApiResponse<FullCourseOffering>>(`/course-offerings/${offeringId}/`);
}
