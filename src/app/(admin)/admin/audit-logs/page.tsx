"use client";
import { useState } from "react";
import { ScrollText, Search } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/features/admin/hooks/useAuditLogs";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/format";
import { useDebounce } from "@/hooks/useDebounce";

const COMMON_ACTIONS = [
  "USER_CREATED",
  "USER_DEACTIVATED",
  "USER_ROLE_ASSIGNED",
  "COURSE_PUBLISHED",
  "GRADE_UPDATED",
  "GRADE_PUBLISHED",
  "ASSESSMENT_PUBLISHED",
  "ASSESSMENT_INVALIDATED",
];

export default function AdminAuditLogsPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <AuditLogsContent />
    </AuthGate>
  );
}

function AuditLogsContent() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    action: action || undefined,
    entityType: debounced || entityType || undefined,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
  };

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of sensitive system actions."
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <Select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          placeholder="All actions"
          options={COMMON_ACTIONS.map((a) => ({ value: a, label: a }))}
        />
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Filter by entity type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && logs.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No audit records"
          description="Actions will be recorded here as they occur."
        />
      )}

      {!isLoading && !isError && logs.length > 0 && (
        <>
          <Card className="divide-border divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-4">
                <div className="bg-primary mt-1 h-2 w-2 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{log.action}</Badge>
                    <span className="text-muted-foreground text-xs">
                      {log.actor
                        ? `${log.actor.firstName} ${log.actor.lastName} (${log.actor.universityId})`
                        : "System"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs">
                    <span className="text-muted-foreground">Entity:</span>{" "}
                    <span className="font-medium">{log.entityType}</span>
                    {log.entityId && (
                      <span className="text-muted-foreground ml-1 font-mono text-[10px]">
                        {log.entityId.slice(0, 8)}...
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatDateTime(log.createdAt)}
                    {log.ipAddress && ` · ${log.ipAddress}`}
                  </p>
                </div>
              </div>
            ))}
          </Card>
          <div className="mt-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
