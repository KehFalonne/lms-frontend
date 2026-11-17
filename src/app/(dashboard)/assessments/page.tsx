"use client";
import { useState } from "react";
import { FileQuestion } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { AssessmentCard } from "@/features/assessments/components/assessment-card";
import { useMyAssessments } from "@/features/assessments/hooks/useAssessments";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

type Filter = "all" | "open" | "inProgress" | "completed";

export default function AssessmentsPage() {
  return (
    <AuthGate>
      <AssessmentsContent />
    </AuthGate>
  );
}

function AssessmentsContent() {
  const { data, isLoading, isError, refetch } = useMyAssessments();
  const [filter, setFilter] = useState<Filter>("all");

  // CA assessments without attempts stay hidden until the window opens
  const items = (data?.data ?? []).filter((a) => {
    if (a.isCodeGated && !a.lastAttempt && a.caOpensAt) {
      return new Date(a.caOpensAt) <= new Date();
    }
    return true;
  });

  const isInProgress = (a: (typeof items)[number]) => a.lastAttempt?.status === "IN_PROGRESS";
  const isCompleted = (a: (typeof items)[number]) =>
    a.lastAttempt?.status === "AUTO_GRADED" || a.lastAttempt?.status === "GRADED";
  const isPendingGrade = (a: (typeof items)[number]) =>
    a.lastAttempt?.status === "SUBMITTED" || a.lastAttempt?.status === "MANUAL_GRADING";
  const isOpen = (a: (typeof items)[number]) =>
    !isInProgress(a) && !isCompleted(a) && !isPendingGrade(a) && a.canStart;

  const counts = {
    all: items.length,
    open: items.filter(isOpen).length,
    inProgress: items.filter(isInProgress).length,
    completed: items.filter(isCompleted).length,
  };

  const visible = items.filter((a) => {
    if (filter === "all") return true;
    if (filter === "open") return isOpen(a);
    if (filter === "inProgress") return isInProgress(a);
    return isCompleted(a);
  });

  return (
    <div>
      {/* Library header */}
      <header className="mb-5 sm:mb-6">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-6 bg-primary/50" />
          Test yourself
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Assessments</h1>
            <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
              Quizzes, tests and exams — attempt windows, timers and scores, all in one place.
            </p>
          </div>
          {counts.inProgress > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-warning ring-1 ring-warning/25">
              {counts.inProgress} in progress
            </span>
          )}
        </div>

        {/* Filter pills */}
        {!isLoading && items.length > 0 && (
          <div role="tablist" aria-label="Filter assessments" className="mt-4 flex flex-wrap gap-1.5">
            {(["all", "open", "inProgress", "completed"] as Filter[]).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={cn(
                  "focus-visible:ring-primary/50 h-9 rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.14em] outline-none transition-all duration-200 focus-visible:ring-2",
                  filter === key
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {key === "inProgress" ? "In progress" : key}
                <span className={cn("ml-1.5 tabular-nums", filter === key ? "text-background/70" : "text-muted-foreground/70")}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={FileQuestion}
          title="No assessments"
          description="Published quizzes and exams will appear here."
        />
      )}

      {/* Filtered empty */}
      {!isLoading && !isError && items.length > 0 && visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
          Nothing in this filter yet.
        </p>
      )}

      {/* List */}
      {!isLoading && !isError && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
