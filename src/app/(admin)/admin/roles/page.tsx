"use client";
import Link from "next/link";
import { ChevronRight, Shield, Trash2 } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Define roles and the permissions they grant."
        actions={<RoleFormDialog />}
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && roles.length === 0 && (
        <EmptyState
          icon={Shield}
          title="No roles"
          description="Create a role to begin."
        />
      )}

      {!isLoading && !isError && roles.length > 0 && (
        <Card className="divide-border divide-y">
          {roles.map((r) => (
            <div
              key={r.id}
              className="hover:bg-surface/50 flex items-center gap-3 p-4 transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                <Shield className="h-5 w-5" />
              </div>
              <Link href={`/admin/roles/${r.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{r.name}</p>
                  <Badge variant="outline">{r.code}</Badge>
                  {r.isSystemRole && <Badge variant="info">System</Badge>}
                </div>
                {r.description && (
                  <p className="text-muted-foreground truncate text-xs">
                    {r.description}
                  </p>
                )}
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {r.userCount} users · {r.permissionCount} permissions
                </p>
              </Link>
              <div className="flex shrink-0 gap-1">
                <Link href={`/admin/roles/${r.id}`}>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!r.isSystemRole && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-danger"
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
        </Card>
      )}
    </div>
  );
}
