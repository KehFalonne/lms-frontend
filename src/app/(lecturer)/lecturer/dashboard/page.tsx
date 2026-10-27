"use client";
import Link from "next/link";
import { BookOpen, ChevronRight, ClipboardList, FileQuestion, Users } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLecturerDashboard } from "@/features/lecturer/hooks/useLecturer";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LECTURER_ROLES } from "@/lib/constants/routes";
import { formatDateTime, relativeTime } from "@/lib/utils/format";

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

  if (isError) {
    return (
      <div>
        <PageHeader
          title={`Welcome, ${user?.firstName ?? "Lecturer"}`}
          description="Could not load your dashboard."
        />
        <ErrorState
          title="Dashboard unavailable"
          description="The stats endpoint didn't respond. Check the backend and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (isLoading || !d || !d.stats) {
    return (
      <div>
        <PageHeader
          title={`Welcome, ${user?.firstName ?? "Lecturer"}`}
          description="Loading your dashboard..."
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.firstName ?? "Lecturer"}`}
        description="Here's what needs your attention today."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Active Courses" value={d.stats.activeCourses} icon={BookOpen} />
        <StatCard label="Total Students" value={d.stats.totalStudents} icon={Users} />
        <StatCard
          label="Pending Grading"
          value={d.stats.pendingSubmissions}
          icon={ClipboardList}
          accent={d.stats.pendingSubmissions > 0}
        />
        <StatCard
          label="Upcoming"
          value={d.upcomingAssessments.length}
          icon={FileQuestion}
        />
      </div>

      {/* two cards below — unchanged */}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium sm:text-sm">{label}</p>
          <p
            className={`mt-1 text-xl font-semibold tracking-tight sm:mt-2 sm:text-2xl ${
              accent ? "text-warning" : ""
            }`}
          >
            {value}
          </p>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9 ${
            accent ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
