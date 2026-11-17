"use client";
import { use } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { AssessmentBuilder } from "@/features/assessments/components/assessment-builder";
import { ADMIN_ROLES } from "@/lib/constants/routes";

export default function AdminAssessmentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  const { courseId, assessmentId } = use(params);
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <AssessmentBuilder
        courseId={courseId}
        assessmentId={assessmentId}
        basePath={`/admin/courses/${courseId}/assessments`}
      />
    </AuthGate>
  );
}
