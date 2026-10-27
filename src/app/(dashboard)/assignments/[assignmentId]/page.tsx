"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { SubmissionPanel } from "@/features/assignments/components/submission-panel";
import {
  useAssignment,
  useMySubmission,
} from "@/features/assignments/hooks/useAssignments";
import { dueLabel, formatDateTime } from "@/lib/utils/format";

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <AuthGate>
      <AssignmentDetailInner params={params} />
    </AuthGate>
  );
}

function AssignmentDetailInner({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);
  const assignmentQ = useAssignment(assignmentId);
  const submissionQ = useMySubmission(assignmentId);

  const assignment = assignmentQ.data?.data;
  // A submission is "real" only if it has an id. An empty {} means "no submission".
  const raw = submissionQ.data?.data;
  const submission = raw && (raw as { id?: string }).id ? raw : null;

  if (assignmentQ.isLoading || submissionQ.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (assignmentQ.isError) {
    return <ErrorState onRetry={() => assignmentQ.refetch()} />;
  }

  if (!assignment) {
    return <ErrorState title="Assignment not found" />;
  }

  const due = dueLabel(assignment.dueAt);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/assignments"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All assignments
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={due.variant}>{due.label}</Badge>
            <Badge>{assignment.maxScore} pts</Badge>
            <Badge variant="info">{assignment.submissionType}</Badge>
            {assignment.allowLateSubmission && (
              <Badge variant="outline">Late allowed</Badge>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-semibold">{assignment.title}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5" />
            Due {formatDateTime(assignment.dueAt)}
          </p>

          {assignment.description && (
            <div className="border-border mt-6 border-t pt-4">
              <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Description
              </h2>
              <p className="text-sm whitespace-pre-line">{assignment.description}</p>
            </div>
          )}

          {assignment.instructions && (
            <div className="border-border mt-4 border-t pt-4">
              <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Instructions
              </h2>
              <p className="text-sm whitespace-pre-line">{assignment.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SubmissionPanel assignment={assignment} submission={submission} />
    </div>
  );
}
