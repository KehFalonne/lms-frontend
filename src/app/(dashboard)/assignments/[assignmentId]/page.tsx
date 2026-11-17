"use client";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ListChecks,
  Paperclip,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { GlassCard, PanelHeader, TONE_CHIP } from "@/components/ui/glass-card";
import { DateTile } from "@/components/ui/date-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { SubmissionPanel } from "@/features/assignments/components/submission-panel";
import { downloadFile } from "@/features/files/api/files.api";
import {
  useAssignment,
  useMySubmission,
} from "@/features/assignments/hooks/useAssignments";
import { dueLabel, formatBytes, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

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
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
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
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 -ml-2 mb-4 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All assignments
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <GlassCard className="mb-5">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <DateTile iso={assignment.dueAt} kind="assignment" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {submission ? (
                  <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ring-1 ring-success/20">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    Submitted
                  </span>
                ) : (
                  <span className="bg-info/10 text-info inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ring-1 ring-info/20">
                    Open
                  </span>
                )}
                <DuePill variant={due.variant} label={due.label} />
                {assignment.allowLateSubmission && (
                  <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                    Late allowed
                  </span>
                )}
              </div>

              <h1 className="mt-2.5 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {assignment.title}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                Due {formatDateTime(assignment.dueAt)}
              </p>
            </div>

            {/* Score / points block */}
            <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-1 sm:text-right">
              <div>
                <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-[0.16em]">
                  Max score
                </p>
                <p className="text-2xl font-semibold leading-7 tabular-nums tracking-tight sm:text-3xl">
                  {assignment.maxScore}
                </p>
              </div>
            </div>
          </div>

          {/* Meta strip */}
          <div className="border-border/60 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" aria-hidden />
              {assignment.submissionType.replace(/_/g, " ")}
            </span>
            {assignment.allowLateSubmission && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                Late submissions accepted
              </span>
            )}
          </div>
        </div>

        {/* Description / questions */}
        {assignment.description && (
          <div className="border-border/60 border-t px-5 py-4 sm:px-6">
            <h2 className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Questions
            </h2>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-foreground/90">
              {assignment.description}
            </p>
          </div>
        )}

        {/* Question files */}
        {assignment.attachments?.length > 0 && (
          <div className="border-border/60 border-t px-5 py-4 sm:px-6">
            <h2 className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
              <Paperclip className="h-3.5 w-3.5" aria-hidden />
              Question files
            </h2>
            <ul className="mt-2 space-y-1.5">
              {assignment.attachments.map((att) => (
                <li
                  key={att.id}
                  className="bg-muted/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0 flex items-center gap-2 text-sm">
                    <FileText className="text-primary h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{att.originalName}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatBytes(att.sizeBytes)}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void downloadFile(att.fileId, att.originalName)}
                  >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {assignment.instructions && (
          <div className="border-border/60 border-t px-5 py-4 sm:px-6">
            <h2 className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              Instructions
            </h2>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-foreground/90">
              {assignment.instructions}
            </p>
          </div>
        )}
      </GlassCard>

      {/* ── Submission flow ───────────────────────────────────────── */}
      <SubmissionPanel assignment={assignment} submission={submission} />
    </div>
  );
}

function DuePill({
  variant,
  label,
}: {
  variant: "default" | "danger" | "warning" | "info" | "success" | string;
  label: string;
}) {
  const tone =
    variant === "danger"
      ? "bg-danger/10 text-danger ring-danger/20"
      : variant === "warning"
        ? "bg-warning/15 text-warning ring-warning/25"
        : "bg-muted text-muted-foreground ring-border";
  const Icon = CalendarClock;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1",
        tone,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
