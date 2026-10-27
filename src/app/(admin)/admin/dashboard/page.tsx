"use client";
import Link from "next/link";
import { BookOpen, Building2, ChevronRight, Users } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/features/admin/api/admin.api";
import { useAuditLogs } from "@/features/admin/hooks/useAuditLogs";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { relativeTime } from "@/lib/utils/format";

export default function AdminDashboardPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const statsQ = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    staleTime: 30_000,
  });
  const auditQ = useAuditLogs({ page: 1 });
  const stats = statsQ.data?.data;
  const recentLogs = (auditQ.data?.data ?? []).slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Administrator Dashboard"
        description="Institutional overview and recent activity."
      />

      {statsQ.isError && (
        <ErrorState
          title="Could not load stats"
          description="The metrics endpoint didn't respond."
          onRetry={() => statsQ.refetch()}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Students"
          value={statsQ.isLoading ? "—" : (stats?.students ?? 0)}
          icon={Users}
        />
        <StatCard
          label="Staff"
          value={statsQ.isLoading ? "—" : (stats?.staff ?? 0)}
          icon={Building2}
        />
        <StatCard
          label="Active Courses"
          value={statsQ.isLoading ? "—" : (stats?.activeCourses ?? 0)}
          icon={BookOpen}
        />
        <StatCard
          label="Programmes"
          value={statsQ.isLoading ? "—" : (stats?.activeProgrammes ?? 0)}
          icon={BookOpen}
        />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Link
            href="/admin/audit-logs"
            className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {auditQ.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {!auditQ.isLoading && recentLogs.length === 0 && (
            <EmptyState
              title="No activity yet"
              description="Sensitive actions will appear here as they occur."
            />
          )}
          {!auditQ.isLoading && recentLogs.length > 0 && (
            <ul className="divide-border divide-y">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-3 py-2.5">
                  <div className="bg-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="primary">{log.action}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {log.actor
                          ? `${log.actor.firstName} ${log.actor.lastName}`
                          : "System"}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {log.entityType} · {relativeTime(log.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight sm:mt-2 sm:text-2xl">
            {value}
          </p>
        </div>
        <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
