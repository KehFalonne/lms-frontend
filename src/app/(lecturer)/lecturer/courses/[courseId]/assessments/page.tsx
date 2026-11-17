"use client";
import { use } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { CourseAssessmentsList } from "@/features/assessments/components/course-assessments-list";
import { LECTURER_ROLES } from "@/lib/constants/routes";

export default function LecturerAssessmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <CourseAssessmentsList
        courseId={courseId}
        basePath={`/lecturer/courses/${courseId}/assessments`}
      />
    </AuthGate>
  );
}
