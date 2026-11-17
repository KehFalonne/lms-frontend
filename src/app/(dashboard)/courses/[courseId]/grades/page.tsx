"use client";
import { use } from "react";
import { BarChart3, GraduationCap, Table2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { GlassCard, PanelHeader } from "@/components/ui/glass-card";
import { GradeBadge } from "@/features/grading/components/grade-badge";
import { CategoryBreakdown } from "@/features/grading/components/category-breakdown";
import { GradeItemsTable } from "@/features/grading/components/grade-items-table";
import { useMyCourseGrades } from "@/features/grading/hooks/useGrades";

export default function CourseGradesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading, isError, refetch } = useMyCourseGrades(courseId);
  const detail = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (!detail) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No grades yet"
        description="Published grades will appear here as your lecturers release them."
      />
    );
  }

  const pct = Number(detail.final.percentage);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Final grade hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,hsl(226_58%_15%)_0%,hsl(221_72%_28%)_55%,hsl(215_90%_46%)_125%)] p-5 text-white shadow-[0_30px_70px_-32px_hsl(221_83%_30%/0.65)] sm:p-6">
        <svg
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 text-white/10"
          viewBox="0 0 240 240"
          fill="none"
        >
          <circle cx="240" cy="0" r="140" stroke="currentColor" strokeWidth="20" />
          <circle cx="240" cy="0" r="74" stroke="currentColor" strokeWidth="12" strokeDasharray="2 8" strokeLinecap="round" />
        </svg>
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/80">
              Final grade
            </p>
            <p className="mt-1.5 text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl">
              {Number.isFinite(pct) ? pct.toFixed(1) : "—"}
              <span className="text-sky-200/70 text-2xl font-medium sm:text-3xl">%</span>
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200/60">
              Weighted across categories
            </p>
          </div>
          <div className="flex items-center gap-5 border-t border-white/10 pt-4 sm:ml-auto sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
            <GradeBadge letter={detail.final.letterGrade} size="lg" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
                Letter grade
              </p>
              <p className="mt-0.5 text-xs text-sky-100/80">
                As configured by your<br />course lecturer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      <GlassCard>
        <PanelHeader icon={BarChart3} tone="info" title="Category breakdown" />
        <div className="p-4 pt-0 sm:p-5 sm:pt-1">
          <CategoryBreakdown categories={detail.final.categories} />
        </div>
      </GlassCard>

      {/* Individual items */}
      <GlassCard>
        <PanelHeader icon={Table2} tone="primary" title="Published grades" />
        <div className="p-4 pt-0 sm:p-5 sm:pt-1">
          <GradeItemsTable items={detail.items} />
        </div>
      </GlassCard>
    </div>
  );
}
