"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { listUsers } from "@/features/admin/api/admin.api";
import { useCourseOffering } from "@/features/courses/hooks/useOfferings";
import {
  useBulkEnrollStudents,
  useDecideEnrollment,
  useEnrollStudent,
  useOfferingEnrollments,
  useRemoveEnrollment,
} from "@/features/courses/hooks/useEnrollments";
import type {
  CourseEnrollmentRecord,
  EnrollmentStatus,
} from "@/features/courses/types/course.types";
import { useDebounce } from "@/hooks/useDebounce";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { formatDate, formatDateTime } from "@/lib/utils/format";

export default function AdminOfferingStudentsPage({
  params,
}: {
  params: Promise<{ offeringId: string }>;
}) {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <OfferingStudentsContent params={params} />
    </AuthGate>
  );
}

function OfferingStudentsContent({
  params,
}: {
  params: Promise<{ offeringId: string }>;
}) {
  const { offeringId } = use(params);

  // Queries
  const {
    data: offeringRes,
    isLoading: offeringLoading,
    isError: offeringError,
    refetch: refetchOffering,
  } = useCourseOffering(offeringId);
  const {
    data: enrollmentsRes,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
    refetch: refetchEnrollments,
  } = useOfferingEnrollments(offeringId);

  // Mutations
  const enrollStudentMut = useEnrollStudent(offeringId);
  const bulkEnrollMut = useBulkEnrollStudents(offeringId);
  const removeEnrollMut = useRemoveEnrollment(offeringId);
  const decideEnrollMut = useDecideEnrollment(offeringId);

  // Table filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [singleEnrollOpen, setSingleEnrollOpen] = useState(false);
  const [bulkEnrollOpen, setBulkEnrollOpen] = useState(false);

  // Offering data
  const offering = offeringRes?.data;
  const enrollments: CourseEnrollmentRecord[] = useMemo(() => {
    return Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : [];
  }, [enrollmentsRes]);

  // Capacity calculation
  const capacity = offering?.capacity ?? 0;
  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const pendingCount = enrollments.filter((e) => e.status === "PENDING").length;
  const remainingSlots = Math.max(0, capacity - activeCount);
  const enrolledPct =
    capacity > 0 ? Math.min(100, Math.round((activeCount / capacity) * 100)) : 0;

  // Filtered roster
  const filteredEnrollments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrollments.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (!q) return true;
      const fullName = item.student?.fullName?.toLowerCase() ?? "";
      const email = item.student?.email?.toLowerCase() ?? "";
      const uniId = item.student?.universityId?.toLowerCase() ?? "";
      return fullName.includes(q) || email.includes(q) || uniId.includes(q);
    });
  }, [enrollments, search, statusFilter]);

  // Export roster to CSV
  const handleExportCSV = () => {
    if (!enrollments.length) return;
    const headers = [
      "University ID",
      "First Name",
      "Last Name",
      "Email",
      "Status",
      "Enrolled Date",
    ];
    const rows = filteredEnrollments.map((e) => [
      `"${e.student.universityId || ""}"`,
      `"${e.student.firstName || ""}"`,
      `"${e.student.lastName || ""}"`,
      `"${e.student.email || ""}"`,
      `"${e.status}"`,
      `"${e.enrolledAt ? formatDate(e.enrolledAt) : ""}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `roster-${offering?.course?.code || "course"}-sec${offering?.section || "A"}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (offeringLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (offeringError || !offering) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Offering not found"
          description="Could not load the course offering. It may have been removed."
          onRetry={() => refetchOffering()}
        />
        <div className="flex justify-center">
          <Link href="/admin/course-offerings">
            <Button variant="outline">Back to Course Offerings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Top Bar ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/course-offerings"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Course Offerings</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={handleExportCSV}
            disabled={!enrollments.length}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setBulkEnrollOpen(true)}
          >
            <Upload className="h-3.5 w-3.5" />
            Bulk Enroll
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setSingleEnrollOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Enroll Student
          </Button>
        </div>
      </div>

      {/* ── Offering Banner & Overview Card ──────────────────────── */}
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-primary font-mono text-sm font-bold tracking-tight">
                  {offering.course.code}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-sm font-semibold">{offering.course.title}</span>
                <Badge variant="outline" className="text-[11px] font-semibold">
                  Section {offering.section}
                </Badge>
                <Badge
                  variant={
                    offering.status === "ACTIVE"
                      ? "success"
                      : offering.status === "DRAFT"
                        ? "warning"
                        : "outline"
                  }
                  className="text-[11px]"
                >
                  {offering.status}
                </Badge>
              </div>

              <p className="text-muted-foreground text-xs">
                Semester:{" "}
                <span className="text-foreground font-medium">
                  {offering.semester.name}
                </span>
                {" • "}
                Programme:{" "}
                <span className="text-foreground font-medium">
                  {offering.programme.name}
                </span>
              </p>
            </div>

            {/* Capacity stats pill */}
            <div className="bg-background/80 flex flex-col gap-1.5 rounded-lg border p-3 md:min-w-[260px]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="text-primary h-3.5 w-3.5" />
                  Roster Capacity
                </span>
                <span className="font-bold">
                  {activeCount} / {capacity}
                  <span className="text-muted-foreground ml-1 font-normal">
                    ({remainingSlots} slots left)
                  </span>
                </span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    enrolledPct >= 100
                      ? "bg-danger"
                      : enrolledPct >= 80
                        ? "bg-warning"
                        : "bg-primary"
                  }`}
                  style={{ width: `${enrolledPct}%` }}
                />
              </div>
              {pendingCount > 0 && (
                <div className="text-warning flex items-center gap-1 text-[11px] font-medium">
                  <Clock className="h-3 w-3" />
                  <span>
                    {pendingCount} pending enrollment request{pendingCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Students Roster Section ──────────────────────────────── */}
      <div className="space-y-4">
        {/* Filters and search row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, ID, or email…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 w-36 text-xs"
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "ACTIVE", label: `Active (${activeCount})` },
                { value: "PENDING", label: `Pending (${pendingCount})` },
                { value: "WITHDRAWN", label: "Withdrawn" },
                { value: "COMPLETED", label: "Completed" },
              ]}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-2.5 text-xs"
              onClick={() => {
                refetchEnrollments();
                refetchOffering();
              }}
              title="Refresh roster"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Roster Table */}
        {enrollmentsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <Card className="border-dashed p-8">
            <EmptyState
              title={
                enrollments.length === 0
                  ? "No students enrolled yet"
                  : "No students match your filter"
              }
              description={
                enrollments.length === 0
                  ? "Use the 'Enroll Student' or 'Bulk Enroll' buttons above to register students into this offering."
                  : "Try clearing your search query or changing the status filter."
              }
              action={
                enrollments.length === 0 ? (
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setSingleEnrollOpen(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Enroll First Student
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                  >
                    Clear Filters
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className="bg-card overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-b text-[11px] font-semibold tracking-wider uppercase">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Matric / University ID</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Enrolled At</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border/60 divide-y">
                  {filteredEnrollments.map((item) => {
                    const student = item.student;
                    const isPending = item.status === "PENDING";
                    const isActive = item.status === "ACTIVE";

                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        {/* Student Name & Avatar */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={student.avatar ?? undefined}
                              fallback={
                                student.fullName
                                  ? student.fullName.slice(0, 2).toUpperCase()
                                  : student.firstName
                                    ? student.firstName[0].toUpperCase()
                                    : "ST"
                              }
                              className="h-7 w-7 text-[11px]"
                            />
                            <div>
                              <p className="text-foreground font-semibold">
                                {student.fullName ||
                                  `${student.firstName} ${student.lastName}`.trim() ||
                                  "Unnamed Student"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* University ID */}
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="font-mono text-[11px]">
                            {student.universityId || "—"}
                          </Badge>
                        </td>

                        {/* Email */}
                        <td className="text-muted-foreground px-4 py-3">
                          {student.email}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              item.status === "ACTIVE"
                                ? "success"
                                : item.status === "PENDING"
                                  ? "warning"
                                  : item.status === "WITHDRAWN"
                                    ? "danger"
                                    : "outline"
                            }
                            className="text-[10px] font-semibold"
                          >
                            {item.status}
                          </Badge>
                        </td>

                        {/* Enrolled date */}
                        <td className="text-muted-foreground px-4 py-3">
                          {item.enrolledAt ? formatDate(item.enrolledAt) : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-success hover:bg-success/10 h-7 gap-1 px-2 text-xs"
                                  onClick={() =>
                                    decideEnrollMut.mutate({
                                      studentId: student.id,
                                      payload: { status: "ACTIVE" },
                                    })
                                  }
                                  loading={decideEnrollMut.isPending}
                                  title="Approve enrollment request"
                                >
                                  <Check className="h-3 w-3" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-danger hover:bg-danger/10 h-7 gap-1 px-2 text-xs"
                                  onClick={() =>
                                    decideEnrollMut.mutate({
                                      studentId: student.id,
                                      payload: { status: "WITHDRAWN" },
                                    })
                                  }
                                  loading={decideEnrollMut.isPending}
                                  title="Reject enrollment request"
                                >
                                  <X className="h-3 w-3" />
                                  Reject
                                </Button>
                              </>
                            )}

                            {isActive && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-danger hover:bg-danger/10 h-7 gap-1 px-2 text-xs"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Remove ${student.fullName || student.email} from ${
                                        offering.course.code
                                      }?`
                                    )
                                  ) {
                                    removeEnrollMut.mutate(student.id);
                                  }
                                }}
                                loading={removeEnrollMut.isPending}
                                title="Remove / Withdraw student from offering"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialog: Enroll Single Student ────────────────────────── */}
      <SingleEnrollDialog
        open={singleEnrollOpen}
        onClose={() => setSingleEnrollOpen(false)}
        offeringId={offeringId}
        enrolledStudentIds={new Set(enrollments.map((e) => e.student.id))}
        remainingSlots={remainingSlots}
        onEnrolled={() => {
          refetchEnrollments();
          refetchOffering();
        }}
      />

      {/* ── Dialog: Bulk Enroll Students ─────────────────────────── */}
      <BulkEnrollDialog
        open={bulkEnrollOpen}
        onClose={() => setBulkEnrollOpen(false)}
        offeringId={offeringId}
        remainingSlots={remainingSlots}
        onEnrolled={() => {
          refetchEnrollments();
          refetchOffering();
        }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Sub-component: Single Student Enrollment Dialog
// ──────────────────────────────────────────────────────────────────────

function SingleEnrollDialog({
  open,
  onClose,
  offeringId,
  enrolledStudentIds,
  remainingSlots,
  onEnrolled,
}: {
  open: boolean;
  onClose: () => void;
  offeringId: string;
  enrolledStudentIds: Set<string>;
  remainingSlots: number;
  onEnrolled: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["admin-search-students", debouncedSearch],
    queryFn: () => listUsers({ search: debouncedSearch || undefined, isStaff: false }),
    enabled: open && debouncedSearch.length >= 2,
    staleTime: 30_000,
  });

  const enrollMut = useEnrollStudent(offeringId);

  const handleEnroll = async (studentId: string) => {
    await enrollMut.mutateAsync({ studentId });
    onEnrolled();
    onClose();
  };

  const users = usersRes?.data ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Enroll Student"
      description="Search for a student by name, matriculation ID, or email to enroll into this offering."
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {remainingSlots <= 0 && (
          <div className="bg-warning/10 border-warning/30 text-warning flex items-center gap-2 rounded-lg border p-3 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              This offering is at maximum capacity ({remainingSlots} remaining). Enrolling
              more students may cause oversubscription.
            </span>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type at least 2 characters (e.g. John, STU-2024, or email)…"
            className="pl-9 text-xs"
            autoFocus
          />
        </div>

        {/* Search results */}
        <div className="max-h-72 divide-y overflow-y-auto rounded-md border">
          {searchQuery.length < 2 ? (
            <p className="text-muted-foreground p-6 text-center text-xs">
              Start typing to search available students…
            </p>
          ) : isLoading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-xs">
              No students found matching &quot;{searchQuery}&quot;.
            </p>
          ) : (
            users.map((u) => {
              const isEnrolled = enrolledStudentIds.has(u.id);

              return (
                <div
                  key={u.id}
                  className="hover:bg-muted/40 flex items-center justify-between p-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={u.avatar ?? undefined}
                      fallback={u.firstName?.[0] ?? "U"}
                      className="h-8 w-8 text-xs"
                    />
                    <div>
                      <p className="text-foreground text-xs font-semibold">
                        {u.firstName} {u.lastName}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                        <span>{u.email}</span>
                        {u.universityId && (
                          <Badge
                            variant="outline"
                            className="px-1 py-0 font-mono text-[9px]"
                          >
                            {u.universityId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Badge variant="outline" className="text-[10px]">
                      Already Enrolled
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => handleEnroll(u.id)}
                      loading={enrollMut.isPending}
                    >
                      <Plus className="h-3 w-3" />
                      Enroll
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Sub-component: Bulk Enroll Dialog
// ──────────────────────────────────────────────────────────────────────

function BulkEnrollDialog({
  open,
  onClose,
  offeringId,
  remainingSlots,
  onEnrolled,
}: {
  open: boolean;
  onClose: () => void;
  offeringId: string;
  remainingSlots: number;
  onEnrolled: () => void;
}) {
  const [rawText, setRawText] = useState("");
  const bulkMut = useBulkEnrollStudents(offeringId);

  // Parse UUIDs or university IDs from input
  const parsedIds = useMemo(() => {
    return rawText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [rawText]);

  // Handle CSV file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      // Extract student IDs (takes first column of each row, skips header if it says 'id' or 'student')
      const lines = text.split("\n");
      const ids: string[] = [];
      for (const line of lines) {
        const clean = line.split(",")[0].replace(/["']/g, "").trim();
        if (
          clean &&
          !clean.toLowerCase().includes("student") &&
          !clean.toLowerCase().includes("id")
        ) {
          ids.push(clean);
        }
      }
      setRawText((prev) => (prev ? `${prev}\n${ids.join("\n")}` : ids.join("\n")));
    } catch {
      // file read failure handled silently
    }
  };

  const handleBulkSubmit = async () => {
    if (!parsedIds.length) return;
    await bulkMut.mutateAsync({ studentIds: parsedIds });
    onEnrolled();
    onClose();
    setRawText("");
  };

  const isOverCapacity = parsedIds.length > remainingSlots && remainingSlots >= 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Bulk Enroll Students"
      description="Upload a CSV file or paste student UUIDs/matriculation numbers to enroll multiple students at once."
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {parsedIds.length} student{parsedIds.length === 1 ? "" : "s"} detected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={bulkMut.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkSubmit}
              loading={bulkMut.isPending}
              disabled={parsedIds.length === 0}
            >
              Enroll {parsedIds.length} Students
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* CSV File Dropzone / Button */}
        <div className="rounded-lg border-2 border-dashed p-4 text-center">
          <FileSpreadsheet className="text-muted-foreground mx-auto mb-2 h-7 w-7" />
          <p className="text-xs font-medium">Upload CSV / TXT file</p>
          <p className="text-muted-foreground mb-2 text-[11px]">
            First column should contain the student IDs or UUIDs.
          </p>
          <input
            type="file"
            accept=".csv,.txt"
            id="csv-bulk-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => document.getElementById("csv-bulk-upload")?.click()}
          >
            Select File
          </Button>
        </div>

        {/* Or Paste Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">
            Or paste Student IDs (one per line or comma-separated):
          </label>
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g.&#10;550e8400-e29b-41d4-a716-446655440000&#10;550e8400-e29b-41d4-a716-446655440001"
            className="h-36 font-mono text-xs"
          />
        </div>

        {/* Capacity warning */}
        {isOverCapacity && (
          <div className="bg-warning/10 border-warning/30 text-warning flex items-center gap-2 rounded-lg border p-3 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Warning: You have {parsedIds.length} students queued, but only{" "}
              {remainingSlots} slots remaining before reaching capacity limit.
            </span>
          </div>
        )}
      </div>
    </Dialog>
  );
}
