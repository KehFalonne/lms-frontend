"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search, ScrollText, Shield } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditFacets, useAuditLogs } from "@/features/admin/hooks/useAuditLogs";
import { formatDateTime, relativeTime } from "@/lib/utils/format";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils/cn";

export default function AdminAuditLogsPage() {
  return (
    <AuthGate requiredPermission="audit.view">
      <AuditLogsContent />
    </AuthGate>
  );
}

function AuditLogsContent() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [actor, setActor] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedActor = useDebounce(actor, 300);

  const { data: facets } = useAuditFacets();
  const actions = facets?.data?.actions ?? [];
  const entityTypes = facets?.data?.entityTypes ?? [];

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    action: action || undefined,
    entityType: entityType || undefined,
    actor: debouncedActor || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
  };

  const hasFilters = Boolean(
    action || entityType || actor || createdFrom || createdTo
  );
  const resetFilters = () => {
    setAction("");
    setEntityType("");
    setActor("");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security Audit & Compliance Trail"
        title="Audit Logs"
        description="Immutable chronological record of sensitive institutional actions, credential modifications, and grading events."
      />

      {/* ─── Filters ─────────────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <Select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="h-9 text-xs"
          options={[
            { value: "", label: "All actions" },
            ...actions.map((a) => ({ value: a, label: a })),
          ]}
        />
        <Select
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
          className="h-9 text-xs"
          options={[
            { value: "", label: "All entity types" },
            ...entityTypes.map((t) => ({ value: t, label: t })),
          ]}
        />
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Filter by actor (name, email, ID)…"
            value={actor}
            onChange={(e) => {
              setActor(e.target.value);
              setPage(1);
            }}
            className="h-9 pl-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            aria-label="From date"
            value={createdFrom}
            max={createdTo || undefined}
            onChange={(e) => {
              setCreatedFrom(e.target.value);
              setPage(1);
            }}
            className="h-9 px-2 text-xs"
          />
          <span className="text-muted-foreground shrink-0 text-[10px]">→</span>
          <Input
            type="date"
            aria-label="To date"
            value={createdTo}
            min={createdFrom || undefined}
            onChange={(e) => {
              setCreatedTo(e.target.value);
              setPage(1);
            }}
            className="h-9 px-2 text-xs"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground h-7 px-2 text-[11px]"
          >
            Clear filters
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-18 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && logs.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No audit records match your filters"
          description="Security and operational actions will be permanently logged here as they occur."
          action={
            hasFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
                Reset audit filters
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && logs.length > 0 && (
        <>
          <div className="ring-primary/10 divide-border/40 divide-y overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/75">
            {logs.map((log) => {
              const isDestructive =
                log.action.includes("DELETE") ||
                log.action.includes("REVOKE") ||
                log.action.includes("DEACTIVATE") ||
                log.action.includes("INVALIDATE");

              const isCreation =
                log.action.includes("CREATE") ||
                log.action.includes("ASSIGN") ||
                log.action.includes("PUBLISH");

              const actionBadgeVariant = isDestructive
                ? "danger"
                : isCreation
                  ? "success"
                  : "primary";

              const isExpanded = expandedId === log.id;
              const hasDiff =
                (log.oldValues && Object.keys(log.oldValues).length > 0) ||
                (log.newValues && Object.keys(log.newValues).length > 0);

              return (
                <div
                  key={log.id}
                  className="divide-border/30 transition-colors divide-y"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="hover:bg-primary/[0.03] flex cursor-pointer items-start gap-3.5 p-4 sm:px-5"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1",
                        isDestructive
                          ? "bg-danger/10 text-danger ring-danger/20"
                          : isCreation
                            ? "bg-success/10 text-success ring-success/20"
                            : "bg-primary/10 text-primary ring-primary/20"
                      )}
                    >
                      <Shield className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={actionBadgeVariant}
                          className="font-mono text-[10px]"
                        >
                          {log.action}
                        </Badge>
                        <span className="text-foreground text-xs font-semibold">
                          {log.actor
                            ? `${log.actor.firstName} ${log.actor.lastName}`
                            : "System Engine"}
                        </span>
                        {log.actor?.universityId && (
                          <span className="text-muted-foreground font-mono text-[10px]">
                            ({log.actor.universityId})
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <p className="text-muted-foreground text-[11px]">
                          Target Entity:{" "}
                          <span className="text-foreground font-semibold">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <span className="text-muted-foreground ml-1 font-mono text-[10px]">
                              [{log.entityId.slice(0, 8)}]
                            </span>
                          )}
                        </p>

                        {log.ipAddress && (
                          <span className="text-muted-foreground font-mono text-[10px]">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground mt-0.5 text-[10px] font-medium">
                        {formatDateTime(log.createdAt)} ({relativeTime(log.createdAt)})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-center text-xs text-muted-foreground">
                      <span className="hidden sm:inline font-mono text-[10px]">
                        {isExpanded ? "Collapse" : "Inspect"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* ─── Expandable Forensic Inspector ────────────────────── */}
                  {isExpanded && (
                    <div className="bg-slate-50/75 p-4 text-xs dark:bg-slate-900/60 sm:p-5 space-y-3.5 border-t border-border/20">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Actor & Telemetry */}
                        <div className="space-y-1.5 rounded-xl border border-border/50 bg-white/70 p-3 shadow-xs dark:bg-slate-800/60">
                          <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                            Security Telemetry
                          </p>
                          <div className="space-y-1 text-[11px] font-mono">
                            <p className="text-foreground">
                              <span className="text-muted-foreground font-sans">Audit ID:</span>{" "}
                              {log.id}
                            </p>
                            <p className="text-foreground">
                              <span className="text-muted-foreground font-sans">Actor Email:</span>{" "}
                              {log.actor?.email || "N/A (System)"}
                            </p>
                            <p className="text-foreground">
                              <span className="text-muted-foreground font-sans">IP Address:</span>{" "}
                              {log.ipAddress || "Internal / Local"}
                            </p>
                            {log.userAgent && (
                              <p className="text-muted-foreground break-all text-[10px]">
                                <span className="font-sans">User Agent:</span> {log.userAgent}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Metadata if any */}
                        <div className="space-y-1.5 rounded-xl border border-border/50 bg-white/70 p-3 shadow-xs dark:bg-slate-800/60">
                          <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                            Context & Metadata
                          </p>
                          {log.metadata && Object.keys(log.metadata).length > 0 ? (
                            <pre className="max-h-28 overflow-auto rounded bg-slate-100 p-2 font-mono text-[10px] dark:bg-slate-950/80">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-muted-foreground text-[11px] italic">
                              No supplemental metadata recorded.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* State Diff (Old Values vs New Values) */}
                      {hasDiff ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1 rounded-xl border border-border/50 bg-white/70 p-3 dark:bg-slate-800/60">
                            <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400">
                              Previous Values (Before)
                            </p>
                            <pre className="max-h-36 overflow-auto rounded bg-slate-100 p-2 font-mono text-[10px] dark:bg-slate-950/80">
                              {log.oldValues
                                ? JSON.stringify(log.oldValues, null, 2)
                                : "null"}
                            </pre>
                          </div>
                          <div className="space-y-1 rounded-xl border border-border/50 bg-white/70 p-3 dark:bg-slate-800/60">
                            <p className="text-[10px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                              New Values (After)
                            </p>
                            <pre className="max-h-36 overflow-auto rounded bg-slate-100 p-2 font-mono text-[10px] dark:bg-slate-950/80">
                              {log.newValues
                                ? JSON.stringify(log.newValues, null, 2)
                                : "null"}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-[11px] italic">
                          No state mutations recorded for this event.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
