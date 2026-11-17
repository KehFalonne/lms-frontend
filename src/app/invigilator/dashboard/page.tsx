"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ListChecks, ShieldCheck } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { normalizeError } from "@/lib/api/errors";

interface AssignedSession {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  status: string;
  invigilator: { id: string; name: string } | null;
}

function getAssignedSessions() {
  return get<ApiResponse<AssignedSession[]>>("/ca-sessions/");
}

export default function InvigilatorDashboardPage() {
  return (
    <AuthGate requireStaffProfile>
      <InvigilatorDashboard />
    </AuthGate>
  );
}

function InvigilatorDashboard() {
  const sessions = useQuery({
    queryKey: ["invigilator-ca-sessions"],
    queryFn: getAssignedSessions,
  });
  const rows = sessions.data?.data ?? [];
  const activeCount = rows.filter((session) => session.status === "IN_PROGRESS").length;
  const assignedCount = rows.length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Invigilator Dashboard"
        description="View and monitor CA sessions assigned to you."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={ListChecks}
          label="Assigned sessions"
          value={sessions.isLoading ? "—" : assignedCount}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Active sessions"
          value={sessions.isLoading ? "—" : activeCount}
        />
        <SummaryCard icon={ClipboardList} label="Workspace" value="CA control" />
      </div>
      {sessions.isLoading && <Skeleton className="h-32 w-full" />}
      {sessions.isError && (
        <ErrorState
          title="Could not load assigned sessions"
          description={normalizeError(sessions.error).message}
          onRetry={() => sessions.refetch()}
        />
      )}
      {!sessions.isLoading && !sessions.isError && rows.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No assigned CA sessions"
          description="When an administrator or lecturer assigns you to a proctored assessment, it will appear here."
          action={
            <Link
              href="/invigilator/sessions"
              className="text-primary text-sm font-medium hover:underline"
            >
              Open CA sessions
            </Link>
          }
        />
      )}
      {!sessions.isLoading && !sessions.isError && rows.length > 0 && (
        <Card className="divide-border divide-y">
          {rows.map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{session.title}</p>
                <p className="text-muted-foreground text-xs">
                  <span className="course-code">{session.courseCode}</span> · Assigned
                  invigilator: {session.invigilator?.name ?? "You"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{session.status}</Badge>
                <Link
                  href={`/invigilator/sessions/${session.courseId}/${session.id}`}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm font-medium"
                >
                  Open monitor
                </Link>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </div>
    </Card>
  );
}
