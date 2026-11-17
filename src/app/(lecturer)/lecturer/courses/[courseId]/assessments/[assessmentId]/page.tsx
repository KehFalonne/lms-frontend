"use client";
import { use } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { AssessmentBuilder } from "@/features/assessments/components/assessment-builder";
import { LECTURER_ROLES } from "@/lib/constants/routes";

export default function LecturerAssessmentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  const { courseId, assessmentId } = use(params);

  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <AssessmentBuilder
        courseId={courseId}
        assessmentId={assessmentId}
        basePath={`/lecturer/courses/${courseId}/assessments`}
        canPublish={false}
        showCaPanels={false}
      />
    </AuthGate>
  );
}

