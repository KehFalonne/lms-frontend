"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils/cn";

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

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const staffCount = users.filter((u) => u.isStaff).length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ─── Eyebrow & Page Header ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
            <span aria-hidden className="bg-primary/50 h-px w-6" />
            Institutional Administration
          </p>
          <h1 className="text-foreground mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
            Users &amp; Accounts
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed sm:text-sm">
            Manage system identities, student enrollments, faculty credentials, and role
            assignments.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <UserFormDialog />
        </div>
      </div>

      {/* ─── Search & Status Filter ─────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search by full name, email, or university ID…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 pl-9 text-xs"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-9 text-xs"
          placeholder="All account statuses"
          options={[
            { value: "ACTIVE", label: "Active accounts" },
            { value: "PENDING", label: "Pending verification" },
            { value: "SUSPENDED", label: "Suspended" },
            { value: "INACTIVE", label: "Inactive" },
            { value: "LOCKED", label: "Locked" },
          ]}
        />
      </div>

      {/* ─── States ────────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && users.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users match your criteria"
          description={
            search || status
              ? "Try adjusting your search query or clear the status filter."
              : "Create the first user in the institution by clicking 'New User' above."
          }
          action={
            (search || status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPage(1);
                }}
                className="text-xs"
              >
                Reset filters
              </Button>
            )
          }
        />
      )}

      {/* ─── Frosted User Cards List ────────────────────────────── */}
      {!isLoading && !isError && users.length > 0 && (
        <>
          <div className="ring-primary/10 overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/75">
            <div className="border-border/60 bg-muted/40 text-muted-foreground hidden border-b px-5 py-3 text-[11px] font-semibold tracking-wider uppercase sm:grid sm:grid-cols-[2fr_1.5fr_1fr_120px_40px] sm:items-center">
              <div>User identity</div>
              <div>University details</div>
              <div>Status &amp; Role</div>
              <div className="text-right">Created</div>
              <div />
            </div>

            <div className="divide-border/40 divide-y">
              {users.map((u) => {
                const initials =
                  `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();

                return (
                  <Link
                    key={u.id}
                    href={`/admin/users/${u.id}`}
                    className="hover:bg-primary/[0.03] group flex flex-col gap-3 p-3.5 transition-colors sm:grid sm:grid-cols-[2fr_1.5fr_1fr_120px_40px] sm:items-center sm:px-5"
                  >
                    {/* User name & avatar */}
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        size="md"
                        fallback={initials || "GU"}
                        className="ring-primary/20 h-9 w-9 text-xs ring-1"
                      />
                      <div className="min-w-0">
                        <p className="text-foreground group-hover:text-primary truncate text-xs font-semibold transition-colors sm:text-sm">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-muted-foreground truncate text-[11px]">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* University details */}
                    <div className="min-w-0 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[11px] font-medium">
                          {u.universityId || "—"}
                        </span>
                        {u.studentProfile?.matriculeNumber && (
                          <span className="text-muted-foreground font-mono text-[10px]">
                            ({u.studentProfile.matriculeNumber})
                          </span>
                        )}
                      </div>
                      {u.staffProfile?.jobTitle && (
                        <p className="text-muted-foreground mt-0.5 truncate text-[10px]">
                          {u.staffProfile.jobTitle}
                        </p>
                      )}
                    </div>

                    {/* Status & Staff badge */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={
                          u.status === "ACTIVE"
                            ? "success"
                            : u.status === "SUSPENDED"
                              ? "danger"
                              : u.status === "PENDING"
                                ? "warning"
                                : "outline"
                        }
                        className="text-[10px]"
                      >
                        {u.status}
                      </Badge>
                      {u.isStaff && (
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary font-mono text-[10px]"
                        >
                          Staff
                        </Badge>
                      )}
                    </div>

                    {/* Created date */}
                    <div className="text-muted-foreground hidden text-right text-[11px] font-medium sm:block">
                      {relativeTime(u.createdAt)}
                    </div>

                    {/* Chevron */}
                    <div className="hidden justify-end sm:flex">
                      <ChevronRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
