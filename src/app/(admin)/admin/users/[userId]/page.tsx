"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck, Trash2, UserCheck, UserX } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useActivateUser,
  useAdminUser,
  useAssignUserRole,
  useDeactivateUser,
  useRevokeUserRole,
  useResetUserPassword,
  useUserRoles,
} from "@/features/admin/hooks/useAdminUsers";
import { useRoles } from "@/features/admin/hooks/useAdminRoles";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/format";
import { UserFormDialog } from "@/features/admin/components/user-form-dialog";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <UserDetailContent params={params} />
    </AuthGate>
  );
}

function UserDetailContent({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const userQ = useAdminUser(userId);
  const rolesQ = useUserRoles(userId);
  const allRolesQ = useRoles();
  const activate = useActivateUser();
  const deactivate = useDeactivateUser();
  const revoke = useRevokeUserRole(userId);
  const assign = useAssignUserRole(userId);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const resetPassword = useResetUserPassword(userId);

  const user = userQ.data?.data;
  const assignments = rolesQ.data?.data ?? [];
  const allRoles = allRolesQ.data?.data ?? [];

  if (userQ.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (userQ.isError) {
    return <ErrorState onRetry={() => userQ.refetch()} />;
  }

  if (!user) return <ErrorState title="User not found" />;

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All users
      </Link>

      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        description={`${user.universityId} · ${user.email}`}
        actions={
          <>
            <UserFormDialog user={user} />
            <Button variant="outline" onClick={() => setResetOpen(true)}>
              <KeyRound className="mr-1.5 h-4 w-4" />
              Reset password
            </Button>
            {user.isActive ? (
              <Button
                variant="outline"
                onClick={() => deactivate.mutate(user.id)}
                loading={deactivate.isPending}
              >
                <UserX className="mr-1.5 h-4 w-4" />
                Deactivate
              </Button>
            ) : (
              <Button
                onClick={() => activate.mutate(user.id)}
                loading={activate.isPending}
              >
                <UserCheck className="mr-1.5 h-4 w-4" />
                Activate
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-8 pb-8 text-center">
            <Avatar size="lg" fallback={initials} src={user.avatar || null} />
            <h2 className="mt-4 text-lg font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              <Badge variant={user.status === "ACTIVE" ? "success" : "default"}>
                {user.status}
              </Badge>
              {user.isStaff && <Badge variant="outline">Staff</Badge>}
              {user.studentProfile && <Badge variant="outline">Student</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="University ID" value={user.universityId} />
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone || "—"} />
            <Row label="Status" value={user.status} />
            <Row
              label="Last Login"
              value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
            />
            <Row label="Created" value={formatDateTime(user.createdAt)} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Roles</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRoleId("");
              setAssignOpen(true);
            }}
          >
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            Assign role
          </Button>
        </CardHeader>
        <CardContent>
          {rolesQ.isLoading && <Skeleton className="h-20 w-full" />}
          {!rolesQ.isLoading && assignments.length === 0 && (
            <EmptyState
              title="No roles assigned"
              description="This user has no role assignments yet."
            />
          )}
          {!rolesQ.isLoading && assignments.length > 0 && (
            <ul className="divide-border divide-y">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.role.name}</p>
                      <Badge variant="outline">{a.role.code}</Badge>
                      <Badge variant="info">{a.scopeType}</Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Assigned{" "}
                      {a.assignedBy
                        ? `by ${a.assignedBy.firstName} ${a.assignedBy.lastName}`
                        : ""}
                      {" · "}
                      {formatDateTime(a.assignedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={() => revoke.mutate(a.id)}
                    loading={revoke.isPending}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={resetOpen}
        onClose={() => !resetPassword.isPending && setResetOpen(false)}
        title="Reset password"
        description={`Set a new password for ${user.firstName} ${user.lastName}. Existing sessions will be signed out.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={resetPassword.isPending}
              disabled={newPassword.length < 8 || newPassword !== passwordConfirmation}
              onClick={() =>
                resetPassword.mutate(
                  { password: newPassword, passwordConfirmation },
                  {
                    onSuccess: () => {
                      setNewPassword("");
                      setPasswordConfirmation("");
                      setResetOpen(false);
                    },
                  }
                )
              }
            >
              Reset password
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">New password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Confirm new password
            </label>
            <Input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={assignOpen}
        onClose={() => !assign.isPending && setAssignOpen(false)}
        title="Assign role"
        description={`Assign a role to ${user.firstName} ${user.lastName}.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setAssignOpen(false)}
              disabled={assign.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                assign.mutate(
                  { roleId: selectedRoleId, scopeType: "GLOBAL" },
                  { onSuccess: () => setAssignOpen(false) }
                )
              }
              loading={assign.isPending}
              disabled={!selectedRoleId}
            >
              Assign
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Role</label>
            <Select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              placeholder="Select a role"
              options={allRoles
                .filter(
                  (r) =>
                    !user.studentProfile ||
                    !["LECTURER", "TEACHING_ASSISTANT"].includes(r.code)
                )
                .map((r) => ({
                  value: r.id,
                  label: `${r.name} (${r.code})`,
                }))}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Scoped roles (faculty, department, course) arrive in Sprint 10B. For now, all
            roles are assigned at the global scope.
          </p>
          {user.studentProfile && (
            <p className="text-muted-foreground text-xs">
              Teaching roles (Lecturer, Teaching Assistant) are not available for student
              profiles.
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex justify-between border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
