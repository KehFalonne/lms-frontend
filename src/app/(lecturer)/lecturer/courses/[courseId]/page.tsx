"use client";
import { use } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Code2,
  FileText,
  GitBranch,
  GraduationCap,
  Layers,
  Signal,
  UserCog,
  Users,
} from "lucide-react";

import { GlassCard, PanelHeader, TONE_CHIP } from "@/components/ui/glass-card";
import { QuickLink } from "@/components/ui/quick-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses/hooks/useCourses";
import { cn } from "@/lib/utils/cn";

export default function LecturerCourseOverview({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading } = useCourse(courseId);
  const offering = data?.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="border-warning/25 bg-warning/5 text-warning rounded-2xl border p-6 text-sm">
        Course not found. It may be unpublished or you may not have access.
      </div>
    );
  }

  const enrolledPct =
    offering.capacity > 0
      ? Math.min(100, (offering.enrolledCount / offering.capacity) * 100)
      : null;
  const base = `/lecturer/courses/${courseId}`;

  return (
    <div className="grid items-start gap-4 md:grid-cols-2 md:gap-5">
      {/* About this course */}
      <GlassCard>
        <PanelHeader icon={FileText} tone="primary" title="About this course" />
        <div className="px-5 pb-5">
          <p className="text-foreground/90 text-sm leading-7">
            {offering.course.description || "No description provided yet."}
          </p>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <FactTile
              icon={Code2}
              tone="primary"
              label="Course code"
              value={offering.course.code}
            />
            <FactTile
              icon={Layers}
              tone="info"
              label="Credits"
              value={String(offering.course.credits)}
            />
            <FactTile
              icon={Signal}
              tone="success"
              label="Level"
              value={String(offering.course.level)}
            />
            <FactTile
              icon={GitBranch}
              tone="warning"
              label="Prerequisites"
              value={
                offering.course.prerequisiteCount
                  ? String(offering.course.prerequisiteCount)
                  : "None"
              }
            />
          </div>

          <div className="border-border/60 mt-4 border-t pt-4">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.18em]">
              Delivery
            </p>
            <p className="mt-1 text-sm font-semibold">
              {offering.course.courseType || "Standard"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Semester at a glance */}
      <GlassCard>
        <PanelHeader icon={CalendarDays} tone="info" title="Semester at a glance" />
        <div className="divide-border/70 divide-y px-5 pb-5">
          <FactRow
            icon={CalendarDays}
            tone="info"
            label="Semester"
            value={offering.semester.name}
          />
          <FactRow
            icon={GraduationCap}
            tone="primary"
            label="Programme"
            value={offering.programme.name}
          />
          <FactRow
            icon={UserCog}
            tone="warning"
            label="Instructors"
            value={String(offering.instructorCount)}
          />
          <div className="flex items-center gap-3 py-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                TONE_CHIP.success
              )}
            >
              <Users className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Enrolled
                </span>
                <span className="text-xs font-semibold tabular-nums">
                  {offering.enrolledCount}
                  {offering.capacity > 0 && (
                    <span className="text-muted-foreground"> / {offering.capacity}</span>
                  )}
                </span>
              </div>
              {enrolledPct !== null && (
                <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-success h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${enrolledPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <FactRow icon={Signal} tone="success" label="Section" value={offering.section} />
        </div>
      </GlassCard>

      {/* Quick actions */}
      <GlassCard className="md:col-span-2">
        <PanelHeader icon={BookOpen} tone="warning" title="Quick actions" />
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href={`${base}/content`}
            label="Manage content"
            icon={BookOpen}
            accent={TONE_CHIP.primary}
          />
          <QuickLink
            href={`${base}/assignments`}
            label="Assignments"
            icon={ClipboardList}
            accent={TONE_CHIP.info}
          />
          <QuickLink
            href={`${base}/students`}
            label="Students"
            icon={Users}
            accent={TONE_CHIP.success}
          />
          <QuickLink
            href={`${base}/analytics`}
            label="Course analytics"
            icon={BarChart3}
            accent={TONE_CHIP.warning}
          />
        </div>
      </GlassCard>
    </div>
  );
}

function FactTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Code2;
  tone: keyof typeof TONE_CHIP;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border/60 bg-white/60 rounded-xl border p-3 dark:bg-slate-800/60">
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg ring-1",
          TONE_CHIP[tone]
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <p className="text-muted-foreground mt-2.5 text-[9px] font-semibold uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function FactRow({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Code2;
  tone: keyof typeof TONE_CHIP;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
          TONE_CHIP[tone]
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-muted-foreground min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
        {label}
      </span>
      <span className="max-w-[55%] truncate text-right text-xs leading-5 font-semibold">
        {value}
      </span>
    </div>
  );
}
