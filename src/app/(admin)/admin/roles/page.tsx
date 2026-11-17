"use client";
import Link from "next/link";
import { ChevronRight, Shield, ShieldCheck, Trash2 } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleFormDialog } from "@/features/admin/components/role-form-dialog";
import { useDeleteRole, useRoles } from "@/features/admin/hooks/useAdminRoles";
import { ADMIN_ROLES } from "@/lib/constants/routes";

export default function AdminRolesPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <RolesContent />
    </AuthGate>
  );
}

function RolesContent() {
  const { data, isLoading, isError, refetch } = useRoles();
  const del = useDeleteRole();
  const roles = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security & Access Governance"
        title="Roles &amp; Permissions"
        description="Configure institutional roles, define fine-grained permission scopes, and manage access privileges across faculties."
        actions={<RoleFormDialog />}
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && roles.length === 0 && (
        <EmptyState
          icon={Shield}
          title="No custom roles defined"
          description="Create custom institutional roles to assign RBAC permissions."
        />
      )}

      {!isLoading && !isError && roles.length > 0 && (
        <div className="ring-primary/10 divide-border/40 divide-y overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/75">
          {roles.map((r) => (
            <div
              key={r.id}
              className="hover:bg-primary/[0.03] flex items-center justify-between gap-4 p-4 transition-colors sm:px-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <div className="bg-primary/10 text-primary ring-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Link href={`/admin/roles/${r.id}`} className="group min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-foreground group-hover:text-primary text-xs font-semibold transition-colors sm:text-sm">
                      {r.name}
                    </p>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {r.code}
                    </Badge>
                    {r.isSystemRole && (
                      <Badge variant="info" className="text-[10px]">
                        System Default
                      </Badge>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {r.description}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 text-[11px] font-medium">
                    <span className="text-foreground font-semibold">{r.userCount}</span>{" "}
                    assigned user{r.userCount === 1 ? "" : "s"} ·{" "}
                    <span className="text-foreground font-semibold">
                      {r.permissionCount}
                    </span>{" "}
                    permissions granted
                  </p>
                </Link>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Link href={`/admin/roles/${r.id}`}>
                  <Button variant="outline" size="sm" className="h-8 gap-1 px-3 text-xs">
                    Configure
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                {!r.isSystemRole && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-danger hover:bg-danger/10 h-8 w-8"
                    title="Delete role"
                    onClick={() => {
                      if (confirm(`Delete role "${r.name}"?`)) {
                        del.mutate(r.id);
                      }
                    }}
                    loading={del.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
