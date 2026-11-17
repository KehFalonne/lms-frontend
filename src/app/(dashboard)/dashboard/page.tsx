"use client";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Layers,
  LineChart,
  LayoutGrid,
} from "lucide-react";

import { GlassCard, PanelHeader, TONE_CHIP } from "@/components/ui/glass-card";
import { DateTile } from "@/components/ui/date-tile";
import { StatCard } from "@/components/ui/stat-card";
import { DueChip, relativeDue } from "@/components/ui/due-chip";
import { QuickLink } from "@/components/ui/quick-link";
import { AuthGate } from "@/components/layout/auth-gate";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyCourses } from "@/features/courses/hooks/useCourses";
import { primaryRoleLabel } from "@/lib/constants/routes";
import { useMyAssignments } from "@/features/assignments/hooks/useAssignments";
import { useMyAssessments } from "@/features/assessments/hooks/useAssessments";
import { useMyGrades } from "@/features/grading/hooks/useGrades";
import { useUnreadNotificationsCount } from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/lib/utils/cn";

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardContent />
    </AuthGate>
  );
}

type DeadlineItem = {
  id: string;
  kind: "assignment" | "assessment";
  title: string;
  courseCode: string;
  due: string | null;
  href: string;
};

function DashboardContent() {
  const { user } = useAuth();
  const { data, isLoading } = useMyCourses();
  const courses = data?.data ?? [];
  const role = primaryRoleLabel(user?.roles);
  const { data: assignmentsData } = useMyAssignments();
  const assignments = assignmentsData?.data ?? [];
  const pendingAssignments = assignments.filter((a) => !a.mySubmission);
  const { data: assessmentsData } = useMyAssessments();
  const assessments = assessmentsData?.data ?? [];
  const pendingAssessments = assessments.filter((a) => !a.lastAttempt);
  const { data: gradesData } = useMyGrades();
  const grades = gradesData?.data ?? [];
  const gradedCourses = grades.filter((g) => Number(g.percentage) > 0);
  const avgGrade =
    gradedCourses.length > 0
      ? gradedCourses.reduce((s, g) => s + Number(g.percentage), 0) / gradedCourses.length
      : null;
  const unread = useUnreadNotificationsCount().data ?? 0;

  const creditsInProgress = courses.reduce(
    (sum, e) => sum + Number(e.courseOffering.course.credits || 0),
    0
  );
  const programmeName = courses[0]?.courseOffering.programme.name;
  const semesterName = courses[0]?.courseOffering.semester.name;

  const deadlines: DeadlineItem[] = [
    ...pendingAssignments.map((a) => ({
      id: `a-${a.id}`,
      kind: "assignment" as const,
      title: a.title,
      courseCode: a.courseCode,
      due: a.dueAt ?? null,
      href: "/assignments",
    })),
    ...pendingAssessments.map((a) => ({
      id: `e-${a.id}`,
      kind: "assessment" as const,
      title: a.title,
      courseCode: a.courseCode,
      due: a.availableUntil ?? null,
      href: "/assessments",
    })),
  ]
    .sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due).getTime() - new Date(b.due).getTime();
    })
    .slice(0, 5);

  const pendingTotal = pendingAssignments.length + pendingAssessments.length;
  const nextDue = deadlines.find((d) => d.due);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const assignmentsCleared = assignments.length - pendingAssignments.length;
  const assessmentsCleared = assessments.length - pendingAssessments.length;
  const assignmentsPct =
    assignments.length > 0
      ? Math.round((assignmentsCleared / assignments.length) * 100)
      : null;
  const assessmentsPct =
    assessments.length > 0
      ? Math.round((assessmentsCleared / assessments.length) * 100)
      : null;

  const totalWork = assignments.length + assessments.length;
  const clearedWork = totalWork - pendingTotal;
  const clearedPct = totalWork > 0 ? Math.round((clearedWork / totalWork) * 100) : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ─── Welcome hero ─────────────────────────────────────────── */}
      <section className="border-primary/10 text-foreground relative overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,hsl(221_83%_53%/0.08)_0%,hsl(215_90%_60%/0.12)_52%,hsl(226_72%_44%/0.08)_100%)] p-5 shadow-[0_30px_70px_-32px_hsl(221_83%_30%/0.18)] sm:p-7 dark:border-white/10 dark:bg-[linear-gradient(135deg,hsl(226_58%_15%)_0%,hsl(221_72%_28%)_55%,hsl(215_90%_46%)_125%)] dark:text-white dark:shadow-[0_30px_70px_-32px_hsl(221_83%_30%/0.65)]">
        <svg
          aria-hidden
          className="text-primary/10 pointer-events-none absolute -top-20 -right-16 h-72 w-72 dark:text-white/10"
          viewBox="0 0 240 240"
          fill="none"
        >
          <circle cx="240" cy="0" r="150" stroke="currentColor" strokeWidth="22" />
          <circle
            cx="240"
            cy="0"
            r="80"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
        </svg>
        <svg
          aria-hidden
          className="text-primary/10 pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 dark:text-white/10"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={10 + c * 24}
                cy={10 + r * 24}
                r={(r + c) % 4 === 0 ? 3.4 : 2}
              />
            ))
          )}
        </svg>

        <div className="relative grid items-center gap-6 md:grid-cols-[1.5fr_auto] md:gap-8">
          <div className="min-w-0">
            <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase dark:text-sky-200/80">
              <span aria-hidden className="bg-primary/40 h-px w-6 dark:bg-sky-300/50" />
              Student workspace
            </p>
            <h1 className="mt-2.5 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {greeting}, {user?.firstName ?? "there"}.
            </h1>
            <p className="text-muted-foreground mt-2.5 max-w-md text-sm leading-6 dark:text-sky-100/85">
              {pendingTotal > 0 ? (
                <>
                  You have{" "}
                  <span className="text-foreground font-semibold dark:text-white">
                    {pendingTotal} open {pendingTotal === 1 ? "task" : "tasks"}
                  </span>
                  {nextDue?.due && (
                    <>
                      {" "}
                      — next up is{" "}
                      <span className="text-foreground font-semibold dark:text-white">
                        “{nextDue.title}”
                      </span>{" "}
                      ({relativeDue(nextDue.due)})
                    </>
                  )}
                  .
                </>
              ) : (
                <>
                  Nothing pending — you&apos;re all caught up. Time invested now shows up
                  at results day.
                </>
              )}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                href="/courses"
                className="text-primary inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold shadow-[0_14px_30px_-12px_rgba(255,255,255,0.45)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
              >
                Resume learning
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/grades"
                className="border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/40 inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium backdrop-blur-sm transition-colors focus-visible:outline-none dark:border-white/20 dark:bg-white/5 dark:text-sky-100 dark:ring-white/15 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-white/40"
              >
                Check my grades
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-self-start md:flex-col md:gap-2 md:justify-self-end md:text-center">
            <svg
              viewBox="0 0 120 120"
              className="h-24 w-24 sm:h-28 sm:w-28"
              role="presentation"
            >
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="hsl(221 83% 53% / 0.16)"
                strokeWidth="11"
              />
              {avgGrade !== null && (
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="hsl(199 90% 68%)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={
                    2 * Math.PI * 46 * (1 - Math.min(100, Math.max(0, avgGrade)) / 100)
                  }
                  transform="rotate(-90 60 60)"
                />
              )}
              <text
                x="60"
                y="57"
                textAnchor="middle"
                className="fill-foreground text-[22px] font-bold tabular-nums dark:fill-white"
              >
                {avgGrade !== null ? `${avgGrade.toFixed(0)}%` : "—"}
              </text>
              <text
                x="60"
                y="73"
                textAnchor="middle"
                className="fill-muted-foreground text-[8px] font-medium tracking-widest uppercase dark:fill-sky-200/70"
              >
                Average
              </text>
            </svg>
            <div>
              <p className="text-foreground text-xs font-semibold md:text-[11px] dark:text-sky-100/80">
                Average grade
              </p>
              <p className="text-muted-foreground text-[10px] dark:text-sky-200/60">
                Across graded courses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stat instruments ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          tone="primary"
          label="Courses"
          value={isLoading ? "—" : courses.length}
          caption="Enrolled this semester"
          progress={courses.length > 0 ? 100 : null}
        />
        <StatCard
          icon={ClipboardList}
          tone="info"
          label="Assignments"
          value={assignments.length > 0 ? pendingAssignments.length : "—"}
          caption={`${assignments.length} set · ${assignmentsCleared} cleared`}
          progress={assignmentsPct}
          urgent={pendingAssignments.length > 0}
        />
        <StatCard
          icon={FileQuestion}
          tone="warning"
          label="Assessments"
          value={assessments.length > 0 ? pendingAssessments.length : "—"}
          caption={`${assessments.length} published · ${assessmentsCleared} cleared`}
          progress={assessmentsPct}
          urgent={pendingAssessments.length > 0}
        />
        <StatCard
          icon={Bell}
          tone="success"
          label="Unread"
          value={unread}
          caption="Notifications waiting"
          progress={null}
          urgent={unread > 0}
          pulse={unread > 0}
        />
      </div>

      {/* ─── Main grid ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-3">
        <div className="space-y-4 sm:space-y-5 xl:col-span-2">
          {/* Up next — deadlines as calendar tiles */}
          <GlassCard>
            <PanelHeader
              icon={CalendarDays}
              tone="warning"
              title="Up next"
              right={
                <Link
                  href="/assignments"
                  className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <div className="border-border/60 border-b px-5 pb-3">
              <div className="text-muted-foreground flex items-center justify-between text-[10px] font-medium">
                <span>Set workload cleared</span>
                <span className="text-foreground font-semibold tabular-nums">
                  {clearedWork}/{totalWork} · {clearedPct}%
                </span>
              </div>
              <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${clearedPct}%` }}
                />
              </div>
            </div>
            <div className="p-3">
              {deadlines.length === 0 ? (
                <div className="border-success/20 bg-success/5 flex items-center gap-3 rounded-xl border p-4">
                  <CheckCircle2 className="text-success h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold">All caught up</p>
                    <p className="text-muted-foreground text-xs">
                      Nothing pending. New assignments and assessments will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {deadlines.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={d.href}
                        className="group hover:bg-primary/[0.04] flex items-center gap-3 rounded-xl p-1.5 pr-2 transition-colors"
                      >
                        <DateTile iso={d.due} kind={d.kind} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] leading-5 font-semibold">
                            {d.title}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-[9px] font-semibold tracking-[0.14em] uppercase">
                            <span className="course-code">{d.courseCode}</span> ·{" "}
                            {d.kind === "assignment" ? "Assignment" : "Assessment"}
                          </span>
                        </span>
                        <DueChip iso={d.due} />
                        <ChevronRight
                          className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </GlassCard>

          {/* My courses */}
          <GlassCard>
            <PanelHeader
              icon={BookOpen}
              tone="primary"
              title="My Courses"
              right={
                <Link
                  href="/courses"
                  className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                >
                  Go to courses
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <div className="p-3">
              {isLoading && (
                <div className="space-y-2 p-1">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}
              {!isLoading && courses.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No courses yet"
                  description="Your enrolled courses will appear here once registration is complete."
                />
              )}
              {!isLoading && courses.length > 0 && (
                <ul className="space-y-1.5">
                  {courses.map((e, index) => (
                    <li key={e.id}>
                      <Link
                        href={`/courses/${e.courseOffering.id}`}
                        className="group hover:bg-primary/[0.04] flex items-center gap-3 rounded-xl p-1.5 pr-2 transition-colors"
                      >
                        <span
                          className={cn(
                            "course-code flex min-h-11 max-w-24 min-w-11 shrink-0 items-center justify-center rounded-xl px-1.5 py-1 text-center text-[10px] leading-3 font-bold tracking-wide uppercase ring-1",
                            COURSE_TILES[index % COURSE_TILES.length]
                          )}
                        >
                          {e.courseOffering.course.code.split(" ")[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] leading-5 font-semibold">
                            {e.courseOffering.course.title}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-[9px] font-semibold tracking-[0.12em] uppercase">
                            <span className="course-code">
                              {e.courseOffering.course.code}
                            </span>{" "}
                            · Sec {e.courseOffering.section} ·{" "}
                            {e.courseOffering.course.credits} cr
                          </span>
                        </span>
                        <span className="bg-muted/70 text-muted-foreground shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase">
                          {e.courseOffering.semester.name}
                        </span>
                        <ChevronRight
                          className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ─── Side column ─────────────────────────────────────── */}
        <div className="space-y-4 sm:space-y-5">
          {/* Semester snapshot — timeline */}
          <GlassCard>
            <PanelHeader icon={LayoutGrid} tone="info" title="This semester" />
            <ol className="border-border/80 relative ml-7 space-y-4 border-l border-dashed pr-5 pb-4 pl-6">
              <TimelineItem
                icon={GraduationCap}
                tone="primary"
                label="Programme"
                value={programmeName ?? "—"}
              />
              <TimelineItem
                icon={CalendarDays}
                tone="info"
                label="Semester"
                value={semesterName ?? "—"}
              />
              <TimelineItem
                icon={Layers}
                tone="warning"
                label="Credits in progress"
                value={creditsInProgress > 0 ? String(creditsInProgress) : "—"}
              />
              <TimelineItem
                icon={BookOpen}
                tone="success"
                label="Courses"
                value={courses.length > 0 ? String(courses.length) : "—"}
              />
            </ol>
            <div className="border-border/60 border-t px-5 pt-3 pb-4">
              <p className="text-muted-foreground text-[11px] leading-5">
                Progress is saved across devices — close mid-lesson and pick up right
                where you left off.
              </p>
            </div>
          </GlassCard>

          {/* Quick links — six accents */}
          <GlassCard>
            <PanelHeader icon={LineChart} tone="success" title="Quick links" />
            <div className="grid grid-cols-2 gap-2 p-4 sm:gap-2.5">
              <QuickLink
                href="/calendar"
                label="Calendar"
                icon={CalendarDays}
                accent="bg-info/10 text-info ring-info/20"
              />
              <QuickLink
                href="/assignments"
                label="Assignments"
                icon={ClipboardList}
                accent="bg-warning/10 text-warning ring-warning/25"
              />
              <QuickLink
                href="/assessments"
                label="Assessments"
                icon={FileQuestion}
                accent="bg-primary/10 text-primary ring-primary/20"
              />
              <QuickLink
                href="/grades"
                label="Grades"
                icon={GraduationCap}
                accent="bg-success/10 text-success ring-success/20"
              />
              <QuickLink
                href="/notifications"
                label="Notifications"
                icon={Bell}
                accent="bg-danger/10 text-danger ring-danger/20"
              />
              <QuickLink
                href="/profile"
                label="Profile"
                icon={BookOpen}
                accent="bg-muted text-muted-foreground ring-border"
              />
            </div>
          </GlassCard>
        </div>
      </div>

      <p className="text-muted-foreground/80 text-center text-[10px] tracking-[0.2em] uppercase">
        {role} · GU-LMS
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */

const COURSE_TILES = [
  "bg-primary/10 text-primary ring-primary/20",
  "bg-info/10 text-info ring-info/20",
  "bg-success/10 text-success ring-success/20",
  "bg-warning/10 text-warning ring-warning/25",
];

function TimelineItem({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof BookOpen;
  tone: keyof typeof TONE_CHIP;
  label: string;
  value: string;
}) {
  return (
    <li className="relative flex items-center gap-3">
      <span
        className={cn(
          "absolute -left-[calc(1.5rem+13px)] flex h-6 w-6 items-center justify-center rounded-md ring-1",
          TONE_CHIP[tone]
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.16em] uppercase">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs leading-5 font-semibold">{value}</p>
      </div>
    </li>
  );
}
