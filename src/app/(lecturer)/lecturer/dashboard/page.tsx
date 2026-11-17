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
  Flag,
  LayoutDashboard,
  LineChart,
  User,
  Users,
} from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { GlassCard, PanelHeader } from "@/components/ui/glass-card";
import { DateTile } from "@/components/ui/date-tile";
import { StatCard } from "@/components/ui/stat-card";
import { DueChip, relativeDue } from "@/components/ui/due-chip";
import { QuickLink } from "@/components/ui/quick-link";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useLecturerDashboard,
  useMyTeachingCourses,
} from "@/features/lecturer/hooks/useLecturer";
import { LECTURER_ROLES, primaryRoleLabel } from "@/lib/constants/routes";
import { relativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function LecturerDashboardPage() {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useLecturerDashboard();
  const d = data?.data;
  const { data: coursesData, isLoading: coursesLoading } = useMyTeachingCourses();
  const courses = coursesData?.data ?? [];

  const role = primaryRoleLabel(user?.roles);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (isError) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <WelcomeHero
          greeting={greeting}
          firstName={user?.firstName}
          pending={null}
          upcomingTitle={null}
          upcomingDue={null}
        />
        <ErrorState
          title="Dashboard unavailable"
          description="The stats endpoint didn't respond. Check the backend and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const stats = d?.stats;
  const upcoming = d?.upcomingAssessments ?? [];
  const recent = d?.recentSubmissions ?? [];
  const pending = stats?.pendingSubmissions ?? null;
  const nextAssessment = upcoming.find((a) => a.availableFrom);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ─── Welcome hero ─────────────────────────────────────────── */}
      <WelcomeHero
        greeting={greeting}
        firstName={user?.firstName}
        pending={pending}
        upcomingTitle={nextAssessment?.title ?? null}
        upcomingDue={nextAssessment?.availableFrom ?? null}
      />

      {/* ─── Stat instruments ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          tone="primary"
          label="Active Courses"
          value={isLoading || !stats ? "—" : stats.activeCourses}
          caption="Courses you teach"
          progress={stats && stats.activeCourses > 0 ? 100 : null}
        />
        <StatCard
          icon={Users}
          tone="info"
          label="Students"
          value={isLoading || !stats ? "—" : stats.totalStudents}
          caption="Distinct learners enrolled"
          progress={null}
        />
        <StatCard
          icon={ClipboardList}
          tone="warning"
          label="Pending Grading"
          value={isLoading || !stats ? "—" : stats.pendingSubmissions}
          caption="Submissions awaiting review"
          progress={null}
          urgent={(stats?.pendingSubmissions ?? 0) > 0}
        />
        <StatCard
          icon={FileQuestion}
          tone="success"
          label="Upcoming"
          value={isLoading ? "—" : upcoming.length}
          caption="Assessments scheduled & published"
          progress={null}
        />
      </div>

      {/* ─── Main grid ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-3">
        <div className="space-y-4 sm:space-y-5 xl:col-span-2">
          {/* Recent submissions */}
          <GlassCard>
            <PanelHeader
              icon={ClipboardList}
              tone="info"
              title="Recent submissions"
              right={
                <Link
                  href="/lecturer/courses"
                  className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                >
                  My courses
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <div className="p-3">
              {isLoading && (
                <div className="space-y-2 p-1">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              )}
              {!isLoading && recent.length === 0 && (
                <div className="border-success/20 bg-success/5 flex items-center gap-3 rounded-xl border p-4">
                  <CheckCircle2 className="text-success h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold">Grading queue is clear</p>
                    <p className="text-muted-foreground text-xs">
                      New submissions will appear here as soon as students hand work in.
                    </p>
                  </div>
                </div>
              )}
              {!isLoading && recent.length > 0 && (
                <ul className="space-y-1.5">
                  {recent.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/lecturer/courses/${s.courseOfferingId}/assignments/${s.assignmentId}/submissions`}
                        className="group hover:bg-primary/[0.04] flex items-center gap-3 rounded-xl p-1.5 pr-2 transition-colors"
                      >
                        <span className="bg-info/10 text-info ring-info/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1">
                          {initials(s.studentName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] leading-5 font-semibold">
                            {s.studentName}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-[9px] font-semibold tracking-[0.14em] uppercase">
                            <span className="course-code">{s.courseCode}</span> ·{" "}
                            {s.assignmentTitle}
                          </span>
                        </span>
                        {s.isLate || s.status === "LATE" ? (
                          <span className="bg-warning/15 text-warning ring-warning/25 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase ring-1">
                            Late
                          </span>
                        ) : (
                          <span className="text-muted-foreground bg-muted shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase">
                            {relativeTime(s.submittedAt)}
                          </span>
                        )}
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
                  href="/lecturer/courses"
                  className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                >
                  Go to courses
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <div className="p-3">
              {coursesLoading && (
                <div className="space-y-2 p-1">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}
              {!coursesLoading && courses.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No courses yet"
                  description="You haven't been assigned to teach any courses."
                />
              )}
              {!coursesLoading && courses.length > 0 && (
                <ul className="space-y-1.5">
                  {courses.map((c, index) => (
                    <li key={c.id}>
                      <Link
                        href={`/lecturer/courses/${c.id}`}
                        className="group hover:bg-primary/[0.04] flex items-center gap-3 rounded-xl p-1.5 pr-2 transition-colors"
                      >
                        <span
                          className={cn(
                            "course-code flex min-h-11 max-w-24 min-w-11 shrink-0 items-center justify-center rounded-xl px-1.5 py-1 text-center text-[10px] leading-3 font-bold tracking-wide uppercase ring-1",
                            COURSE_TILES[index % COURSE_TILES.length]
                          )}
                        >
                          {c.course.code.split(" ")[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] leading-5 font-semibold">
                            {c.course.title}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-[9px] font-semibold tracking-[0.12em] uppercase">
                            <span className="course-code">{c.course.code}</span> · Sec{" "}
                            {c.section} · {c.studentCount}{" "}
                            {c.studentCount === 1 ? "student" : "students"}
                          </span>
                        </span>
                        {c.pendingSubmissions > 0 && (
                          <span className="bg-warning/15 text-warning ring-warning/25 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase ring-1">
                            {c.pendingSubmissions} to grade
                          </span>
                        )}
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
          {/* Upcoming assessments */}
          <GlassCard>
            <PanelHeader icon={FileQuestion} tone="warning" title="Upcoming assessments" />
            <div className="p-3">
              {isLoading && (
                <div className="space-y-2 p-1">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              )}
              {!isLoading && upcoming.length === 0 && (
                <div className="border-success/20 bg-success/5 flex items-center gap-3 rounded-xl border p-4">
                  <CheckCircle2 className="text-success h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold">Nothing scheduled</p>
                    <p className="text-muted-foreground text-xs">
                      Published assessments opening soon will appear here.
                    </p>
                  </div>
                </div>
              )}
              {!isLoading && upcoming.length > 0 && (
                <ul className="space-y-1.5">
                  {upcoming.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/lecturer/courses/${a.courseOfferingId}`}
                        className="group hover:bg-primary/[0.04] flex items-center gap-3 rounded-xl p-1.5 pr-2 transition-colors"
                      >
                        <DateTile iso={a.availableFrom} kind="assessment" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] leading-5 font-semibold">
                            {a.title}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-[9px] font-semibold tracking-[0.14em] uppercase">
                            <span className="course-code">{a.courseCode}</span> · Assessment
                          </span>
                        </span>
                        <DueChip iso={a.availableFrom} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </GlassCard>

          {/* Quick links — six accents */}
          <GlassCard>
            <PanelHeader icon={LineChart} tone="success" title="Quick links" />
            <div className="grid grid-cols-2 gap-2 p-4 sm:gap-2.5">
              <QuickLink
                href="/lecturer/dashboard"
                label="Home"
                icon={LayoutDashboard}
                accent="bg-primary/10 text-primary ring-primary/20"
              />
              <QuickLink
                href="/calendar"
                label="Calendar"
                icon={CalendarDays}
                accent="bg-info/10 text-info ring-info/20"
              />
              <QuickLink
                href="/lecturer/courses"
                label="My Courses"
                icon={BookOpen}
                accent="bg-warning/10 text-warning ring-warning/25"
              />
              <QuickLink
                href="/lecturer/appeals"
                label="Appeals"
                icon={Flag}
                accent="bg-danger/10 text-danger ring-danger/20"
              />
              <QuickLink
                href="/notifications"
                label="Notifications"
                icon={Bell}
                accent="bg-success/10 text-success ring-success/20"
              />
              <QuickLink
                href="/profile"
                label="Profile"
                icon={User}
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

function WelcomeHero({
  greeting,
  firstName,
  pending,
  upcomingTitle,
  upcomingDue,
}: {
  greeting: string;
  firstName?: string;
  pending: number | null;
  upcomingTitle: string | null;
  upcomingDue: string | null;
}) {
  const nextUp =
    upcomingTitle && upcomingDue
      ? ` Next up is “${upcomingTitle}” (${relativeDue(upcomingDue)}).`
      : "";

  return (
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
            Lecturer workspace
          </p>
          <h1 className="mt-2.5 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {greeting}, {firstName ?? "there"}.
          </h1>
          <p className="text-muted-foreground mt-2.5 max-w-md text-sm leading-6 dark:text-sky-100/85">
            {pending != null && pending > 0 ? (
              <>
                You have{" "}
                <span className="text-foreground font-semibold dark:text-white">
                  {pending} {pending === 1 ? "submission" : "submissions"}
                </span>{" "}
                awaiting grading.{nextUp}
              </>
            ) : (
              <>
                Your grading queue is clear — nothing waiting on you right now.
                {nextUp}
              </>
            )}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              href="/lecturer/courses"
              className="text-primary inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold shadow-[0_14px_30px_-12px_rgba(255,255,255,0.45)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
            >
              My courses
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/lecturer/appeals"
              className="border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/40 inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium backdrop-blur-sm transition-colors focus-visible:outline-none dark:border-white/20 dark:bg-white/5 dark:text-sky-100 dark:ring-white/15 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-white/40"
            >
              Review appeals
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
            <text
              x="60"
              y="57"
              textAnchor="middle"
              className={cn(
                "text-[22px] font-bold tabular-nums",
                pending != null && pending > 0
                  ? "fill-warning"
                  : "fill-foreground dark:fill-white"
              )}
            >
              {pending != null ? pending : "—"}
            </text>
            <text
              x="60"
              y="73"
              textAnchor="middle"
              className="fill-muted-foreground text-[8px] font-medium tracking-widest uppercase dark:fill-sky-200/70"
            >
              Pending
            </text>
          </svg>
          <div>
            <p className="text-foreground text-xs font-semibold md:text-[11px] dark:text-sky-100/80">
              Pending grading
            </p>
            <p className="text-muted-foreground text-[10px] dark:text-sky-200/60">
              Submissions awaiting review
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
