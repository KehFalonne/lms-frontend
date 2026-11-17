"use client";

import { use, useState } from "react";
import { Plus, ShieldCheck, UserCog, Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferingInstructorsDialog } from "@/features/courses/components/offering-instructors-dialog";
import { useCourse } from "@/features/courses/hooks/useCourses";
import { useOfferingInstructors } from "@/features/courses/hooks/useOfferings";

export default function LecturerCourseInstructorsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: courseData } = useCourse(courseId);
  const { data, isLoading, isError, error, refetch } = useOfferingInstructors(courseId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const offering = courseData?.data;
  const instructors = data?.data ?? [];

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Teaching Team ({isLoading ? "…" : instructors.length})
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Lecturers, teaching assistants, and graders assigned to this section.
            </p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Manage Staff
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load instructors"
          description={
            (error as Error)?.message ?? "Failed to load teaching team from server."
          }
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && instructors.length === 0 && (
        <EmptyState
          icon={Users}
          title="No instructors assigned"
          description="There are currently no instructors assigned to this section."
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Assign Instructor
            </Button>
          }
        />
      )}

      {!isLoading && !isError && instructors.length > 0 && (
        <Card className="divide-border divide-y">
          {instructors.map((inst) => {
            const initials = `${inst.user.firstName?.[0] ?? ""}${
              inst.user.lastName?.[0] ?? ""
            }`.toUpperCase();

            let roleVariant: "primary" | "info" | "warning" | "default" = "default";
            if (inst.teachingRole === "PRIMARY_INSTRUCTOR") roleVariant = "primary";
            else if (inst.teachingRole === "INSTRUCTOR") roleVariant = "info";
            else if (inst.teachingRole === "TEACHING_ASSISTANT") roleVariant = "warning";

            return (
              <div
                key={inst.id}
                className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar size="md" fallback={initials} src={inst.user.avatar || null} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {inst.user.firstName} {inst.user.lastName}
                      </p>
                      <Badge variant={roleVariant}>
                        {inst.teachingRole.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {inst.user.universityId} · {inst.user.email}
                    </p>

                    {/* Permissions list */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${
                          inst.canManageContent
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground line-through opacity-60"
                        }`}
                      >
                        Content
                      </span>
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${
                          inst.canGrade
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground line-through opacity-60"
                        }`}
                      >
                        Grading
                      </span>
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${
                          inst.canManageAssessments
                            ? "bg-info/10 text-info"
                            : "bg-muted text-muted-foreground line-through opacity-60"
                        }`}
                      >
                        Assessments
                      </span>
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${
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

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                  className="self-end text-xs sm:self-center"
                >
                  <UserCog className="text-primary mr-1.5 h-3.5 w-3.5" />
                  Edit Permissions
                </Button>
              </div>
            );
          })}
        </Card>
      )}

      {/* Staff Management Modal */}
      {offering && (
        <OfferingInstructorsDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          offering={offering}
        />
      )}
    </div>
  );
}
