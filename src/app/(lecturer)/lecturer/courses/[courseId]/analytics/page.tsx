"use client";
import { use } from "react";
import {
  Activity,
  BookOpen,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Users,
} from "lucide-react";

import { ErrorState } from "@/components/ui/error-state";
import { GlassCard, PanelHeader } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import {
  ActivityChart,
  ActivityFeed,
  EngagementList,
  GradeDistributionChart,
} from "@/features/lecturer/components/analytics-panels";
import { useCourseAnalytics } from "@/features/lecturer/hooks/useLecturer";

export default function LecturerCourseAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const query = useCourseAnalytics(courseId);

  if (query.isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data?.data) {
    return (
      <ErrorState
        title="Could not load course analytics"
        description="Please try again in a moment."
        onRetry={() => query.refetch()}
      />
    );
  }

  const analytics = query.data.data;

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Enrolled students"
          value={analytics.overview.enrolledCount}
          caption="Active enrollments"
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Submission rate"
          value={`${analytics.overview.submissionRate}%`}
          caption={`${analytics.overview.submittedCount} of ${analytics.overview.expectedSubmissions} expected`}
          icon={ClipboardList}
          tone="primary"
          progress={analytics.overview.submissionRate}
          urgent={analytics.overview.submissionRate < 50}
        />
        <StatCard
          label="Average grade"
          value={
            analytics.overview.averageGradePct != null
              ? `${analytics.overview.averageGradePct}%`
              : "—"
          }
          caption="Across published grade items"
          icon={GraduationCap}
          tone="success"
          progress={analytics.overview.averageGradePct ?? null}
        />
        <StatCard
          label="Assessment completion"
          value={`${analytics.overview.assessmentCompletionRate}%`}
          caption={`${analytics.overview.assessmentAttempts} attempts`}
          icon={FileQuestion}
          tone="warning"
          progress={analytics.overview.assessmentCompletionRate}
        />
        <StatCard
          label="Avg content progress"
          value={`${analytics.overview.avgContentProgress}%`}
          caption="Across enrolled students"
          icon={BookOpen}
          tone="info"
          progress={analytics.overview.avgContentProgress}
        />
        <StatCard
          label="Active learners · 30d"
          value={analytics.overview.activeLearners30d}
          caption="Students with recorded activity"
          icon={Activity}
          tone="primary"
        />
      </div>

      {/* Grade distribution + activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <PanelHeader
            icon={GraduationCap}
            tone="success"
            title="Grade distribution"
          />
          <GradeDistributionChart data={analytics.gradeDistribution} />
        </GlassCard>

        <GlassCard>
          <PanelHeader icon={Activity} tone="primary" title="Activity · last 14 days" />
          <ActivityChart data={analytics.engagement.activityByDay} />
        </GlassCard>
      </div>

      {/* Engagement by type + recent activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <PanelHeader icon={Activity} tone="info" title="Engagement by event" />
          <EngagementList data={analytics.engagement.eventsByType} />
        </GlassCard>

        <GlassCard>
          <PanelHeader icon={Activity} tone="primary" title="Recent activity" />
          <ActivityFeed events={analytics.recentActivity} />
        </GlassCard>
      </div>

      {/* Assessment performance */}
      <GlassCard>
        <PanelHeader
          icon={FileQuestion}
          tone="warning"
          title="Assessment performance"
        />
        <AssessmentTable rows={analytics.assessments} />
      </GlassCard>
    </div>
  );
}

function AssessmentTable({
  rows,
}: {
  rows: {
    id: string;
    title: string;
    attempts: number;
    completed: number;
    completionRate: number;
    avgPercentage: number | null;
    bestPercentage: number | null;
    worstPercentage: number | null;
  }[];
}) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground px-4 pb-6 text-sm">
        No assessments published for this course yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto px-4 pb-5 sm:px-5">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-muted-foreground border-border/60 border-b text-left text-[11px] font-semibold tracking-wide uppercase">
            <th className="pb-2.5 pr-4 font-semibold">Assessment</th>
            <th className="pb-2.5 pr-4 font-semibold">Attempts</th>
            <th className="pb-2.5 pr-4 font-semibold">Completion</th>
            <th className="pb-2.5 pr-4 font-semibold">Average</th>
            <th className="pb-2.5 font-semibold">Range</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-border/40 border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{row.title}</td>
              <td className="text-muted-foreground py-3 pr-4 tabular-nums">
                {row.completed}/{row.attempts}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-1.5 w-24 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${row.completionRate}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {row.completionRate}%
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 font-semibold tabular-nums">
                {row.avgPercentage != null ? `${row.avgPercentage}%` : "—"}
              </td>
              <td className="text-muted-foreground py-3 text-xs tabular-nums">
                {row.worstPercentage != null && row.bestPercentage != null
                  ? `${row.worstPercentage}–${row.bestPercentage}%`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
