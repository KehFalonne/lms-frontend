import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock, XCircle } from "lucide-react";

import { DateTile } from "@/components/ui/date-tile";
import { dueLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { MyAssignment } from "../types/assignment.types";

/**
 * Assignment row — the DBMS-card language: frosted surface, date tile,
 * tracked micro-labels, tinted status pills.
 */
export function AssignmentCard({ assignment }: { assignment: MyAssignment }) {
  const due = dueLabel(assignment.dueAt);
  const submitted = assignment.mySubmission;
  const graded = submitted?.status === "GRADED" || submitted?.status === "RETURNED";
  const late = Boolean(submitted?.isLate);
  const overdue = !submitted && due.variant === "danger";

  const status = graded
    ? {
        label: "Graded",
        className: "bg-success/10 text-success ring-success/20",
        icon: CheckCircle2,
      }
    : submitted
      ? late
        ? {
            label: "Late",
            className: "bg-warning/15 text-warning ring-warning/25",
            icon: Clock,
          }
        : {
            label: "Submitted",
            className: "bg-info/10 text-info ring-info/20",
            icon: CheckCircle2,
          }
      : overdue
        ? {
            label: "Overdue",
            className: "bg-danger/10 text-danger ring-danger/20",
            icon: XCircle,
          }
        : null;

  return (
    <Link
      href={`/assignments/${assignment.id}`}
      className="group focus-visible:ring-primary/50 block rounded-2xl outline-none focus-visible:ring-2"
    >
      <article className="ring-primary/10 flex items-stretch gap-3 rounded-2xl border border-white/60 bg-white/85 p-3.5 ring-1 backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_28px_56px_-28px_hsl(222_47%_22%/0.6)] sm:gap-4 sm:p-4 dark:border-white/10 dark:bg-slate-800/75">
        <DateTile iso={assignment.dueAt} kind="assignment" />

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="course-code-badge bg-primary/10 text-primary ring-primary/15 inline-flex max-w-40 min-w-0 items-center rounded-full px-2 py-0.5 text-[9px] leading-3 font-bold tracking-widest uppercase ring-1">
              {assignment.courseCode}
            </span>
            {status && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase ring-1",
                  status.className
                )}
              >
                <status.icon className="h-3 w-3" aria-hidden />
                {status.label}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 line-clamp-1 text-sm leading-6 font-semibold">
            {assignment.title}
          </h3>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
            {assignment.courseTitle}
          </p>

          <div className="text-muted-foreground border-border/60 mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {due.label}
            </span>
            <span>{assignment.maxScore} pts</span>
            <span className="hidden sm:inline">
              {assignment.submissionType.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Right rail — score or chevron */}
        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          {graded && submitted?.score != null ? (
            <div className="text-right">
              <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.16em] uppercase">
                Score
              </p>
              <p className="text-xl leading-6 font-semibold tracking-tight tabular-nums">
                {submitted.score}
                <span className="text-muted-foreground text-xs font-medium">
                  /{assignment.maxScore}
                </span>
              </p>
            </div>
          ) : null}
          <ChevronRight
            className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}
