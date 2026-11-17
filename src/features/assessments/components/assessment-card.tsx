import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileQuestion,
  Hourglass,
  KeyRound,
} from "lucide-react";

import { DateTile } from "@/components/ui/date-tile";
import { cn } from "@/lib/utils/cn";
import type { MyAssessment } from "../types/assessment.types";

/**
 * Assessment row — the DBMS-card language: frosted surface, date tile,
 * tracked micro-labels, tinted state pills.
 */
export function AssessmentCard({ assessment }: { assessment: MyAssessment }) {
  const last = assessment.lastAttempt;
  const completed = last?.status === "AUTO_GRADED" || last?.status === "GRADED";
  const pending = last?.status === "MANUAL_GRADING" || last?.status === "SUBMITTED";
  const inProgress = last?.status === "IN_PROGRESS";

  const attemptsRemaining = assessment.maxAttempts - assessment.attemptsUsed;

  const href = inProgress
    ? `/assessments/${assessment.id}/attempt/${last!.id}`
    : last && (completed || pending)
      ? `/assessments/${assessment.id}/result/${last.id}`
      : `/assessments/${assessment.id}`;

  const ctaLabel = inProgress
    ? "Resume"
    : completed
      ? "Result"
      : pending
        ? "Status"
        : assessment.isCodeGated && attemptsRemaining > 0
          ? "Enter code"
          : assessment.canStart
            ? "Start"
            : "Locked";

  const status = inProgress
    ? { label: "In progress", className: "bg-warning/15 text-warning ring-warning/25" }
    : completed
      ? { label: "Completed", className: "bg-success/10 text-success ring-success/20" }
      : pending
        ? { label: "Pending grade", className: "bg-info/10 text-info ring-info/20" }
        : null;

  return (
    <Link
      href={href}
      className="group focus-visible:ring-primary/50 block rounded-2xl outline-none focus-visible:ring-2"
    >
      <article className="ring-primary/10 flex items-stretch gap-3 rounded-2xl border border-white/60 bg-white/85 p-3.5 ring-1 backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_28px_56px_-28px_hsl(222_47%_22%/0.6)] sm:gap-4 sm:p-4 dark:border-white/10 dark:bg-slate-800/75">
        {/* Date tile — assessment closes (or opens, if no close date) */}
        <DateTile
          iso={assessment.availableUntil ?? assessment.availableFrom ?? null}
          kind="assessment"
        />

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="course-code-badge bg-primary/10 text-primary ring-primary/15 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase ring-1">
              {assessment.courseCode}
            </span>
            <span className="bg-muted/70 text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-semibold tracking-wide uppercase">
              {assessment.assessmentType}
            </span>
            {assessment.isCodeGated && (
              <span className="bg-warning/10 text-warning ring-warning/25 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-semibold tracking-wide uppercase ring-1">
                <KeyRound className="h-3 w-3" aria-hidden />
                Code
              </span>
            )}
            {status && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-semibold tracking-wide uppercase ring-1",
                  status.className
                )}
              >
                {(inProgress || pending) && <Hourglass className="h-3 w-3" aria-hidden />}
                {status.label}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 line-clamp-1 text-sm leading-6 font-semibold">
            {assessment.title}
          </h3>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
            {assessment.courseTitle}
          </p>

          <div className="text-muted-foreground border-border/60 mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase">
            <span className="tabular-nums">{assessment.totalPoints} pts</span>
            {assessment.timeLimitMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {assessment.timeLimitMinutes} min
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 tabular-nums">
              <FileQuestion className="h-3 w-3" aria-hidden />
              {assessment.attemptsUsed}/{assessment.maxAttempts} attempts
            </span>
          </div>

          {assessment.isCodeGated && assessment.caLastEntryAt && !last && (
            <p className="text-muted-foreground/80 mt-1.5 text-[9px] font-medium tracking-[0.12em] uppercase">
              Last entry {new Date(assessment.caLastEntryAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Right rail — score or CTA */}
        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          {last && completed ? (
            <div className="text-right">
              <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.16em] uppercase">
                Score
              </p>
              <p className="text-xl leading-6 font-semibold tracking-tight tabular-nums">
                {Number(last.percentage).toFixed(0)}%
                <span className="text-muted-foreground block text-[9px] leading-4 font-medium">
                  {last.totalScore}/{assessment.totalPoints}
                </span>
              </p>
            </div>
          ) : (
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-lg px-3 text-[10px] font-semibold tracking-[0.14em] uppercase",
                attemptsRemaining > 0 &&
                  (assessment.canStart || assessment.isCodeGated || inProgress)
                  ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_hsl(221_83%_53%/0.8)]"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {ctaLabel}
            </span>
          )}
          <ChevronRight
            className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}
