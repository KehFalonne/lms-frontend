"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ClipboardList, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
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

  const items = (data?.data ?? []) as AssignmentDetail[];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assignments</h2>
        <AssignmentFormDialog offeringId={courseId} />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
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
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={a.status === "PUBLISHED" ? "success" : "default"}>
                      {a.status}
                    </Badge>
                    <Badge>{a.maxScore} pts</Badge>
                    <Badge variant="info">{a.submissionType}</Badge>
                  </div>
                  <h3 className="mt-1.5 font-medium">{a.title}</h3>
                  {a.description && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                      {a.description}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    Due {formatDateTime(a.dueAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {a.status === "DRAFT" && (
                    <Button size="sm" onClick={() => setConfirmPublish(a)}>
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Publish
                    </Button>
                  )}
                  <Link
                    href={`/lecturer/assignments/${a.id}/submissions`}
                    className="text-primary text-xs hover:underline"
                  >
                    Submissions
                  </Link>
                </div>
              </div>
            </Card>
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
