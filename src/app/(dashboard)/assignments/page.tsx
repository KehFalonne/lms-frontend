"use client";
import { useState } from "react";
import { ClipboardList } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { AssignmentCard } from "@/features/assignments/components/assignment-card";
import { useMyAssignments } from "@/features/assignments/hooks/useAssignments";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

type Filter = "all" | "pending" | "submitted" | "graded";

export default function AssignmentsPage() {
  return (
    <AuthGate>
      <AssignmentsContent />
    </AuthGate>
  );
}

function AssignmentsContent() {
  const { data, isLoading, isError, refetch } = useMyAssignments();
  const assignments = data?.data ?? [];
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => !a.mySubmission).length,
    submitted: assignments.filter((a) =>
      a.mySubmission && a.mySubmission.status !== "GRADED" && a.mySubmission.status !== "RETURNED",
    ).length,
    graded: assignments.filter(
      (a) => a.mySubmission && (a.mySubmission.status === "GRADED" || a.mySubmission.status === "RETURNED"),
    ).length,
  };

  const visible = assignments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "pending") return !a.mySubmission;
    if (filter === "graded")
      return a.mySubmission && (a.mySubmission.status === "GRADED" || a.mySubmission.status === "RETURNED");
    return (
      a.mySubmission &&
      a.mySubmission.status !== "GRADED" &&
      a.mySubmission.status !== "RETURNED"
    );
  });

  return (
    <div>
      {/* Library header */}
      <header className="mb-5 sm:mb-6">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-6 bg-primary/50" />
          Work in hand
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Assignments</h1>
            <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
              Everything set for you — submit on time, see scores here when graded.
            </p>
          </div>
          {counts.pending > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-warning ring-1 ring-warning/25">
              {counts.pending} pending
            </span>
          )}
        </div>

        {/* Filter pills */}
        {!isLoading && assignments.length > 0 && (
          <div role="tablist" aria-label="Filter assignments" className="mt-4 flex flex-wrap gap-1.5">
            {(["all", "pending", "submitted", "graded"] as Filter[]).map((key) => (
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
                {key}
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {/* Empty */}
      {!isLoading && !isError && assignments.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="You're all caught up!"
          description="There are no published assignments yet."
        />
      )}

      {/* Filtered empty */}
      {!isLoading && !isError && assignments.length > 0 && visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
          Nothing in this filter yet.
        </p>
      )}

      {/* List */}
      {!isLoading && !isError && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
