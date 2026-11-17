"use client";

import {
  CalendarDays,
  Code2,
  FileText,
  GitBranch,
  GraduationCap,
  Layers,
  Signal,
  UserCog,
  Users,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, PanelHeader, TONE_CHIP } from "@/components/ui/glass-card";
import { useCourse } from "@/features/courses/hooks/useCourses";
import { cn } from "@/lib/utils/cn";

export default function CourseOverviewPageClient({ courseId }: { courseId: string }) {
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
      <div className="rounded-2xl border border-warning/25 bg-warning/5 p-6 text-sm text-warning">
        Course not found. It may be unpublished or you may not have access.
      </div>
    );
  }

  const enrolledPct =
    offering.capacity > 0
      ? Math.min(100, (offering.enrolledCount / offering.capacity) * 100)
      : null;

  return (
    <div className="grid items-start gap-4 md:grid-cols-2 md:gap-5">
      {/* About this course */}
      <GlassCard>
        <PanelHeader icon={FileText} tone="primary" title="About this course" />
        <div className="px-5 pb-5">
          <p className="text-sm leading-7 text-foreground/90">
            {offering.course.description || "No description provided yet."}
          </p>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <FactTile icon={Code2} tone="primary" label="Course code" value={offering.course.code} />
            <FactTile icon={Layers} tone="info" label="Credits" value={String(offering.course.credits)} />
            <FactTile icon={Signal} tone="success" label="Level" value={String(offering.course.level)} />
            <FactTile icon={GitBranch} tone="warning" label="Prerequisites" value={String(offering.course.prerequisiteCount)} />
          </div>

          <div className="border-border/60 mt-4 border-t pt-4">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.18em]">
              Delivery
            </p>
            <p className="mt-1 text-sm font-semibold">{offering.course.courseType || "Standard"}</p>
          </div>
        </div>
      </GlassCard>

      {/* Semester at a glance */}
      <GlassCard>
        <PanelHeader icon={CalendarDays} tone="info" title="Semester at a glance" />
        <div className="divide-border/70 divide-y px-5 pb-5">
          <FactRow icon={CalendarDays} tone="info" label="Semester" value={offering.semester.name} />
          <FactRow icon={GraduationCap} tone="primary" label="Programme" value={offering.programme.name} />
          <FactRow icon={UserCog} tone="warning" label="Instructors" value={String(offering.instructorCount)} />
          <div className="flex items-center gap-3 py-3">
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1", TONE_CHIP.success)}>
              <Users className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Enrolled
                </span>
                <span className="text-xs font-semibold tabular-nums">
                  {offering.enrolledCount}
                  {offering.capacity > 0 && <span className="text-muted-foreground"> / {offering.capacity}</span>}
                </span>
              </div>
              {enrolledPct !== null && (
                <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-success transition-[width] duration-500"
                    style={{ width: `${enrolledPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <FactRow icon={Signal} tone="success" label="Section" value={offering.section} />
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
    <div className="rounded-xl border border-border/60 bg-white/60 dark:bg-slate-800/60 p-3">
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg ring-1", TONE_CHIP[tone])}>
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
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1", TONE_CHIP[tone])}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-muted-foreground min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
        {label}
      </span>
      <span className="max-w-[55%] truncate text-right text-xs font-semibold leading-5">
        {value}
      </span>
    </div>
  );
}
