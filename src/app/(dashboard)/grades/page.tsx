"use client";
import { GraduationCap } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { FinalGradeCard } from "@/features/grading/components/final-grade-card";
import { GradeBadge } from "@/features/grading/components/grade-badge";
import { useMyGrades } from "@/features/grading/hooks/useGrades";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function GradesPage() {
  return (
    <AuthGate>
      <GradesContent />
    </AuthGate>
  );
}

function GradesContent() {
  const { data, isLoading, isError, refetch } = useMyGrades();
  const grades = data?.data ?? [];

  const withGrades = grades.filter((g) => Number(g.percentage) > 0);
  const overallAvg =
    withGrades.length > 0
      ? withGrades.reduce((s, g) => s + Number(g.percentage), 0) / withGrades.length
      : 0;
  const overallLetter = withGrades.length > 0 ? gradeFromPct(overallAvg) : "";

  return (
    <div>
      <PageHeader
        title="Grades"
        description="Your final grades across all enrolled courses."
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && grades.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Once you're enrolled in courses, your final grades will appear here."
        />
      )}

      {!isLoading && !isError && grades.length > 0 && (
        <>
          {withGrades.length > 0 && (
            <Card className="mb-6 p-5">
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Weighted average across all courses
                  </p>
                  <p className="mt-1 text-3xl font-semibold">{overallAvg.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">Overall</p>
                  <div className="mt-1 scale-150">
                    <GradeBadge letter={overallLetter} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {grades.map((g) => (
              <FinalGradeCard key={g.courseOfferingId} grade={g} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function gradeFromPct(pct: number): string {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  if (pct >= 50) return "E";
  return "F";
}
