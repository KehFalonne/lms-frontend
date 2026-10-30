"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock,
  MessageSquare,
  Pause,
  Play,
  Send,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  applyCAInvigilatorAction,
  generateAccessCode,
  getCAMonitoring,
  type CAMonitoringStudent,
} from "@/features/assessments/api/assessments.api";
import { formatDateTime } from "@/lib/utils/format";
import { normalizeError } from "@/lib/api/errors";

export default function CAMonitorPage({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  return (
    <AuthGate>
      <MonitorContent params={params} />
    </AuthGate>
  );
}

function MonitorContent({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  const { courseId, assessmentId } = use(params);
  const queryClient = useQueryClient();
  const [messageTarget, setMessageTarget] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const monitoring = useQuery({
    queryKey: ["ca-monitoring", assessmentId],
    queryFn: () => getCAMonitoring(assessmentId),
    refetchInterval: 10000,
  });
  const action = useMutation({
    mutationFn: ({
      attemptId,
      action: actionName,
      message,
    }: {
      attemptId: string;
      action: Parameters<typeof applyCAInvigilatorAction>[2];
      message?: string;
    }) => applyCAInvigilatorAction(assessmentId, attemptId, actionName, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ca-monitoring", assessmentId] });
    },
  });
  const codeMutation = useMutation({
    mutationFn: () => generateAccessCode(assessmentId),
    onSuccess: (response) => setNewCode(response.data.code),
  });

  const students = monitoring.data?.data.students ?? [];
  const runAction = (
    student: CAMonitoringStudent,
    actionName: Parameters<typeof applyCAInvigilatorAction>[2]
  ) => {
    const message =
      actionName === "MESSAGE" ? (window.prompt("Message to student") ?? "") : undefined;
    if (actionName === "MESSAGE" && !message) return;
    action.mutate({ attemptId: student.id, action: actionName, message });
  };

  return (
    <div>
      <Link
        href={`/lecturer/courses/${courseId}/assessments/${assessmentId}/attempts`}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to attempts
      </Link>
      <PageHeader
        title={`CA Monitor${monitoring.data?.data.assessment.title ? ` · ${monitoring.data.data.assessment.title}` : ""}`}
        description="Live student status, integrity events, and invigilator controls."
      />
      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">CA access code</p>
          <p className="text-muted-foreground text-xs">
            Only the assigned invigilator or an administrator can generate a code.
          </p>
          {newCode && (
            <p className="text-primary mt-2 font-mono text-xl tracking-widest">
              {newCode}
            </p>
          )}
        </div>
        <Button onClick={() => codeMutation.mutate()} loading={codeMutation.isPending}>
          Generate CA code
        </Button>
      </Card>

      {monitoring.isLoading && <Skeleton className="h-40 w-full" />}
      {monitoring.isError && (
        <ErrorState
          title="Could not load CA monitor"
          description={normalizeError(monitoring.error).message}
          onRetry={() => monitoring.refetch()}
        />
      )}
      {!monitoring.isLoading && !monitoring.isError && (
        <Card className="divide-border divide-y">
          {students.length === 0 && (
            <div className="text-muted-foreground p-8 text-center text-sm">
              No students have entered this CA yet.
            </div>
          )}
          {students.map((student) => (
            <div
              key={student.id}
              className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {student.student.firstName} {student.student.lastName}
                  </p>
                  <Badge
                    variant={student.status === "IN_PROGRESS" ? "success" : "default"}
                  >
                    {student.status.replace("_", " ")}
                  </Badge>
                  {student.violationCount > 0 && (
                    <Badge variant="danger">{student.violationCount} flags</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {student.student.universityId} · Started{" "}
                  {formatDateTime(student.startedAt)}
                </p>
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {student.lastHeartbeatAt
                    ? `Last heartbeat ${formatDateTime(student.lastHeartbeatAt)}`
                    : "No heartbeat received"}
                  {student.latestEvent ? ` · ${student.latestEvent.type}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={action.isPending}
                  onClick={() => runAction(student, "MESSAGE")}
                >
                  <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                </Button>
                {student.status === "PAUSED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={action.isPending}
                    onClick={() => runAction(student, "RESUME")}
                  >
                    <Play className="mr-1 h-3.5 w-3.5" /> Resume
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={action.isPending}
                    onClick={() => runAction(student, "PAUSE")}
                  >
                    <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={action.isPending}
                  onClick={() => runAction(student, "RESET_LOCKDOWN")}
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Reset lockdown
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={action.isPending}
                  onClick={() => runAction(student, "FORCE_SUBMIT")}
                >
                  <Send className="mr-1 h-3.5 w-3.5" /> Submit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={action.isPending}
                  onClick={() => runAction(student, "TERMINATE")}
                >
                  <Ban className="mr-1 h-3.5 w-3.5" /> Terminate
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
      {action.isError && (
        <p className="text-danger mt-3 text-sm" role="alert">
          {normalizeError(action.error).message}
        </p>
      )}
      {messageTarget && <span className="sr-only">{messageTarget}</span>}
    </div>
  );
}
