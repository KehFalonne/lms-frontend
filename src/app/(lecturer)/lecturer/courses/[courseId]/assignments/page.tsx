"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ClipboardList, Send, SquarePen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DueChip } from "@/components/ui/due-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { AssignmentFormDialog } from "@/features/assignments/components/assignment-form-dialog";
import {
  useCourseAssignments,
  usePublishAssignment,
} from "@/features/assignments/hooks/useAssignments";
import { formatDateTime } from "@/lib/utils/format";
import type { AssignmentDetail } from "@/features/assignments/types/assignment.types";

export default function LecturerAssignmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading, isError, refetch } = useCourseAssignments(courseId);
  const publish = usePublishAssignment(courseId);
  const [confirmPublish, setConfirmPublish] = useState<AssignmentDetail | null>(null);
  const [editing, setEditing] = useState<AssignmentDetail | null>(null);

  const items = (data?.data ?? []) as AssignmentDetail[];
  const publishedCount = items.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = items.length - publishedCount;

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
            <span aria-hidden className="bg-primary/50 h-px w-6" />
            Graded work
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
            Create, publish and track coursework submissions.
          </p>
        </div>
        <AssignmentFormDialog
          offeringId={courseId}
          assignment={editing}
          onEditClosed={() => setEditing(null)}
        />
      </header>

      {!isLoading && !isError && items.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
            <ClipboardList className="text-primary h-3.5 w-3.5" aria-hidden />
            {items.length} {items.length === 1 ? "assignment" : "assignments"}
          </span>
          <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
            <Send className="text-success h-3.5 w-3.5" aria-hidden />
            {publishedCount} published
          </span>
          <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
            <SquarePen className="text-warning h-3.5 w-3.5" aria-hidden />
            {draftCount} {draftCount === 1 ? "draft" : "drafts"}
          </span>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Create your first assignment to get started."
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="space-y-3">
          {items.map((a) => (
            <GlassCard key={a.id} className="cv-auto p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={a.status === "PUBLISHED" ? "success" : "default"}>
                      {a.status}
                    </Badge>
                    <Badge>{a.maxScore} pts</Badge>
                    <Badge variant="info">{a.submissionType}</Badge>
                    <DueChip iso={a.dueAt} />
                  </div>
                  <h3 className="mt-2 font-semibold">{a.title}</h3>
                  {a.description && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                      {a.description}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    Due {formatDateTime(a.dueAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(a)}
                    >
                      <SquarePen className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    {a.status === "DRAFT" && (
                      <Button size="sm" onClick={() => setConfirmPublish(a)}>
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
                  </div>
                  <Link
                    href={`/lecturer/courses/${courseId}/assignments/${a.id}/submissions`}
                    className="hover:bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                  >
                    <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                    Submissions
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Dialog
        open={!!confirmPublish}
        onClose={() => !publish.isPending && setConfirmPublish(null)}
        title="Publish assignment?"
        description={`Students in this course will be notified and can submit immediately after publishing "${confirmPublish?.title ?? ""}".`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmPublish(null)}
              disabled={publish.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!confirmPublish) return;
                publish.mutate(confirmPublish.id, {
                  onSuccess: () => setConfirmPublish(null),
                });
              }}
              loading={publish.isPending}
            >
              Publish
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm">
          After publishing, the assignment is visible to all enrolled students.
        </p>
      </Dialog>
    </div>
  );
}
