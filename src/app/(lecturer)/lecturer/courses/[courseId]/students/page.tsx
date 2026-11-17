"use client";
import { use, useMemo, useState } from "react";
import { Printer, Search, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";

interface EnrollmentRow {
  id: string;
  student: {
    id: string;
    universityId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  enrolledAt: string;
}

export default function LecturerStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["lecturer-students", courseId],
    queryFn: () =>
      get<ApiResponse<EnrollmentRow[]>>(endpoints.courseOfferings.enrollments(courseId)),
    staleTime: 30_000,
  });

  const items = data?.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (e) =>
        `${e.student.firstName} ${e.student.lastName}`.toLowerCase().includes(term) ||
        e.student.universityId.toLowerCase().includes(term) ||
        e.student.email.toLowerCase().includes(term)
    );
  }, [items, search]);
  const activeCount = items.filter((e) => e.status === "ACTIVE").length;

  function printStudents() {
    window.print();
  }

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
            <span aria-hidden className="bg-primary/50 h-px w-6" />
            Roster
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Students ({isLoading ? "…" : items.length})
          </h2>
          <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
            Enrolled students in this course offering.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={printStudents}
          disabled={items.length === 0}
          className="print:hidden"
        >
          <Printer className="mr-1.5 h-4 w-4" /> Print list
        </Button>
      </header>

      {!isLoading && !isError && items.length > 0 && (
        <GlassCard className="mb-4">
          <div className="flex flex-wrap items-center gap-3 p-4 sm:px-5">
            <div className="relative min-w-56 max-w-xs flex-1">
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, ID or email"
                className="pl-9"
                aria-label="Search students"
              />
            </div>
            <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
              <Users className="text-success h-3.5 w-3.5" aria-hidden />
              {activeCount} active
            </span>
          </div>
        </GlassCard>
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load students"
          description={
            (error as Error)?.message ??
            "The server rejected the request. Check the backend log and try again."
          }
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={Users}
          title="No students enrolled"
          description="Student registrations will appear here."
        />
      )}

      {!isLoading && !isError && items.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={Search}
          title="No matching students"
          description="Try a different name, ID or email."
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <GlassCard className="divide-border/70 divide-y print:hidden">
          {filtered.map((e) => {
            const initials = `${e.student.firstName[0] ?? ""}${
              e.student.lastName[0] ?? ""
            }`.toUpperCase();
            return (
              <div
                key={e.id}
                className="enrollment-row cv-auto flex items-center gap-3 p-3 sm:p-4"
              >
                <Avatar size="md" fallback={initials} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {e.student.firstName} {e.student.lastName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {e.student.universityId} · {e.student.email}
                  </p>
                </div>
                <span className="text-muted-foreground hidden text-xs sm:block">
                  Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                </span>
                <Badge variant={e.status === "ACTIVE" ? "success" : "default"}>
                  {e.status}
                </Badge>
              </div>
            );
          })}
        </GlassCard>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div data-print-content className="hidden print:block">
          <h1 className="mb-1 text-xl font-bold">Enrolled Students</h1>
          <p className="mb-4 text-sm">
            Generated {new Date().toLocaleDateString()} · {items.length} students
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-black px-3 py-2 text-left">#</th>
                <th className="border border-black px-3 py-2 text-left">
                  Student number
                </th>
                <th className="border border-black px-3 py-2 text-left">Student name</th>
                <th className="border border-black px-3 py-2 text-left">Email</th>
                <th className="border border-black px-3 py-2 text-left">Status</th>
                <th className="border border-black px-3 py-2 text-left">Enrolled at</th>
              </tr>
            </thead>
            <tbody>
              {items.map((enrollment, index) => (
                <tr key={enrollment.id}>
                  <td className="border border-black px-3 py-2">{index + 1}</td>
                  <td className="border border-black px-3 py-2">
                    {enrollment.student.universityId}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {enrollment.student.email}
                  </td>
                  <td className="border border-black px-3 py-2">{enrollment.status}</td>
                  <td className="border border-black px-3 py-2">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
