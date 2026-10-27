"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionMatrix } from "@/features/admin/components/permission-matrix";
import {
  usePermissions,
  useRole,
  useRolePermissions,
  useSetRolePermissions,
  useUpdateRole,
} from "@/features/admin/hooks/useAdminRoles";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminRoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <RoleDetailContent params={params} />
    </AuthGate>
  );
}

function RoleDetailContent({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = use(params);
  const roleQ = useRole(roleId);
  const allPermsQ = usePermissions();
  const rolePermsQ = useRolePermissions(roleId);
  const updateRole = useUpdateRole(roleId);
  const setPerms = useSetRolePermissions(roleId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [meta, setMeta] = useState({ name: "", description: "" });
  const [dirty, setDirty] = useState({ meta: false, perms: false });

  useEffect(() => {
    if (rolePermsQ.data?.data) {
      setSelected(new Set(rolePermsQ.data.data.map((p) => p.id)));
      setDirty((d) => ({ ...d, perms: false }));
    }
  }, [rolePermsQ.data]);

  useEffect(() => {
    if (roleQ.data?.data) {
      setMeta({
        name: roleQ.data.data.name,
        description: roleQ.data.data.description ?? "",
      });
      setDirty((d) => ({ ...d, meta: false }));
    }
  }, [roleQ.data]);

  const role = roleQ.data?.data;

  if (roleQ.isLoading || allPermsQ.isLoading || rolePermsQ.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (roleQ.isError) return <ErrorState onRetry={() => roleQ.refetch()} />;
  if (!role) return <ErrorState title="Role not found" />;

  const permissions = allPermsQ.data?.data ?? [];
  const isSystem = role.isSystemRole;

  return (
    <div>
      <Link
        href="/admin/roles"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All roles
      </Link>

      <PageHeader
        title={role.name}
        description={`${role.code} · ${role.userCount} users · ${role.permissionCount} permissions`}
        actions={
          <>
            <Badge variant={isSystem ? "info" : "outline"}>
              {isSystem ? "System role" : "Custom role"}
            </Badge>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <Input
                value={meta.name}
                onChange={(e) => {
                  setMeta({ ...meta, name: e.target.value });
                  setDirty((d) => ({ ...d, meta: true }));
                }}
                disabled={isSystem}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Code (immutable)</label>
              <Input value={role.code} disabled />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea
              value={meta.description}
              onChange={(e) => {
                setMeta({ ...meta, description: e.target.value });
                setDirty((d) => ({ ...d, meta: true }));
              }}
              rows={2}
              disabled={isSystem}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() =>
                updateRole.mutate(meta, {
                  onSuccess: () => setDirty((d) => ({ ...d, meta: false })),
                })
              }
              disabled={!dirty.meta || isSystem}
              loading={updateRole.isPending}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Permissions
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {selected.size} of {permissions.length} permissions selected.
              </p>
            </div>
            <Button
              onClick={() =>
                setPerms.mutate(Array.from(selected), {
                  onSuccess: () => setDirty((d) => ({ ...d, perms: false })),
                })
              }
              disabled={!dirty.perms || isSystem}
              loading={setPerms.isPending}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save permissions
            </Button>
          </div>

          <PermissionMatrix
            permissions={permissions}
            selected={selected}
            onChange={(next) => {
              setSelected(next);
              setDirty((d) => ({ ...d, perms: true }));
            }}
            disabled={isSystem}
          />

          {isSystem && (
            <p className="border-info/30 bg-info/10 text-info mt-4 rounded-md border p-3 text-xs">
              System roles have their permissions managed by the platform and cannot be
              modified here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
