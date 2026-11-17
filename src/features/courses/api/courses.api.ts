import { del, get, patch, post } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  AssignInstructorPayload,
  BulkEnrollPayload,
  BulkEnrollResult,
  CourseEnrollmentRecord,
  CourseInstructor,
  CreateCourseOfferingPayload,
  Enrollment,
  EnrollmentDecisionPayload,
  EnrollStudentPayload,
  FullCourseOffering,
  UpdateInstructorPayload,
} from "../types/course.types";

export async function getMyCourses() {
  return get<ApiResponse<Enrollment[]>>("/my/courses/");
}

export async function getCourseOfferings(params?: Record<string, unknown>) {
  return get<ApiResponse<FullCourseOffering[]>>(endpoints.courseOfferings.list, {
    params,
  });
}

export async function getCourseOffering(offeringId: string) {
  return get<ApiResponse<FullCourseOffering>>(
    endpoints.courseOfferings.detail(offeringId)
  );
}

export async function createCourseOffering(payload: CreateCourseOfferingPayload) {
  return post<ApiResponse<FullCourseOffering>>(endpoints.courseOfferings.list, payload);
}

export async function updateCourseOffering(
  offeringId: string,
  payload: Partial<CreateCourseOfferingPayload>
) {
  return patch<ApiResponse<FullCourseOffering>>(
    endpoints.courseOfferings.detail(offeringId),
    payload
  );
}

export async function deleteCourseOffering(offeringId: string) {
  return del(endpoints.courseOfferings.detail(offeringId));
}

export async function publishCourseOffering(offeringId: string) {
  return post<ApiResponse<FullCourseOffering>>(
    endpoints.courseOfferings.publish(offeringId)
  );
}

export async function archiveCourseOffering(offeringId: string) {
  return post<ApiResponse<FullCourseOffering>>(
    endpoints.courseOfferings.archive(offeringId)
  );
}

export async function completeCourseOffering(offeringId: string) {
  return post<ApiResponse<FullCourseOffering>>(
    endpoints.courseOfferings.complete(offeringId)
  );
}

export async function cancelCourseOffering(offeringId: string) {
  return post<ApiResponse<FullCourseOffering>>(
    endpoints.courseOfferings.cancel(offeringId)
  );
}

export async function getAvailableCourseOfferings() {
  return get<ApiResponse<FullCourseOffering[]>>(
    "/course-offerings/?status=ACTIVE&compact=false"
  );
}

export async function requestEnrollment(offeringId: string) {
  return post<ApiResponse<Enrollment>>(
    `/course-offerings/${offeringId}/enrollment-request/`,
    {}
  );
}

// ── Course Instructors ─────────────────────────────────────────────

export async function getOfferingInstructors(offeringId: string) {
  return get<ApiResponse<CourseInstructor[]>>(
    endpoints.courseOfferings.instructors(offeringId)
  );
}

export async function assignOfferingInstructor(
  offeringId: string,
  payload: AssignInstructorPayload
) {
  return post<ApiResponse<CourseInstructor>>(
    endpoints.courseOfferings.instructors(offeringId),
    payload
  );
}

export async function updateOfferingInstructor(
  offeringId: string,
  instructorId: string,
  payload: UpdateInstructorPayload
) {
  return patch<ApiResponse<CourseInstructor>>(
    endpoints.courseOfferings.instructor(offeringId, instructorId),
    payload
  );
}

export async function removeOfferingInstructor(offeringId: string, instructorId: string) {
  return del(endpoints.courseOfferings.instructor(offeringId, instructorId));
}

// ── Course Enrollments ─────────────────────────────────────────────

export async function getOfferingEnrollments(offeringId: string) {
  return get<ApiResponse<CourseEnrollmentRecord[]>>(
    endpoints.courseOfferings.enrollments(offeringId)
  );
}

export async function enrollOfferingStudent(
  offeringId: string,
  payload: EnrollStudentPayload
) {
  return post<ApiResponse<CourseEnrollmentRecord>>(
    endpoints.courseOfferings.enrollments(offeringId),
    payload
  );
}

export async function bulkEnrollOfferingStudents(
  offeringId: string,
  payload: BulkEnrollPayload
) {
  return post<ApiResponse<BulkEnrollResult>>(
    endpoints.courseOfferings.bulkEnroll(offeringId),
    payload
  );
}

export async function removeOfferingEnrollment(offeringId: string, studentId: string) {
  return del<ApiResponse<{ message?: string }>>(
    endpoints.courseOfferings.enrollment(offeringId, studentId)
  );
}

export async function decideOfferingEnrollment(
  offeringId: string,
  studentId: string,
  payload: EnrollmentDecisionPayload
) {
  return patch<ApiResponse<CourseEnrollmentRecord>>(
    endpoints.courseOfferings.enrollmentDecision(offeringId, studentId),
    payload
  );
}
