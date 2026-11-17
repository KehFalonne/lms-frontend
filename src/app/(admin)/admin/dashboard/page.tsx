"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Layers,
  LayoutGrid,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AuthGate } from "@/components/layout/auth-gate";
import { DateTile } from "@/components/ui/date-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { GlassCard, PanelHeader, TONE_CHIP } from "@/components/ui/glass-card";
import { QuickLink } from "@/components/ui/quick-link";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminStats } from "@/features/admin/api/admin.api";
import { useAuditLogs } from "@/features/admin/hooks/useAuditLogs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCourseOfferings } from "@/features/courses/hooks/useOfferings";
import { ADMIN_ROLES, primaryRoleLabel } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";

export default function AdminDashboardPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <AdminDashboardContent />
    </AuthGate>
  );
}

const COURSE_TILES = [
  "bg-primary/10 text-primary ring-primary/20",
  "bg-info/10 text-info ring-info/20",
  "bg-success/10 text-success ring-success/20",
  "bg-warning/10 text-warning ring-warning/25",
];

function AdminDashboardContent() {
  const { user } = useAuth();
  const role = primaryRoleLabel(user?.roles);

  // Queries
  const statsQ = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    staleTime: 30_000,
  });
  const auditQ = useAuditLogs({ page: 1 });
  const offeringsQ = useCourseOfferings();

  const stats = statsQ.data?.data;
  const recentLogs = (auditQ.data?.data ?? []).slice(0, 6);
  const offerings = (offeringsQ.data?.data ?? []).slice(0, 10);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ─── Hero banner ─────────────────────────────────────────── */}
      <WelcomeHero
        greeting={greeting}
        firstName={user?.firstName}
        roleTitle={role}
        programmesCount={stats?.activeProgrammes ?? null}
        coursesCount={stats?.activeCourses ?? null}
      />

      {statsQ.isError && (
        <ErrorState
          title="Could not load institutional statistics"
          description="The system metrics endpoint didn't respond. Check connectivity and try again."
          onRetry={() => statsQ.refetch()}
        />
      )}

      {/* ─── Metric instruments ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          tone="primary"
          label="Total Students"
          value={statsQ.isLoading || !stats ? "—" : stats.students}
          caption="Registered student learners"
          progress={stats && stats.students > 0 ? 100 : null}
        />
        <StatCard
          icon={Building2}
          tone="info"
          label="Faculty & Staff"
          value={statsQ.isLoading || !stats ? "—" : stats.staff}
          caption="Academic instructors & staff"
          progress={null}
        />
        <StatCard
          icon={BookOpen}
          tone="success"
          label="Active Offerings"
          value={statsQ.isLoading || !stats ? "—" : stats.activeCourses}
          caption="Scheduled course sections"
          progress={null}
        />
        <StatCard
          icon={GraduationCap}
          tone="warning"
          label="Programmes"
          value={statsQ.isLoading || !stats ? "—" : stats.activeProgrammes}
          caption="Accredited degree tracks"
          progress={null}
        />
      </div>

      {/* ─── Main operations grid ─────────────────────────────────── */}
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-3">
        {/* Left Column: Recent Audit & Course Offerings (2 cols) */}
        <div className="space-y-4 sm:space-y-5 xl:col-span-2">
          {/* Recent System Audit Events */}
          <GlassCard>
            <PanelHeader
              icon={ShieldCheck}
              tone="info"
              title="Recent Security & Audit Activity"
              right={
                <Link
                  href="/admin/audit-logs"
                  className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                >
                  View all audit logs
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <div className="p-3 sm:p-4">
              {auditQ.isLoading && (
                <div className="space-y-2.5 p-1">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              )}

              {!auditQ.isLoading && recentLogs.length === 0 && (
                <div className="border-border/60 bg-muted/20 flex items-center gap-3 rounded-xl border p-4">
                  <CheckCircle2 className="text-success h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold">Audit trail is current</p>
                    <p className="text-muted-foreground text-xs">
                      Security-sensitive administrative actions will be logged here in
                      real time.
                    </p>
                  </div>
                </div>
              )}

              {!auditQ.isLoading && recentLogs.length > 0 && (
                <ul className="space-y-2">
                  {recentLogs.map((log) => {
                    const actionTone =
                      log.action.includes("CREATE") || log.action.includes("ASSIGN")
                        ? "bg-success/10 text-success ring-success/20"
                        : log.action.includes("DELETE") || log.action.includes("REVOKE")
                          ? "bg-danger/10 text-danger ring-danger/20"
                          : "bg-info/10 text-info ring-info/20";

                    const actorName = log.actor
                      ? `${log.actor.firstName} ${log.actor.lastName}`.trim()
                      : "System Event";

                    return (
                      <li
                        key={log.id}
                        className="border-border/40 hover:bg-primary/[0.03] group flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-colors sm:px-3.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1",
                              actionTone
                            )}
                          >
                            <Shield className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-foreground truncate text-[12px] font-semibold">
                                {actorName}
                              </span>
                              <span className="text-muted-foreground text-[10px]">·</span>
                              <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase">
                                {log.action}
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                              Entity:{" "}
                              <span className="text-foreground font-medium">
                                {log.entityType}
                              </span>
                              {log.actor?.email ? ` (${log.actor.email})` : ""}
                            </p>
                          </div>
                        </div>

                        <span className="text-muted-foreground shrink-0 text-[10px] font-medium">
                          {relativeTime(log.createdAt)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </GlassCard>

          {/* Active Course Offerings & Staffing */}
          <GlassCard>
            <PanelHeader
              icon={BookOpen}
              tone="primary"
              title="Course Delivery & Section Staffing"
              right={
                <Link
                  href="/admin/course-offerings"
                  className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors hover:underline"
                >
                  Manage offerings
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              }
            />
            <div className="p-3 sm:p-4">
              {offeringsQ.isLoading && (
                <div className="space-y-2.5 p-1">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              )}

              {!offeringsQ.isLoading && offerings.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No course offerings scheduled"
                  description="Create and schedule course offerings for the current semester to staff lecturers and enroll students."
                  action={
                    <Link href="/admin/course-offerings">
                      <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
                        Schedule First Offering
                      </span>
                    </Link>
                  }
                />
              )}

              {!offeringsQ.isLoading && offerings.length > 0 && (
                <ul className="space-y-2">
                  {offerings.map((o, idx) => (
                    <li
                      key={o.id}
                      className="border-border/40 hover:bg-primary/[0.03] group flex flex-col justify-between gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold tracking-tight uppercase ring-1",
                            COURSE_TILES[idx % COURSE_TILES.length]
                          )}
                        >
                          {o.course.code.split(" ")[0] || "CRS"}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-foreground truncate text-[13px] font-semibold">
                              {o.course.title}
                            </span>
                            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-[10px] font-bold">
                              {o.semester.name}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-[11px]">
                            {o.course.code} · {o.semester.name} · {o.enrolledCount}/
                            {o.capacity} enrolled
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                        <Link
                          href={`/admin/course-offerings/${o.id}/students`}
                          className="text-primary hover:bg-primary/10 border-primary/20 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors"
                        >
                          Roster ({o.enrolledCount})
                        </Link>
                        <Link
                          href="/admin/course-offerings"
                          className="text-muted-foreground hover:text-foreground p-1"
                          title="View on offerings dashboard"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Institutional Shortcuts & System Status (1 col) */}
        <div className="space-y-4 sm:space-y-5">
          {/* Institutional Operations Quick Links */}
          <GlassCard>
            <PanelHeader
              icon={LayoutGrid}
              tone="success"
              title="Administrative Portals"
            />
            <div className="grid grid-cols-2 gap-2 p-3 sm:gap-2.5 sm:p-4">
              <QuickLink
                href="/admin/users"
                label="Users & Accounts"
                icon={Users}
                accent="bg-info/10 text-info ring-info/20"
              />
              <QuickLink
                href="/admin/course-offerings"
                label="Course Offerings"
                icon={Layers}
                accent="bg-primary/10 text-primary ring-primary/20"
              />
              <QuickLink
                href="/admin/programmes"
                label="Programmes"
                icon={GraduationCap}
                accent="bg-warning/10 text-warning ring-warning/25"
              />
              <QuickLink
                href="/admin/academic-years"
                label="Academic Terms"
                icon={CalendarDays}
                accent="bg-success/10 text-success ring-success/20"
              />
              <QuickLink
                href="/admin/roles"
                label="Roles & RBAC"
                icon={ShieldCheck}
                accent="bg-danger/10 text-danger ring-danger/20"
              />
              <QuickLink
                href="/admin/settings"
                label="System Config"
                icon={Settings}
                accent="bg-muted text-muted-foreground ring-border"
              />
            </div>
          </GlassCard>

          {/* Academic Operations Checklist */}
          <GlassCard>
            <PanelHeader icon={Activity} tone="warning" title="Academic Readiness" />
            <ol className="border-border/80 relative ml-6 space-y-4 border-l border-dashed pt-1 pr-4 pb-4 pl-5 text-xs">
              <TimelineItem
                icon={CalendarDays}
                tone="primary"
                label="Active Term Status"
                value="Semester Delivery Active"
              />
              <TimelineItem
                icon={BookOpen}
                tone="info"
                label="Scheduled Offerings"
                value={`${stats?.activeCourses ?? 0} active offerings`}
              />
              <TimelineItem
                icon={GraduationCap}
                tone="warning"
                label="Degree Programmes"
                value={`${stats?.activeProgrammes ?? 0} active programmes`}
              />
              <TimelineItem
                icon={UserCheck}
                tone="success"
                label="Teaching Staff"
                value={`${stats?.staff ?? 0} academic staff`}
              />
            </ol>
            <div className="border-border/60 border-t px-4 py-3">
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                RBAC permissions and course delivery state are managed centrally with
                audit logging.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <p className="text-muted-foreground/80 text-center text-[10px] tracking-[0.2em] uppercase">
        {role} · GU-LMS Institutional Admin
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function WelcomeHero({
  greeting,
  firstName,
  roleTitle,
  programmesCount,
  coursesCount,
}: {
  greeting: string;
  firstName?: string;
  roleTitle: string;
  programmesCount: number | null;
  coursesCount: number | null;
}) {
  return (
    <section className="border-primary/10 text-foreground relative overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,hsl(221_83%_53%/0.08)_0%,hsl(215_90%_60%/0.12)_52%,hsl(226_72%_44%/0.08)_100%)] p-5 shadow-[0_30px_70px_-32px_hsl(221_83%_30%/0.18)] sm:p-7 dark:border-white/10 dark:bg-[linear-gradient(135deg,hsl(226_58%_15%)_0%,hsl(221_72%_28%)_55%,hsl(215_90%_46%)_125%)] dark:text-white dark:shadow-[0_30px_70px_-32px_hsl(221_83%_30%/0.65)]">
      {/* Decorative vector background */}
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
          <p className="text-primary/80 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase dark:text-white/70">
            <span aria-hidden className="bg-primary/50 h-px w-6 dark:bg-white/40" />
            Institutional Administration
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-xs leading-relaxed sm:text-sm dark:text-white/80">
            Manage academic faculties, user accounts, and course staffing. Oversee
            institutional delivery across{" "}
            <span className="text-foreground font-semibold dark:text-white">
              {programmesCount != null
                ? `${programmesCount} programmes`
                : "accredited programmes"}
            </span>{" "}
            and{" "}
            <span className="text-foreground font-semibold dark:text-white">
              {coursesCount != null
                ? `${coursesCount} active offerings`
                : "active courses"}
            </span>
            .
          </p>
        </div>

        {/* Right date/time instrument */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <DateTile iso={new Date().toISOString()} />
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE_CHIP;
  label: string;
  value: string;
}) {
  return (
    <li className="relative">
      <span
        className={cn(
          "ring-background absolute top-0 -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-2",
          TONE_CHIP[tone]
        )}
      >
        <Icon className="h-3 w-3" />
      </span>
      <div>
        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
          {label}
        </p>
        <p className="text-foreground mt-0.5 text-xs font-semibold">{value}</p>
      </div>
    </li>
  );
}
