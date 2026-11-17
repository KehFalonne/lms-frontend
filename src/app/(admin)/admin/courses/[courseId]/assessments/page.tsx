"use client";
import { use } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { CourseAssessmentsList } from "@/features/assessments/components/course-assessments-list";
import { ADMIN_ROLES } from "@/lib/constants/routes";

export default function AdminCourseAssessmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <CourseAssessmentsList
        courseId={courseId}
        basePath={`/admin/courses/${courseId}/assessments`}
      />
    </AuthGate>
  );
}
