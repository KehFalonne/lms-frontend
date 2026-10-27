"use client";
import { ClipboardList } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentCard } from "@/features/assignments/components/assignment-card";
import { useMyAssignments } from "@/features/assignments/hooks/useAssignments";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="All assignments across your courses."
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && assignments.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="You're all caught up!"
          description="There are no published assignments yet."
        />
      )}

      {!isLoading && !isError && assignments.length > 0 && (
        <div className="space-y-3">
          {assignments.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
