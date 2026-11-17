"use client";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Users,
} from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { ErrorState } from "@/components/ui/error-state";
import { GlassCard, PanelHeader } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import {
  ActivityChart,
  ActivityFeed,
  GradeDistributionChart,
} from "@/features/lecturer/components/analytics-panels";
import { useLecturerAnalytics } from "@/features/lecturer/hooks/useLecturer";
import { LECTURER_ROLES } from "@/lib/constants/routes";

export default function LecturerAnalyticsPage() {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <AnalyticsContent />
    </AuthGate>
  );
}

function AnalyticsContent() {
  const query = useLecturerAnalytics();

  if (query.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data?.data) {
    return (
      <ErrorState
        title="Could not load analytics"
        description="Please try again in a moment."
        onRetry={() => query.refetch()}
      />
    );
  }

  const { totals, courses } = query.data.data;
  const analytics = query.data.data;

  return (
    <div>
      <header className="mb-6 sm:mb-7">
        <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
          <span aria-hidden className="bg-primary/50 h-px w-6" />
          Teaching insights
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Analytics
            </h1>
            <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
              Performance and engagement across everything you teach — grades,
              submissions and activity at a glance.
            </p>
          </div>
          <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
            <Activity className="text-primary h-3.5 w-3.5" aria-hidden />
            {totals.activeLearners30d} active learners · 30d
          </span>
        </div>
      </header>

      {/* Stat strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Courses taught"
          value={totals.courseCount}
          caption="Active offerings"
          icon={BookOpen}
          tone="info"
        />
        <StatCard
          label="Enrolled students"
          value={totals.enrolledCount}
          caption="Across all courses"
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Submission rate"
          value={`${totals.submissionRate}%`}
          caption="Assignments turned in"
          icon={ClipboardList}
          tone="primary"
          progress={totals.submissionRate}
          urgent={totals.submissionRate < 50}
        />
        <StatCard
          label="Average grade"
          value={
            totals.averageGradePct != null ? `${totals.averageGradePct}%` : "—"
          }
          caption="Published grade items"
          icon={GraduationCap}
          tone="success"
          progress={totals.averageGradePct ?? null}
        />
        <StatCard
          label="Assessment completion"
          value={`${totals.assessmentCompletionRate}%`}
          caption="Attempts completed"
          icon={FileQuestion}
          tone="warning"
          progress={totals.assessmentCompletionRate}
        />
        <StatCard
          label="Avg content progress"
          value={`${totals.avgContentProgress}%`}
          caption="Across all students"
          icon={BarChart3}
          tone="info"
          progress={totals.avgContentProgress}
        />
      </div>

      {/* Combined charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <PanelHeader
            icon={GraduationCap}
            tone="success"
            title="Grade distribution · all courses"
          />
          <GradeDistributionChart data={analytics.gradeDistribution} />
        </GlassCard>

        <GlassCard>
          <PanelHeader
            icon={Activity}
            tone="primary"
            title="Activity · last 14 days"
          />
          <ActivityChart data={analytics.activityByDay} />
        </GlassCard>
      </div>

      {/* Per-course table */}
      <div className="mt-5">
        <GlassCard>
          <PanelHeader icon={BookOpen} tone="info" title="Courses at a glance" />
          <CourseTable courses={courses} />
        </GlassCard>
      </div>

      {/* Recent activity */}
      <div className="mt-5">
        <GlassCard>
          <PanelHeader icon={Activity} tone="primary" title="Recent activity" />
          <ActivityFeed events={analytics.recentActivity} />
        </GlassCard>
      </div>
    </div>
  );
}

function CourseTable({
  courses,
}: {
  courses: {
    id: string;
    code: string;
    title: string;
    section: string;
    semester: string;
    overview: {
      enrolledCount: number;
      submissionRate: number;
      averageGradePct: number | null;
      avgContentProgress: number;
    };
  }[];
}) {
  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground px-4 pb-6 text-sm">
        You are not teaching any courses yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto px-4 pb-5 sm:px-5">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-muted-foreground border-border/60 border-b text-left text-[11px] font-semibold tracking-wide uppercase">
            <th className="pb-2.5 pr-4 font-semibold">Course</th>
            <th className="pb-2.5 pr-4 font-semibold">Students</th>
            <th className="pb-2.5 pr-4 font-semibold">Submission rate</th>
            <th className="pb-2.5 pr-4 font-semibold">Avg grade</th>
            <th className="pb-2.5 pr-4 font-semibold">Content progress</th>
            <th className="pb-2.5 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="border-border/40 border-b last:border-0">
              <td className="py-3 pr-4">
                <Link
                  href={`/lecturer/courses/${course.id}/analytics`}
                  className="group inline-flex items-center gap-2 font-medium"
                >
                  <span className="course-code bg-primary/10 text-primary ring-primary/15 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1">
                    {course.code}
                  </span>
                  <span className="group-hover:text-primary transition-colors">
                    {course.title}
                  </span>
                </Link>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {course.semester} · Section {course.section}
                </p>
              </td>
              <td className="text-muted-foreground py-3 pr-4 tabular-nums">
                {course.overview.enrolledCount}
              </td>
              <td className="py-3 pr-4 tabular-nums">
                {course.overview.submissionRate}%
              </td>
              <td className="py-3 pr-4 tabular-nums">
                {course.overview.averageGradePct != null
                  ? `${course.overview.averageGradePct}%`
                  : "—"}
              </td>
              <td className="py-3 pr-4 tabular-nums">
                {course.overview.avgContentProgress}%
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/lecturer/courses/${course.id}/analytics`}
                  className="text-primary hover:text-primary/70 inline-flex items-center gap-1 text-xs font-semibold"
                >
                  Details
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
