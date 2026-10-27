"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardList, Clock } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionReviewDialog } from "@/features/assignments/components/submission-review-dialog";
import {
  useAssignment,
  useSubmissions,
} from "@/features/assignments/hooks/useAssignments";
import { LECTURER_ROLES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/format";
import type { SubmissionListItem } from "@/features/assignments/api/assignments.api";

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <SubmissionsContent params={params} />
    </AuthGate>
  );
}

function SubmissionsContent({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = use(params);
  const assignmentQ = useAssignment(assignmentId);
  const { data, isLoading, isError, refetch } = useSubmissions(assignmentId);

  const [selected, setSelected] = useState<SubmissionListItem | null>(null);

  const assignment = assignmentQ.data?.data ?? null;
  const items = data?.data ?? [];
  const pending = items.filter(
    (s) => s.status === "SUBMITTED" || s.status === "LATE"
  ).length;

  return (
    <div>
      <Link
        href="/lecturer/courses"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All courses
      </Link>

      <PageHeader
        title={assignment ? `Submissions — ${assignment.title}` : "Submissions"}
        description={`${items.length} total · ${pending} awaiting grading`}
      />

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No submissions yet"
          description="Once students submit, they'll appear here."
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <Card className="divide-border divide-y">
          {items.map((s) => {
            const graded = s.status === "GRADED" || s.status === "RETURNED";
            const pendingGrade = s.status === "SUBMITTED" || s.status === "LATE";
            return (
              <div
                key={s.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {s.student.firstName} {s.student.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {s.student.universityId} · Attempt {s.attemptNumber}
                  </p>
                  {s.submittedAt && (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDateTime(s.submittedAt)}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {s.isLate && <Badge variant="warning">Late</Badge>}
                  {graded && s.score != null && (
                    <Badge variant="success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {s.score} / {assignment?.maxScore}
                    </Badge>
                  )}
                  {pendingGrade && (
                    <Badge variant="info">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant={graded ? "outline" : "primary"}
                    onClick={() => setSelected(s)}
                  >
                    {graded ? "View / Edit" : "Grade"}
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <SubmissionReviewDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        assignmentId={assignmentId}
        assignment={assignment}
        submission={selected}
      />
    </div>
  );
}
