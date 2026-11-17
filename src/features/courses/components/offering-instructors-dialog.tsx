"use client";

import { useState } from "react";
import {
  Check,
  Edit2,
  Plus,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import {
  useAssignInstructor,
  useOfferingInstructors,
  useRemoveInstructor,
  useUpdateInstructor,
} from "../hooks/useOfferings";
import type { CourseInstructor, TeachingRoleType } from "../types/course.types";

interface UserOption {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  universityId: string;
  isStaff?: boolean;
  studentProfile?: { id: string } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  offering: {
    id: string;
    section: string;
    course: {
      code: string;
      title: string;
    };
    semester?: {
      name: string;
    };
    programme?: {
      name: string;
    };
  } | null;
}

const ROLE_OPTIONS: {
  value: TeachingRoleType;
  label: string;
  badge: "primary" | "info" | "warning" | "default";
}[] = [
  { value: "PRIMARY_INSTRUCTOR", label: "Primary Instructor", badge: "primary" },
  { value: "INSTRUCTOR", label: "Instructor", badge: "info" },
  { value: "TEACHING_ASSISTANT", label: "Teaching Assistant", badge: "warning" },
  { value: "GRADER", label: "Grader", badge: "default" },
];

export function OfferingInstructorsDialog({ open, onClose, offering }: Props) {
  const offeringId = offering?.id ?? "";
  const { data, isLoading, isError, refetch } = useOfferingInstructors(offeringId);
  const assign = useAssignInstructor(offeringId);
  const update = useUpdateInstructor(offeringId);
  const remove = useRemoveInstructor(offeringId);

  // Users query for assigning
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users-for-assignment"],
    queryFn: () =>
      get<ApiResponse<UserOption[]>>(endpoints.users.list, {
        params: { pageSize: 100, status: "ACTIVE" },
      }),
    enabled: open,
    staleTime: 60_000,
  });

  const instructors = data?.data ?? [];
  const allUsers = usersData?.data ?? [];

  // Form states
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeachingRoleType>("INSTRUCTOR");
  const [canManageContent, setCanManageContent] = useState(true);
  const [canGrade, setCanGrade] = useState(true);
  const [canManageAssessments, setCanManageAssessments] = useState(true);
  const [canManageStudents, setCanManageStudents] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Edit state
  const [editingInstructorId, setEditingInstructorId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<TeachingRoleType>("INSTRUCTOR");
  const [editContent, setEditContent] = useState(false);
  const [editGrade, setEditGrade] = useState(false);
  const [editAssessments, setEditAssessments] = useState(false);
  const [editStudents, setEditStudents] = useState(false);

  // When role changes in assign form, suggest logical defaults
  function handleRoleChange(newRole: TeachingRoleType) {
    setSelectedRole(newRole);
    if (newRole === "PRIMARY_INSTRUCTOR") {
      setCanManageContent(true);
      setCanGrade(true);
      setCanManageAssessments(true);
      setCanManageStudents(true);
    } else if (newRole === "INSTRUCTOR") {
      setCanManageContent(true);
      setCanGrade(true);
      setCanManageAssessments(true);
      setCanManageStudents(false);
    } else if (newRole === "TEACHING_ASSISTANT") {
      setCanManageContent(true);
      setCanGrade(true);
      setCanManageAssessments(false);
      setCanManageStudents(false);
    } else if (newRole === "GRADER") {
      setCanManageContent(false);
      setCanGrade(true);
      setCanManageAssessments(false);
      setCanManageStudents(false);
    }
  }

  function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    assign.mutate(
      {
        userId: selectedUserId,
        teachingRole: selectedRole,
        canManageContent,
        canGrade,
        canManageAssessments,
        canManageStudents,
      },
      {
        onSuccess: () => {
          setSelectedUserId("");
          setShowAssignForm(false);
          setUserSearch("");
        },
      }
    );
  }

  function startEditing(inst: CourseInstructor) {
    setEditingInstructorId(inst.id);
    setEditRole(inst.teachingRole);
    setEditContent(inst.canManageContent);
    setEditGrade(inst.canGrade);
    setEditAssessments(inst.canManageAssessments);
    setEditStudents(inst.canManageStudents);
  }

  function handleUpdateSubmit(instructorId: string) {
    update.mutate(
      {
        instructorId,
        payload: {
          teachingRole: editRole,
          canManageContent: editContent,
          canGrade: editGrade,
          canManageAssessments: editAssessments,
          canManageStudents: editStudents,
        },
      },
      {
        onSuccess: () => setEditingInstructorId(null),
      }
    );
  }

  // Filter available users (exclude already assigned, and never students)
  const assignedUserIds = new Set(instructors.map((i) => i.user.id));
  const availableUsers = allUsers.filter((u) => {
    if (u.studentProfile) return false;
    if (assignedUserIds.has(u.id)) return false;
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.universityId.toLowerCase().includes(term)
    );
  });

  if (!offering) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <UserCog className="text-primary h-5 w-5" />
          <span>Instructors — {offering.course.code}</span>
        </div>
      }
      description={
        <span>
          {offering.course.title} · Section {offering.section}
          {offering.semester?.name ? ` · ${offering.semester.name}` : ""}
        </span>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {instructors.length} {instructors.length === 1 ? "instructor" : "instructors"}{" "}
            assigned
          </p>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top actions */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-sm font-semibold">Teaching Staff</h3>
          {!showAssignForm && (
            <Button size="sm" onClick={() => setShowAssignForm(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Assign Instructor
            </Button>
          )}
        </div>

        {/* ── Assign Form ──────────────────────────────────────────── */}
        {showAssignForm && (
          <form
            onSubmit={handleAssignSubmit}
            className="border-primary/20 bg-primary/5 space-y-4 rounded-xl border p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-primary flex items-center gap-1.5 text-sm font-semibold">
                <UserCheck className="h-4 w-4" />
                Assign New Instructor
              </h4>
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Select Staff / User</label>
                <div className="space-y-1.5">
                  <Input
                    placeholder="Search name, ID, or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder={
                      usersLoading
                        ? "Loading staff members..."
                        : availableUsers.length === 0
                          ? "No eligible users found"
                          : "Choose an active staff member"
                    }
                    disabled={usersLoading || availableUsers.length === 0}
                    options={availableUsers.map((u) => ({
                      value: u.id,
                      label: `${u.firstName} ${u.lastName} (${u.universityId}) — ${u.email}`,
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Teaching Role</label>
                <Select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as TeachingRoleType)}
                  options={ROLE_OPTIONS.map((r) => ({
                    value: r.value,
                    label: r.label,
                  }))}
                />
              </div>
            </div>

            {/* Permission Flags */}
            <div className="bg-background/80 space-y-1.5 rounded-lg border p-3">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Permissions Granted
              </span>
              <div className="grid gap-2 pt-1 text-xs sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={canManageContent}
                    onChange={(e) => setCanManageContent(e.target.checked)}
                    className="border-border text-primary focus:ring-primary rounded"
                  />
                  <span>Manage Content & Syllabus</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={canGrade}
                    onChange={(e) => setCanGrade(e.target.checked)}
                    className="border-border text-primary focus:ring-primary rounded"
                  />
                  <span>Submit & Grade Student Work</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={canManageAssessments}
                    onChange={(e) => setCanManageAssessments(e.target.checked)}
                    className="border-border text-primary focus:ring-primary rounded"
                  />
                  <span>Create Quizzes & Exams</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={canManageStudents}
                    onChange={(e) => setCanManageStudents(e.target.checked)}
                    className="border-border text-primary focus:ring-primary rounded"
                  />
                  <span>Manage Student Registrations</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAssignForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={assign.isPending}
                disabled={!selectedUserId}
              >
                Confirm Assignment
              </Button>
            </div>
          </form>
        )}

        {/* ── Instructors List ─────────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {isError && (
          <ErrorState
            title="Failed to load instructors"
            description="Could not fetch assigned instructors for this offering."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && instructors.length === 0 && (
          <EmptyState
            icon={Users}
            title="No instructors assigned"
            description="Assign a primary instructor or teaching assistant to this course offering."
            action={
              !showAssignForm && (
                <Button size="sm" onClick={() => setShowAssignForm(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Assign First Instructor
                </Button>
              )
            }
          />
        )}

        {!isLoading && !isError && instructors.length > 0 && (
          <ul className="divide-border bg-card divide-y rounded-xl border">
            {instructors.map((inst) => {
              const roleInfo =
                ROLE_OPTIONS.find((r) => r.value === inst.teachingRole) ??
                ROLE_OPTIONS[1];
              const isEditing = editingInstructorId === inst.id;
              const initials = `${inst.user.firstName?.[0] ?? ""}${
                inst.user.lastName?.[0] ?? ""
              }`.toUpperCase();

              if (isEditing) {
                return (
                  <li key={inst.id} className="bg-muted/30 space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          fallback={initials}
                          src={inst.user.avatar || null}
                        />
                        <div>
                          <p className="text-sm font-semibold">
                            {inst.user.firstName} {inst.user.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {inst.user.universityId} · {inst.user.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant={roleInfo.badge}>{roleInfo.label}</Badge>
                    </div>

                    <div className="grid gap-3 pt-2 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium">Role</label>
                        <Select
                          value={editRole}
                          onChange={(e) =>
                            setEditRole(e.target.value as TeachingRoleType)
                          }
                          options={ROLE_OPTIONS.map((r) => ({
                            value: r.value,
                            label: r.label,
                          }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium">Permissions</span>
                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={editContent}
                              onChange={(e) => setEditContent(e.target.checked)}
                              className="border-border text-primary rounded"
                            />
                            <span>Content</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={editGrade}
                              onChange={(e) => setEditGrade(e.target.checked)}
                              className="border-border text-primary rounded"
                            />
                            <span>Grading</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={editAssessments}
                              onChange={(e) => setEditAssessments(e.target.checked)}
                              className="border-border text-primary rounded"
                            />
                            <span>Assessments</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={editStudents}
                              onChange={(e) => setEditStudents(e.target.checked)}
                              className="border-border text-primary rounded"
                            />
                            <span>Students</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingInstructorId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        loading={update.isPending}
                        onClick={() => handleUpdateSubmit(inst.id)}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Save Changes
                      </Button>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={inst.id}
                  className="hover:bg-muted/20 flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      fallback={initials}
                      src={inst.user.avatar || null}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">
                          {inst.user.firstName} {inst.user.lastName}
                        </h4>
                        <Badge variant={roleInfo.badge}>{roleInfo.label}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {inst.user.universityId} · {inst.user.email}
                      </p>

                      {/* Permission pills */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            inst.canManageContent
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground line-through opacity-60"
                          }`}
                        >
                          Content
                        </span>
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            inst.canGrade
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground line-through opacity-60"
                          }`}
                        >
                          Grading
                        </span>
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            inst.canManageAssessments
                              ? "bg-info/10 text-info"
                              : "bg-muted text-muted-foreground line-through opacity-60"
                          }`}
                        >
                          Assessments
                        </span>
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            inst.canManageStudents
                              ? "bg-warning/10 text-warning"
                              : "bg-muted text-muted-foreground line-through opacity-60"
                          }`}
                        >
                          Students
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(inst)}
                      title="Edit role and permissions"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger/10 hover:text-danger"
                      onClick={() => {
                        if (
                          confirm(
                            `Remove ${inst.user.firstName} ${inst.user.lastName} from teaching this course?`
                          )
                        ) {
                          remove.mutate(inst.id);
                        }
                      }}
                      loading={remove.isPending}
                      title="Remove instructor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
