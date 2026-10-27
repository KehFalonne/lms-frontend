"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { UserFormDialog } from "@/features/admin/components/user-form-dialog";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { relativeTime } from "@/lib/utils/format";

export default function AdminUsersPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <UsersContent />
    </AuthGate>
  );
}

function UsersContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debounced = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    search: debounced,
    status: status || undefined,
  });

  const users = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage all system users."
        actions={<UserFormDialog />}
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search name, email, university ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder="All statuses"
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "PENDING", label: "Pending" },
            { value: "SUSPENDED", label: "Suspended" },
            { value: "INACTIVE", label: "Inactive" },
            { value: "LOCKED", label: "Locked" },
          ]}
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && users.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users"
          description="Try a different search, or create your first user."
        />
      )}

      {!isLoading && !isError && users.length > 0 && (
        <>
          <Card className="divide-border divide-y">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="hover:bg-surface/50 flex items-center gap-3 p-3 transition-colors sm:p-4"
              >
                <Avatar
                  size="md"
                  fallback={`${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase()}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {u.firstName} {u.lastName}
                    </p>
                    <Badge
                      variant={
                        u.status === "ACTIVE"
                          ? "success"
                          : u.status === "SUSPENDED"
                            ? "danger"
                            : "default"
                      }
                    >
                      {u.status}
                    </Badge>
                    {u.isStaff && <Badge variant="outline">Staff</Badge>}
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {u.universityId} · {u.email}
                  </p>
                </div>
                <div className="text-muted-foreground hidden shrink-0 text-right text-xs sm:block">
                  {relativeTime(u.createdAt)}
                </div>
                <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
              </Link>
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
