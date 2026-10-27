"use client";
import { use } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { LiveAttempt } from "@/features/assessments/components/live-attempt";

export default function AttemptPage({
  params,
}: {
  params: Promise<{ assessmentId: string; attemptId: string }>;
}) {
  return (
    <AuthGate>
      <AttemptInner params={params} />
    </AuthGate>
  );
}

function AttemptInner({
  params,
}: {
  params: Promise<{ assessmentId: string; attemptId: string }>;
}) {
  const { attemptId } = use(params);
  return <LiveAttempt attemptId={attemptId} />;
}
