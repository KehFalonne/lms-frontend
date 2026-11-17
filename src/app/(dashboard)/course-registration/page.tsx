"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Info,
  Layers,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMyCourses,
  useAvailableOfferings,
  useRequestEnrollment,
} from "@/features/courses/hooks/useCourses";
import { useAuthStore } from "@/stores/auth.store";
import { useDebounce } from "@/hooks/useDebounce";
import { get } from "@/lib/api/client";
import type { FullCourseOffering } from "@/features/courses/types/course.types";
import type { ApiResponse } from "@/types/api.types";

interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

interface ProgrammeOption {
  id: string;
  name: string;
  code: string;
  degreeType: string;
  department?: { id: string; name: string };
  departmentId?: string;
}

export default function CourseRegistrationPage() {
  return (
    <AuthGate>
      <CourseRegistrationContent />
    </AuthGate>
  );
}

function CourseRegistrationContent() {
  const user = useAuthStore((s) => s.user);
  const userProgrammeId = user?.studentProfile?.programmeId ?? null;
  const currentLevel = user?.studentProfile?.currentLevel;

  // Department & Programme selectors
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedProgramme, setSelectedProgramme] = useState<string>(
    userProgrammeId || ""
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Queries for departments and programmes
  const { data: deptRes } = useQuery({
    queryKey: ["catalog-departments"],
    queryFn: () => get<ApiResponse<DepartmentOption[]>>("/departments/"),
    staleTime: 5 * 60_000,
  });

  const { data: progRes } = useQuery({
    queryKey: ["catalog-programmes"],
    queryFn: () => get<ApiResponse<ProgrammeOption[]>>("/programmes/"),
    staleTime: 5 * 60_000,
  });

  const departments = deptRes?.data ?? [];
  const programmes = progRes?.data ?? [];

  // Find user's assigned programme details
  const myProgramme = programmes.find((p) => p.id === userProgrammeId);

  // Filter programmes by selected department
  const filteredProgrammes = useMemo(() => {
    if (!selectedDepartment) return programmes;
    return programmes.filter((p) => {
      const deptId = p.department?.id || p.departmentId;
      return deptId === selectedDepartment;
    });
  }, [programmes, selectedDepartment]);

  // Query offerings (backend already scopes to the student's eligible
  // programmes and current semester; filters below are client-side)
  const {
    data: availableRes,
    isLoading,
    isError,
    refetch,
  } = useAvailableOfferings({
    search: debouncedSearch || undefined,
    enabled: true,
  });

  const { data: myCoursesRes, isLoading: loadingMyCourses } = useMyCourses();
  const requestEnroll = useRequestEnrollment();

  // Set of offering IDs already enrolled in
  const myEnrolledOfferingIds = useMemo(() => {
    const enrollments = myCoursesRes?.data ?? [];
    return new Set(enrollments.map((e) => e.courseOffering.id));
  }, [myCoursesRes]);

  const rawOfferings: FullCourseOffering[] = useMemo(() => {
    return Array.isArray(availableRes?.data) ? availableRes.data : [];
  }, [availableRes]);

  // Client-side programme/department filters. Programme matches primary or
  // eligible programmes; department matches either, so shared courses stay
  // visible from the student's own department.
  const offerings = useMemo(() => {
    let list = rawOfferings;
    if (selectedProgramme) {
      list = list.filter(
        (o) =>
          o.programme.id === selectedProgramme ||
          o.eligibleProgrammes.some((p) => p.id === selectedProgramme)
      );
    }
    if (selectedDepartment && !selectedProgramme) {
      const validProgIds = new Set(filteredProgrammes.map((p) => p.id));
      list = list.filter((o) =>
        [o.programme.id, ...o.eligibleProgrammes.map((p) => p.id)].some((id) =>
          validProgIds.has(id)
        )
      );
    }
    return list;
  }, [rawOfferings, selectedDepartment, selectedProgramme, filteredProgrammes]);

  // Programmes the student can actually browse: their own programme plus
  // every programme that appears on a visible offering.
  const dropdownProgrammes = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ id: string; name: string; code: string }> = [];
    if (myProgramme) {
      seen.add(myProgramme.id);
      list.push(myProgramme);
    }
    for (const o of rawOfferings) {
      for (const p of [o.programme, ...o.eligibleProgrammes]) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        const full = programmes.find((x) => x.id === p.id);
        if (full) list.push(full);
      }
    }
    return list;
  }, [rawOfferings, programmes, myProgramme]);

  // Departments that actually appear on a visible offering (via primary or
  // eligible programmes), so the filter never shows irrelevant options.
  const dropdownDepartments = useMemo(() => {
    const deptByProgramme = new Map<string, string>();
    for (const p of programmes) {
      const deptId = p.department?.id || p.departmentId;
      if (deptId) deptByProgramme.set(p.id, deptId);
    }
    const seen = new Set<string>();
    for (const o of rawOfferings) {
      for (const p of [o.programme, ...o.eligibleProgrammes]) {
        const deptId = deptByProgramme.get(p.id);
        if (deptId) seen.add(deptId);
      }
    }
    return departments.filter((d) => seen.has(d.id));
  }, [rawOfferings, programmes, departments]);

  const handleRequest = async (offeringId: string) => {
    await requestEnroll.mutateAsync(offeringId);
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────── */}
      <header className="mb-2">
        <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
          <span aria-hidden className="bg-primary/50 h-px w-6" />
          Course Registration
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Available Courses &amp; Modules
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed sm:text-sm">
              Explore course offerings scheduled for your programme and department. Select
              any course to request enrollment — if you meet the eligibility criteria, you
              are enrolled immediately.
            </p>
          </div>
        </div>

        {/* Profile Status Pill */}
        {myProgramme && (
          <div className="border-primary/25 bg-primary/5 mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            <Sparkles className="text-primary h-3.5 w-3.5" />
            <span className="text-foreground font-medium">
              Enrolled Programme:{" "}
              <span className="text-primary font-semibold">
                {myProgramme.name} ({myProgramme.code})
              </span>
            </span>
            {currentLevel && (
              <Badge variant="outline" className="py-0 font-mono text-[10px]">
                Level {currentLevel}
              </Badge>
            )}
          </div>
        )}
      </header>

      {/* ─── Search & Department/Programme Filters ─────────────────── */}
      <div className="ring-primary/10 rounded-2xl border border-white/60 bg-white/85 p-4 shadow-sm ring-1 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/75">
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
          {/* Search by Code/Title */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code or title (e.g. CS101, Calculus)…"
              className="h-9 pl-9 text-xs"
            />
          </div>

          {/* Department Filter */}
          <div>
            <Select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedProgramme(""); // reset programme when department changes
              }}
              className="h-9 text-xs"
              placeholder="All Academic Departments"
              options={[
                { value: "", label: "All Academic Departments" },
                ...dropdownDepartments.map((d) => ({
                  value: d.id,
                  label: `${d.code} — ${d.name}`,
                })),
              ]}
            />
          </div>

          {/* Programme Filter */}
          <div>
            <Select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="h-9 text-xs"
              placeholder="All Degree Programmes"
              options={[
                { value: "", label: "All Degree Programmes" },
                ...(myProgramme
                  ? [
                      {
                        value: myProgramme.id,
                        label: `★ My Programme (${myProgramme.code})`,
                      },
                    ]
                  : []),
                ...dropdownProgrammes
                  .filter((p) => p.id !== userProgrammeId)
                  .map((p) => ({
                    value: p.id,
                    label: `${p.code} — ${p.name}`,
                  })),
              ]}
            />
          </div>
        </div>

        {/* Quick Reset / Filter status */}
        {(selectedDepartment || selectedProgramme || search) && (
          <div className="border-border/40 mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
            <span className="text-muted-foreground text-[11px]">
              Showing results filtered by your selections
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary h-6 px-2 text-[11px] hover:underline"
              onClick={() => {
                setSelectedDepartment("");
                setSelectedProgramme(userProgrammeId || "");
                setSearch("");
              }}
            >
              Reset to My Programme
            </Button>
          </div>
        )}
      </div>

      {/* ─── States ──────────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && offerings.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={
            search ? "No courses match your query" : "No open course offerings found"
          }
          description={
            search
              ? "Try adjusting your search terms or select 'All Departments' to see other offerings."
              : "No course offerings are currently active for this programme or department. Try switching department or programme filters above."
          }
          action={
            (selectedDepartment || selectedProgramme || search) && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSelectedDepartment("");
                  setSelectedProgramme("");
                  setSearch("");
                }}
              >
                Browse All Open Courses
              </Button>
            )
          }
        />
      )}

      {/* ─── Offerings Cards Grid ────────────────────────────────── */}
      {!isLoading && !isError && offerings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((offering) => {
            const enrolled = myEnrolledOfferingIds.has(offering.id);
            const isFull =
              offering.capacity > 0 && offering.enrolledCount >= offering.capacity;
            const slotsLeft = Math.max(0, offering.capacity - offering.enrolledCount);
            const enrolledPct =
              offering.capacity > 0
                ? Math.min(
                    100,
                    Math.round((offering.enrolledCount / offering.capacity) * 100)
                  )
                : 0;

            return (
              <OfferingRegistrationCard
                key={offering.id}
                offering={offering}
                isEnrolled={enrolled}
                isFull={isFull}
                slotsLeft={slotsLeft}
                enrolledPct={enrolledPct}
                isRequesting={
                  requestEnroll.isPending && requestEnroll.variables === offering.id
                }
                onRequest={() => handleRequest(offering.id)}
              />
            );
          })}
        </div>
      )}

      {/* ─── Process Info Banner ─────────────────────────────────── */}
      <div className="border-info/30 bg-info/5 rounded-2xl border p-4 sm:p-5">
        <h3 className="text-info mb-2 flex items-center gap-1.5 text-xs font-semibold">
          <Info className="h-4 w-4" />
          Enrollment &amp; Registration Guidelines
        </h3>
        <ol className="text-muted-foreground list-inside list-decimal space-y-1.5 text-xs leading-relaxed">
          <li>
            Select <strong>Request Enrollment</strong> on any course module open for
            registration.
          </li>
          <li>
            The system checks your eligibility — your programme (or a shared
            programme) and your current level.
          </li>
          <li>
            Eligible requests are approved automatically: you are enrolled right away,
            and the administrator and course instructors are notified.
          </li>
          <li>
            All course materials, lecture assignments, and announcements will appear on
            your <strong>My Courses</strong> dashboard.
          </li>
        </ol>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Individual Course Offering Registration Card
