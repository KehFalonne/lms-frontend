"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Settings2 } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CategoryWeightsDialog } from "@/features/grading/components/category-weights-dialog";
import { GradebookGrid } from "@/features/grading/components/gradebook-grid";
import { usePublishAllGrades } from "@/features/grading/hooks/useGrades";
import { useCourse } from "@/features/courses/hooks/useCourses";
import { LECTURER_ROLES } from "@/lib/constants/routes";

export default function GradebookPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <Content params={params} />
    </AuthGate>
  );
}

function Content({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const courseQ = useCourse(courseId);
  const publishAll = usePublishAllGrades(courseId);

  const [weightsOpen, setWeightsOpen] = useState(false);
  const [confirmPublishAll, setConfirmPublishAll] = useState(false);

  const course = courseQ.data?.data;

  return (
    <div>
      <Link
        href={`/lecturer/courses/${courseId}`}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to course
      </Link>

      <PageHeader
        title={course ? `Gradebook — ${course.course.code}` : "Gradebook"}
        description={course?.course.title}
        actions={
          <>
            <Button variant="outline" onClick={() => setWeightsOpen(true)}>
              <Settings2 className="mr-1.5 h-4 w-4" />
              Categories
            </Button>
            <Button onClick={() => setConfirmPublishAll(true)}>
              <Send className="mr-1.5 h-4 w-4" />
              Publish all
            </Button>
          </>
        }
      />

      <GradebookGrid offeringId={courseId} />

      <p className="text-muted-foreground mt-3 text-xs">
        Click any cell to enter or edit a score. Blur or press Enter to save. Press Escape
        to cancel.
      </p>

      <CategoryWeightsDialog
        open={weightsOpen}
        onClose={() => setWeightsOpen(false)}
        offeringId={courseId}
      />

      <Dialog
        open={confirmPublishAll}
        onClose={() => !publishAll.isPending && setConfirmPublishAll(false)}
        title="Publish all grades?"
        description="Every draft grade in this course will become visible to students. This cannot be undone from the UI."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmPublishAll(false)}
              disabled={publishAll.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                publishAll.mutate(undefined, {
                  onSuccess: () => setConfirmPublishAll(false),
                })
              }
              loading={publishAll.isPending}
            >
              Publish all
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm">
          Students will be notified and can view these grades immediately.
        </p>
      </Dialog>
    </div>
  );
}
