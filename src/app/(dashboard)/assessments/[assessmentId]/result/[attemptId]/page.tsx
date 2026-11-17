"use client";
import { use } from "react";
import Link from "next/link";
import { Award, CheckCircle2, Clock, Hourglass, XCircle } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useAttemptResult } from "@/features/assessments/hooks/useAssessments";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function AttemptResultPage({
  params,
}: {
  params: Promise<{ assessmentId: string; attemptId: string }>;
}) {
  return (
    <AuthGate>
      <ResultInner params={params} />
    </AuthGate>
  );
}

function ResultInner({
  params,
}: {
  params: Promise<{ assessmentId: string; attemptId: string }>;
}) {
  const { assessmentId, attemptId } = use(params);
  const { data, isLoading, isError, refetch } = useAttemptResult(attemptId);
  const r = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!r) return <ErrorState title="Result not found" />;

  const pending = r.status === "SUBMITTED" || r.status === "MANUAL_GRADING";
  const completed = r.status === "AUTO_GRADED" || r.status === "GRADED";
  const expired = r.status === "EXPIRED";
  const passed = r.passed === true;
  const failed = r.passed === false;
  const pct = Math.max(0, Math.min(100, Number(r.percentage) || 0));
  const passMark = Math.max(0, Number(r.passingScore) || 0);
  const R = 52;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  const ringStroke = passed
    ? "hsl(var(--success))"
    : failed
      ? "hsl(var(--danger))"
      : "hsl(var(--primary))";

  const heroTone = passed
    ? "bg-[radial-gradient(120%_100%_at_50%_0%,hsl(var(--success)/0.15),transparent_70%)]"
    : failed || expired
      ? "bg-[radial-gradient(120%_100%_at_50%_0%,hsl(var(--danger)/0.13),transparent_70%)]"
      : "bg-[radial-gradient(120%_100%_at_50%_0%,hsl(var(--primary)/0.12),transparent_70%)]";

  const iconTone = passed
    ? "bg-success/10 text-success ring-success/25"
    : failed || expired
      ? "bg-danger/10 text-danger ring-danger/20"
      : "bg-info/10 text-info ring-info/20";

  const heading = passed
    ? "You passed"
    : failed
      ? "You didn't pass this attempt"
      : expired
        ? "Window expired"
        : pending
          ? "Submitted — awaiting grading"
          : "Attempt complete";

  const description = passed
    ? `Congratulations! You scored ${pct}% — at or above the ${passMark}% pass mark for this assessment.`
    : failed
      ? `You scored ${pct}%, which is below the ${passMark}% pass mark. Review the material and try again when you're ready.`
      : expired
        ? "Time ran out before you finished. The answers you saved were kept and graded automatically."
        : pending
          ? "Some questions need manual grading. Your final result will appear here once grading is complete."
          : "This attempt has been recorded.";

  const badgeTone = passed
    ? "bg-success/10 text-success ring-success/20"
    : failed
      ? "bg-danger/10 text-danger ring-danger/20"
      : pending
        ? "bg-warning/10 text-warning ring-warning/25"
        : "bg-muted text-muted-foreground ring-border";

  const badgeLabel = passed ? "Passed" : failed ? "Failed" : r.status.replace(/_/g, " ");

  return (
    <div className="mx-auto max-w-md">
      <GlassCard className="overflow-hidden p-0">
        {/* Hero band */}
        <div
          className={cn(
            "relative flex flex-col items-center px-6 pt-8 pb-6 text-center",
            heroTone,
          )}
        >
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl ring-1",
              iconTone,
            )}
          >
            {passed ? (
              <Award className="h-6 w-6" aria-hidden />
            ) : failed ? (
              <XCircle className="h-6 w-6" aria-hidden />
            ) : expired ? (
              <Clock className="h-6 w-6" aria-hidden />
            ) : pending ? (
              <Hourglass className="h-6 w-6" aria-hidden />
            ) : (
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            )}
          </span>

          <h1 className="mt-3 text-xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-muted-foreground mt-1.5 max-w-xs text-sm leading-6">
            {description}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ring-1",
                badgeTone,
              )}
            >
              {badgeLabel}
            </span>
            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest tabular-nums">
              Attempt {r.attemptNumber}
            </span>
          </div>
        </div>

        {/* Score */}
        {completed ? (
          <div className="border-border/60 flex flex-col items-center border-t px-6 py-6">
            <svg viewBox="0 0 120 120" className="h-36 w-36" role="presentation">
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke={ringStroke}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="57"
                textAnchor="middle"
                className={cn(
                  "text-[22px] font-bold tabular-nums",
                  passed ? "fill-success" : failed ? "fill-danger" : "fill-foreground",
                )}
              >
                {pct.toFixed(0)}%
              </text>
              <text
                x="60"
                y="74"
                textAnchor="middle"
                className="fill-muted-foreground text-[8px] font-medium uppercase tracking-widest"
              >
                Score
              </text>
            </svg>

            {/* Stats */}
            <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2">
              <div className="rounded-xl border border-border/60 bg-white/60 p-3 text-center dark:bg-slate-800/60">
                <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-[0.16em]">
                  Points earned
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {Number(r.totalScore) || 0}
                  {Number(r.totalPoints) > 0 && (
                    <span className="text-muted-foreground font-medium">
                      /{Number(r.totalPoints) || 0}
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-white/60 p-3 text-center dark:bg-slate-800/60">
                <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-[0.16em]">
                  Pass mark
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">{passMark}%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-border/60 border-t px-6 py-6 text-center">
            {expired ? (
              <Clock className="text-warning mx-auto h-6 w-6" aria-hidden />
            ) : (
              <Hourglass className="text-info mx-auto h-6 w-6" aria-hidden />
            )}
            <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
          </div>
        )}

        {/* Submitted timestamp */}
        {r.submittedAt && (
          <p className="text-muted-foreground border-border/60 border-t px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em]">
            Submitted {formatDateTime(r.submittedAt)}
          </p>
        )}

        {/* Actions */}
        <div className="border-border/60 flex flex-col gap-2 border-t p-5">
          <Link href={`/assessments/${assessmentId}`}>
            <Button variant="outline" className="w-full rounded-xl">
              Back to assessment
            </Button>
          </Link>
          <Link href="/assessments">
            <Button variant="ghost" className="w-full rounded-xl">
              All assessments
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