// ─────────────────────────────────────────────────────────────────────────────

function OfferingRegistrationCard({
  offering,
  isEnrolled,
  isFull,
  slotsLeft,
  enrolledPct,
  isRequesting,
  onRequest,
}: {
  offering: FullCourseOffering;
  isEnrolled: boolean;
  isFull: boolean;
  slotsLeft: number;
  enrolledPct: number;
  isRequesting: boolean;
  onRequest: () => void;
}) {
  return (
    <article className="ring-primary/10 flex flex-col rounded-2xl border border-white/60 bg-white/85 p-5 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_34px_64px_-28px_hsl(222_47%_22%/0.6)] dark:border-white/10 dark:bg-slate-800/75">
      {/* Course header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-primary bg-primary/10 ring-primary/20 rounded-lg px-2 py-0.5 font-mono text-xs font-bold tracking-tight ring-1">
              {offering.course.code}
            </span>
            <Badge variant="outline" className="text-[10px] font-medium">
              Sec {offering.section}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              L{offering.course.level}
            </Badge>
          </div>
          <h3 className="text-foreground mt-2 line-clamp-2 text-sm leading-snug font-semibold">
            {offering.course.title}
          </h3>
        </div>

        {/* Credit badge */}
        <div className="bg-primary/10 ring-primary/20 flex shrink-0 flex-col items-center rounded-xl px-2.5 py-1.5 ring-1">
          <span className="text-primary text-sm leading-none font-bold">
            {offering.course.credits}
          </span>
          <span className="text-primary/70 text-[9px] font-semibold tracking-wide uppercase">
            credits
          </span>
        </div>
      </div>

      {/* Meta info */}
      <div className="text-muted-foreground mt-1 mb-3 space-y-1.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Layers className="text-info h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{offering.semester.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GraduationCap className="text-warning h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {[offering.programme.name, ...offering.eligibleProgrammes.map((p) => p.name)].join(
              " · "
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <Users className="text-success h-3.5 w-3.5 shrink-0" />
            <span>
              {offering.enrolledCount} / {offering.capacity} enrolled
            </span>
          </span>
          {isFull && (
            <Badge variant="danger" className="text-[9px]">
              Full
            </Badge>
          )}
        </div>
      </div>

      {/* Capacity progress bar */}
      <div className="mb-4">
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
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
        {!isFull && slotsLeft <= 10 && (
          <p className="text-warning mt-1 text-[10px] font-semibold">
            Only {slotsLeft} slot{slotsLeft === 1 ? "" : "s"} remaining
          </p>
        )}
      </div>

      {/* Action button */}
      <div className="mt-auto">
        {isEnrolled ? (
          <div className="bg-success/10 text-success ring-success/20 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Enrolled</span>
          </div>
        ) : isFull ? (
          <div className="bg-muted text-muted-foreground flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold">
            <Users className="h-3.5 w-3.5" />
            <span>Offering is Full</span>
          </div>
        ) : (
          <Button
            className="h-9 w-full gap-1.5 text-xs shadow-sm"
            onClick={onRequest}
            loading={isRequesting}
          >
            <Clock className="h-3.5 w-3.5" />
            Request Enrollment
          </Button>
        )}
      </div>
    </article>
  );
}
