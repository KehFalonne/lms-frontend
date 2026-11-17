"use client";
import { GraduationCap, TrendingUp } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { FinalGradeCard } from "@/features/grading/components/final-grade-card";
import { GradeBadge } from "@/features/grading/components/grade-badge";
import { useMyGrades } from "@/features/grading/hooks/useGrades";
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
      : null;
  const overallLetter = overallAvg !== null ? gradeFromPct(overallAvg) : "";

  // Letter distribution across graded courses
  const distribution = withGrades.reduce<Record<string, number>>((acc, g) => {
    const letter = (g.letterGrade || "—").toUpperCase().charAt(0);
    acc[letter] = (acc[letter] ?? 0) + 1;
    return acc;
  }, {});
  const letters = (["A", "B", "C", "D", "E", "F"] as const).filter((l) => distribution[l]);

  const R = 30;
  const CIRC = 2 * Math.PI * R;

  return (
    <div>
      {/* Library header */}
      <header className="mb-5 sm:mb-6">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-6 bg-primary/50" />
          My performance
        </p>
        <div className="mt-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Grades</h1>
          <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
            Final grades across your enrolled courses — weighted exactly as your
            lecturers configured them.
          </p>
        </div>
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {/* Empty */}
      {!isLoading && !isError && grades.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Once you're enrolled in courses, your final grades will appear here."
        />
      )}

      {/* Content */}
      {!isLoading && !isError && grades.length > 0 && (
        <div className="space-y-5">
          {overallAvg !== null && (
            <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,hsl(226_58%_15%)_0%,hsl(221_72%_28%)_55%,hsl(215_90%_46%)_125%)] p-5 text-white shadow-[0_30px_70px_-32px_hsl(221_83%_30%/0.65)] sm:p-6">
              <svg
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-14 h-52 w-52 text-white/10"
                viewBox="0 0 240 240"
                fill="none"
              >
                <circle cx="240" cy="0" r="140" stroke="currentColor" strokeWidth="20" />
                <circle cx="240" cy="0" r="76" stroke="currentColor" strokeWidth="12" strokeDasharray="2 8" strokeLinecap="round" />
              </svg>

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
                {/* Overall ring */}
                <div className="flex items-center gap-5">
                  <svg viewBox="0 0 84 84" className="h-24 w-24 shrink-0" role="presentation">
                    <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
                    <circle
                      cx="42"
                      cy="42"
                      r={R}
                      fill="none"
                      stroke="hsl(199 90% 68%)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (1 - Math.min(100, overallAvg) / 100)}
                      transform="rotate(-90 42 42)"
                    />
                    <text x="42" y="40" textAnchor="middle" className="fill-white text-[18px] font-bold tabular-nums">
                      {overallAvg.toFixed(0)}
                    </text>
                    <text x="42" y="54" textAnchor="middle" className="fill-sky-200/70 text-[7px] font-medium uppercase tracking-widest">
                      %
                    </text>
                  </svg>
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/80">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                      Weighted average
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                      {overallAvg.toFixed(1)}%
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-sky-200/60">
                      Across {withGrades.length} graded {withGrades.length === 1 ? "course" : "courses"}
                    </p>
                  </div>
                </div>

                {/* Letter + distribution */}
                <div className="flex items-center gap-5 border-t border-white/10 pt-4 sm:ml-auto sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
                  <GradeBadge letter={overallLetter} size="lg" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {letters.map((l) => (
                      <div key={l} className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-sky-100">{l}</span>
                        <span className="text-sky-200/70 tabular-nums">×{distribution[l]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Course cards */}
          <div className="space-y-3">
            {grades.map((g) => (
              <FinalGradeCard key={g.courseOfferingId} grade={g} />
            ))}
          </div>
        </div>
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
