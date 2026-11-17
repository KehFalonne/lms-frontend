"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock,
  FileQuestion,
  KeyRound,
  Target,
  Timer,
} from "lucide-react";

import { EnterCodeDialog } from "@/features/assessments/components/enter-code-dialog";
import { AuthGate } from "@/components/layout/auth-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { DateTile } from "@/components/ui/date-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  useAssessment,
  useStartAttempt,
} from "@/features/assessments/hooks/useAssessments";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  return (
    <AuthGate>
      <DetailInner params={params} />
    </AuthGate>
  );
}

function DetailInner({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAssessment(assessmentId);
  const start = useStartAttempt(assessmentId);
  const a = data?.data;
  const [codeOpen, setCodeOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!a) return <ErrorState title="Assessment not found" />;

  const onStart = () => {
    start.mutate(undefined, {
      onSuccess: (res) => {
        router.push(`/assessments/${assessmentId}/attempt/${res.data.id}`);
      },
    });
  };

  const attemptsRemaining = a.maxAttempts - a.attemptsUsed;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/assessments"
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 -ml-2 mb-4 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All assessments
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <DateTile iso={a.availableUntil ?? a.availableFrom ?? null} kind="assessment" />
          <div className="min-w-0 flex-1">
            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ring-1 ring-primary/15">
              {a.assessmentType}
            </span>
            <h1 className="mt-2 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              {a.title}
            </h1>
            {a.description && (
              <p className="text-muted-foreground mt-1.5 text-sm leading-6">{a.description}</p>
            )}
          </div>

          {/* Attempts remaining dial */}
          <div className="flex shrink-0 items-center gap-5 sm:flex-col sm:gap-1 sm:text-center">
            <div>
              <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-[0.16em]">
                Attempts left
              </p>
              <p
                className={cn(
                  "text-2xl font-semibold leading-7 tabular-nums tracking-tight sm:text-3xl",
                  attemptsRemaining <= 0 && "text-danger",
                )}
              >
                {attemptsRemaining}
                <span className="text-muted-foreground text-sm font-medium">/{a.maxAttempts}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Fact grid */}
        <div className="border-border/60 mt-5 grid grid-cols-2 gap-2 border-t pt-4 sm:grid-cols-4">
          <Fact icon={CalendarDays} label="Opens" value={a.availableFrom ? formatDateTime(a.availableFrom) : "—"} />
          <Fact icon={CalendarDays} label="Closes" value={a.availableUntil ? formatDateTime(a.availableUntil) : "—"} />
          <Fact icon={Target} label="Pass mark" value={`${a.passingScore}%`} />
          <Fact icon={Clock} label="Time limit" value={a.timeLimitMinutes ? `${a.timeLimitMinutes} min` : "None"} />
        </div>

        {/* Points + attempts used */}
        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
          <span className="inline-flex items-center gap-1.5">
            <FileQuestion className="h-3.5 w-3.5" aria-hidden />
            {a.totalPoints} points total
          </span>
          {a.attemptsUsed > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              {a.attemptsUsed}/{a.maxAttempts} attempts used
            </span>
          )}
        </div>

        {/* Instructions */}
        {a.instructions && (
          <div className="border-border/60 mt-5 border-t pt-4">
            <h2 className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.18em]">
              Instructions
            </h2>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-foreground/90">
              {a.instructions}
            </p>
          </div>
        )}

        {/* Warning callout */}
        <div className="border-warning/25 bg-warning/10 mt-5 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-6">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <p className="text-warning-foreground/90">
            Once you begin, the timer starts and cannot be paused. Use a stable connection
            and a quiet space.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-5 flex items-center justify-end border-t border-border/60 pt-5">
          {a.isCodeGated ? (
            <Button
              size="lg"
              className="rounded-xl"
              onClick={() => setCodeOpen(true)}
              disabled={!a.canStart || attemptsRemaining <= 0}
            >
              <KeyRound className="mr-1.5 h-4 w-4" aria-hidden />
              Enter access code
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-xl"
              onClick={onStart}
              loading={start.isPending}
              disabled={!a.canStart || attemptsRemaining <= 0}
            >
              {attemptsRemaining <= 0
                ? "No attempts remaining"
                : a.canStart
                  ? "Begin assessment"
                  : "Not available"}
            </Button>
          )}
          <EnterCodeDialog
            open={codeOpen}
            onClose={() => setCodeOpen(false)}
            assessmentId={assessmentId}
          />
        </div>
      </GlassCard>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-white/60 dark:bg-slate-800/60 p-3">
      <Icon className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
      <p className="text-muted-foreground mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold leading-5 tabular-nums">{value}</p>
    </div>
  );
}
