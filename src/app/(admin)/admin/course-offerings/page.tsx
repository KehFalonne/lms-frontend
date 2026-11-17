"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { OfferingInstructorsDialog } from "@/features/courses/components/offering-instructors-dialog";
import {
  useArchiveOffering,
  useCancelOffering,
  useCompleteOffering,
  useCourseOfferings,
  useCreateCourseOffering,
  useDeleteCourseOffering,
  usePublishOffering,
  useUpdateCourseOffering,
} from "@/features/courses/hooks/useOfferings";
import type { FullCourseOffering } from "@/features/courses/types/course.types";
import { get } from "@/lib/api/client";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import type { ApiResponse } from "@/types/api.types";

interface CourseOption {
  id: string;
  code: string;
  title: string;
  department: { id: string };
}

interface SemesterOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface ProgrammeOption {
  id: string;
  code: string;
  name: string;
  department: { id: string };
}

export default function AdminCourseOfferingsPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <CourseOfferingsContent />
    </AuthGate>
  );
}

function CourseOfferingsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [semesterFilter, setSemesterFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<FullCourseOffering | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<FullCourseOffering | null>(
    null
  );

  // Form states for new offering
  const [courseId, setCourseId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [eligibleProgrammeIds, setEligibleProgrammeIds] = useState<string[]>([]);
  const [section, setSection] = useState("A");
  const [capacity, setCapacity] = useState(100);

  // Queries
  const { data, isLoading, isError, refetch } = useCourseOfferings({
    page,
    pageSize: 50,
  });
  const createOffering = useCreateCourseOffering();
  const updateOffering = useUpdateCourseOffering(editingOffering?.id ?? "");
  const publish = usePublishOffering();
  const complete = useCompleteOffering();
  const archive = useArchiveOffering();
  const cancel = useCancelOffering();
  const deleteOffering = useDeleteCourseOffering();

  // Dropdown options
  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-options"],
    queryFn: () => get<ApiResponse<CourseOption[]>>("/courses/?pageSize=100"),
  });
  const { data: semestersData } = useQuery({
    queryKey: ["admin-semesters-options"],
    queryFn: () => get<ApiResponse<SemesterOption[]>>("/semesters/"),
  });
  const { data: programmesData } = useQuery({
    queryKey: ["admin-programmes-options"],
    queryFn: () => get<ApiResponse<ProgrammeOption[]>>("/programmes/"),
  });

  const courses = coursesData?.data ?? [];
  const semesters = semestersData?.data ?? [];
  const programmes = programmesData?.data ?? [];
  const availableCourses = courses.filter((course) => {
    const programme = programmes.find((item) => item.id === programmeId);
    return !programme || course.department.id === programme.department.id;
  });
  const rawOfferings = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
  };

  // Filter offerings
  const offerings = useMemo(() => {
    return rawOfferings.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (semesterFilter && o.semester.id !== semesterFilter) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        o.course.code.toLowerCase().includes(term) ||
        o.course.title.toLowerCase().includes(term) ||
        o.section.toLowerCase().includes(term) ||
        o.programme.name.toLowerCase().includes(term)
      );
    });
  }, [rawOfferings, statusFilter, semesterFilter, search]);

  function openEditOffering(offering: FullCourseOffering) {
    setEditingOffering(offering);
    setCourseId(offering.course.id);
    setSemesterId(offering.semester.id);
    setProgrammeId(offering.programme.id);
    setEligibleProgrammeIds(offering.eligibleProgrammes.map((p) => p.id));
    setSection(offering.section);
    setCapacity(offering.capacity);
  }

  function closeOfferingForm() {
    if (createOffering.isPending || updateOffering.isPending) return;
    setCreateOpen(false);
    setEditingOffering(null);
    setCourseId("");
    setSemesterId("");
    setProgrammeId("");
    setEligibleProgrammeIds([]);
    setSection("A");
    setCapacity(100);
  }

  function handleSaveOffering(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !semesterId || !programmeId) return;

    const payload = {
      courseId,
      semesterId,
      programmeId,
      eligibleProgrammeIds,
      section: section.trim() || "A",
      capacity: Number(capacity) || 100,
    };

    if (!editingOffering) {
      createOffering.mutate(payload, { onSuccess: closeOfferingForm });
      return;
    }

    updateOffering.mutate(payload, { onSuccess: closeOfferingForm });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "COMPLETED":
        return <Badge variant="info">Completed</Badge>;
      case "ARCHIVED":
        return <Badge variant="warning">Archived</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academic Term Operations"
        title="Course Offerings & Staffing"
        description="Manage active course delivery sections, semester schedules, capacities, and instructor assignments."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/courses">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                Course Catalog
              </Button>
            </Link>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs shadow-sm"
              onClick={() => {
                closeOfferingForm();
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Offering
            </Button>
          </div>
        }
      />

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search code, title, section..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={semesterFilter}
            onChange={(e) => {
              setSemesterFilter(e.target.value);
              setPage(1);
            }}
            className="w-48 text-xs"
            options={[
              { value: "", label: "All Semesters" },
              ...semesters.map((s) => ({
                value: s.id,
                label: s.isCurrent ? `${s.name} (Current)` : s.name,
              })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-36 text-xs"
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "ACTIVE", label: "Active" },
              { value: "COMPLETED", label: "Completed" },
              { value: "ARCHIVED", label: "Archived" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
        </div>
      </div>

      {/* ── Offerings Content ───────────────────────────────────────── */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load course offerings"
          description="Failed to fetch course offerings from server."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && offerings.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No course offerings found"
          description="Create your first course offering to deliver courses this semester."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Course Offering
            </Button>
          }
        />
      )}

      {!isLoading && !isError && offerings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offerings.map((o) => {
            const enrolledPct =
              o.capacity > 0
                ? Math.min(100, Math.round((o.enrolledCount / o.capacity) * 100))
                : 0;

            return (
              <div
                key={o.id}
                className="ring-primary/10 flex flex-col justify-between rounded-2xl border border-white/60 bg-white/85 p-5 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_34px_64px_-28px_hsl(222_47%_22%/0.6)] dark:border-white/10 dark:bg-slate-800/75"
              >
                <div className="space-y-3.5">
                  {/* Top line */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="course-code bg-primary/10 text-primary ring-primary/20 rounded-lg px-2 py-0.5 text-xs font-bold tracking-wide ring-1">
                          {o.course.code}
                        </span>
                        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                          Sec {o.section}
                        </span>
                      </div>
                      <h3 className="group-hover:text-primary text-foreground mt-1 line-clamp-1 text-sm font-semibold transition-colors sm:text-base">
                        {o.course.title}
                      </h3>
                    </div>
                    {getStatusBadge(o.status)}
                  </div>

                  {/* Metadata */}
                  <div className="text-muted-foreground border-border/40 space-y-1.5 border-t pt-2.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="text-primary h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1">{o.semester.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="text-info h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1">{o.programme.name}</span>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="bg-muted/40 border-border/40 space-y-1.5 rounded-xl border p-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="text-primary h-3 w-3" />
                        Enrollment
                      </span>
                      <span className="text-foreground font-semibold">
                        {o.enrolledCount} / {o.capacity} ({enrolledPct}%)
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          enrolledPct >= 100
                            ? "bg-danger"
                            : enrolledPct >= 80
                              ? "bg-warning"
                              : "bg-primary"
                        )}
                        style={{ width: `${enrolledPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Section */}
                <div className="border-border/40 mt-4 flex flex-col gap-2 border-t pt-3">
                  {/* Row 1: Staff & Students Roster */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Manage Instructors Button */}
                    <Button
                      size="sm"
                      variant={o.instructorCount > 0 ? "secondary" : "outline"}
                      className="h-8 justify-between px-2.5 text-xs"
                      onClick={() => setSelectedOffering(o)}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <UserCog className="text-primary h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{o.instructorCount} Staff</span>
                      </span>
                      <span className="text-primary shrink-0 text-[10px] font-semibold underline underline-offset-2">
                        Staff
                      </span>
                    </Button>

                    {/* Manage Students Roster Button */}
                    <Link
                      href={`/admin/course-offerings/${o.id}/students`}
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:border-primary/50 h-8 w-full justify-between px-2.5 text-xs"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Users className="text-primary h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{o.enrolledCount} Enrolled</span>
                        </span>
                        <span className="text-primary shrink-0 text-[10px] font-semibold underline underline-offset-2">
                          Roster
                        </span>
                      </Button>
                    </Link>
                  </div>

                  {/* Row 2: Edit & Status Actions */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                      onClick={() => openEditOffering(o)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit Details
                    </Button>

                    <div className="flex items-center gap-1">
                      {o.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success hover:bg-success/10 h-7 px-2 text-xs font-semibold"
                          onClick={() => publish.mutate(o.id)}
                          loading={publish.isPending}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Publish
                        </Button>
                      )}
                      {o.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-info hover:bg-info/10 h-7 px-2 text-xs font-semibold"
                          onClick={() => complete.mutate(o.id)}
                          loading={complete.isPending}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {o.status === "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:bg-muted h-7 px-2 text-xs"
                          onClick={() => archive.mutate(o.id)}
                          loading={archive.isPending}
                        >
                          <Archive className="mr-1 h-3 w-3" />
                          Archive
                        </Button>
                      )}
                      {o.enrolledCount === 0 && o.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:bg-danger/10 h-7 w-7 p-0"
                          title="Delete offering"
                          onClick={() => {
                            if (
                              confirm(
                                `Delete offering ${o.course.code} Section ${o.section}?`
                              )
                            ) {
                              deleteOffering.mutate(o.id);
                            }
                          }}
                          loading={deleteOffering.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && offerings.length > 0 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      {/* ── Dialog: Create New Offering ────────────────────────────── */}
      <Dialog
        open={createOpen || !!editingOffering}
        onClose={closeOfferingForm}
        title={editingOffering ? "Edit Course Offering" : "Create Course Offering"}
        description="Schedule a course for delivery in a semester, programme, and section."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeOfferingForm}
              disabled={createOffering.isPending || updateOffering.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOffering}
              loading={createOffering.isPending || updateOffering.isPending}
              disabled={!courseId || !semesterId || !programmeId}
            >
              {editingOffering ? "Save Changes" : "Create Offering"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveOffering} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Course</label>
            <Select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Select course from catalog"
              options={availableCourses.map((c) => ({
                value: c.id,
                label: `${c.code} — ${c.title}`,
              }))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Semester</label>
              <Select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                placeholder="Select semester"
                options={semesters.map((s) => ({
                  value: s.id,
                  label: s.isCurrent ? `${s.name} (Current)` : s.name,
                }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Programme</label>
              <Select
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                placeholder="Select programme"
                options={programmes.map((p) => ({
                  value: p.id,
                  label: `${p.code} — ${p.name}`,
                }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">
                Additional eligible programmes
              </label>
              <Select
                multiple
                size={Math.min(6, Math.max(3, programmes.length))}
                value={eligibleProgrammeIds}
                onChange={(e) =>
                  setEligibleProgrammeIds(
                    Array.from(e.target.selectedOptions, (option) => option.value)
                  )
                }
                options={programmes
                  .filter((programme) => programme.id !== programmeId)
                  .map((programme) => ({
                    value: programme.id,
                    label: `${programme.code} — ${programme.name}`,
                  }))}
                className="h-auto min-h-24"
              />
              <p className="text-muted-foreground text-[11px]">
                Hold Ctrl or Command to select programmes approved for this shared
                offering. The primary programme is already included.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Section</label>
              <Input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A, B, or Evening"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Student Capacity</label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>
        </form>
      </Dialog>

      {/* ── Dialog: Manage Instructors for Selected Offering ────────── */}
      <OfferingInstructorsDialog
        open={!!selectedOffering}
        onClose={() => setSelectedOffering(null)}
        offering={selectedOffering}
      />
    </div>
  );
}
