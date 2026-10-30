"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { normalizeError } from "@/lib/api/errors";

interface CASession {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  status: string;
  invigilator: { id: string; name: string } | null;
}

function listCASessions() {
  return get<ApiResponse<CASession[]>>("/ca-sessions/");
}

export default function AdminCASessionsPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <CASessionsContent />
    </AuthGate>
  );
}

function CASessionsContent() {
  const sessions = useQuery({
    queryKey: ["admin-ca-sessions"],
    queryFn: listCASessions,
  });
  const rows = sessions.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="CA Sessions"
        description="Open a CA monitor, review the appointed invigilator, and take administrator control."
      />
      {sessions.isLoading && <Skeleton className="h-24 w-full" />}
      {sessions.isError && (
        <ErrorState
          title="Could not load CA sessions"
          description={normalizeError(sessions.error).message}
          onRetry={() => sessions.refetch()}
        />
      )}
      {!sessions.isLoading && !sessions.isError && rows.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No proctored CA sessions"
          description="Enable proctoring on an assessment to make it appear here."
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
                  {session.courseCode} · Invigilator:{" "}
                  {session.invigilator?.name ?? "Not assigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{session.status}</Badge>
                <Link
                  href={`/lecturer/courses/${session.courseId}/assessments/${session.id}/monitor`}
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
