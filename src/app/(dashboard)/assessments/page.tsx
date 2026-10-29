"use client";
import { FileQuestion } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { AssessmentCard } from "@/features/assessments/components/assessment-card";
import { useMyAssessments } from "@/features/assessments/hooks/useAssessments";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssessmentsPage() {
  return (
    <AuthGate>
      <AssessmentsContent />
    </AuthGate>
  );
}

function AssessmentsContent() {
  const { data, isLoading, isError, refetch } = useMyAssessments();
  const items = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Assessments"
        description="Quizzes and exams across your courses."
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={FileQuestion}
          title="No assessments"
          description="Published quizzes and exams will appear here."
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="space-y-3">
          {items
            .filter((a) => {
              // CA assessments without attempts stay hidden until the window opens
              if (a.isCodeGated && !a.lastAttempt && a.caOpensAt) {
                return new Date(a.caOpensAt) <= new Date();
              }
              return true;
            })
            .map((a) => (
              <AssessmentCard key={a.id} assessment={a} />
            ))}
        </div>
      )}
    </div>
  );
}
