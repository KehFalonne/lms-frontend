"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

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
}

function getAssignedSessions() {
  return get<ApiResponse<AssignedSession[]>>("/ca-sessions/");
}

export default function InvigilatorSessionsPage() {
  return (
    <AuthGate requireStaffProfile>
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="CA Sessions"
          description="Review assigned examinations and open a live monitoring workspace."
        />
        <SessionsList />
      </div>
    </AuthGate>
  );
}

function SessionsList() {
  const sessions = useQuery({
    queryKey: ["invigilator-ca-sessions"],
    queryFn: getAssignedSessions,
  });
  const rows = sessions.data?.data ?? [];

  if (sessions.isLoading) return <Skeleton className="h-32 w-full" />;
  if (sessions.isError) {
    return (
      <ErrorState
        title="Could not load CA sessions"
        description={normalizeError(sessions.error).message}
        onRetry={() => sessions.refetch()}
      />
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No assigned CA sessions"
        description="Ask an administrator or lecturer to assign you to a proctored assessment."
      />
    );
  }

  return (
    <Card className="divide-border divide-y">
      {rows.map((session) => (
        <div
          key={session.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{session.title}</p>
            <p className="text-muted-foreground course-code text-xs">
              {session.courseCode}
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
  );
}
