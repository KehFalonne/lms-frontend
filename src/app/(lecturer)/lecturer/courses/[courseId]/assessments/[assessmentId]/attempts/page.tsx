"use client";
import { use, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProctoringEventDialog } from "@/features/assessments/components/proctoring-event-dialog";
import {
  listAssessmentAttempts,
  type AssessmentAttemptRow,
} from "@/features/assessments/api/assessments.api";
import { LECTURER_ROLES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/format";

export default function LecturerAssessmentAttemptsPage({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <AttemptsContent params={params} />
    </AuthGate>
  );
}

function AttemptsContent({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  const { courseId, assessmentId } = use(params);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["assessment-attempts", assessmentId],
    queryFn: () => listAssessmentAttempts(assessmentId),
    staleTime: 15_000,
  });

  const [selected, setSelected] = useState<AssessmentAttemptRow | null>(null);
  const attempts = data?.data ?? [];

  return (
    <div>
      <Link
        href={`/lecturer/courses/${courseId}/assessments/${assessmentId}`}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to assessment
      </Link>

      <PageHeader title="Attempts" description={`${attempts.length} total`} />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && attempts.length === 0 && (
        <EmptyState
          icon={Clock}
          title="No attempts yet"
          description="Once students start the assessment, their attempts will appear here."
        />
      )}

      {!isLoading && !isError && attempts.length > 0 && (
        <Card className="divide-border divide-y">
          {attempts.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {a.student.firstName} {a.student.lastName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {a.student.universityId} · Attempt {a.attemptNumber}
                </p>
                <p className="text-muted-foreground text-xs">
                  {a.submittedAt
                    ? `Submitted ${formatDateTime(a.submittedAt)}`
                    : `Started ${formatDateTime(a.startedAt)}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    a.status === "AUTO_GRADED" || a.status === "GRADED"
                      ? "success"
                      : "info"
                  }
                >
                  {a.status.replace("_", " ")}
                </Badge>
                {a.status === "AUTO_GRADED" || a.status === "GRADED" ? (
                  <Badge>{Number(a.percentage).toFixed(0)}%</Badge>
                ) : null}
                {a.proctoringEventCount != null && a.proctoringEventCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-warning"
                    onClick={() => setSelected(a)}
                  >
                    <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                    {a.proctoringEventCount} flag{a.proctoringEventCount === 1 ? "" : "s"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <ProctoringEventDialog
        attemptId={selected?.id ?? null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
