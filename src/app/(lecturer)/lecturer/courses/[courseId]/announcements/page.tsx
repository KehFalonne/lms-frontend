"use client";
import { use, useState } from "react";
import { Megaphone, Send } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementFormDialog } from "@/features/announcements/components/announcement-form-dialog";
import {
  useCourseAnnouncements,
  usePublishAnnouncement,
} from "@/features/announcements/hooks/useAnnouncements";
import { LECTURER_ROLES } from "@/lib/constants/routes";
import { relativeTime } from "@/lib/utils/format";
import type { Announcement } from "@/features/announcements/types/announcement.types";

export default function LecturerAnnouncementsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <AnnouncementsContent params={params} />
    </AuthGate>
  );
}

function AnnouncementsContent({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data, isLoading } = useCourseAnnouncements(courseId);
  const publish = usePublishAnnouncement(courseId);
  const [confirmPublish, setConfirmPublish] = useState<Announcement | null>(null);

  const items = data?.data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <AnnouncementFormDialog offeringId={courseId} />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Post your first update to the class."
        />
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{a.title}</h3>
                    <Badge variant={a.status === "PUBLISHED" ? "success" : "default"}>
                      {a.status}
                    </Badge>
                    {a.isPinned && <Badge variant="warning">Pinned</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">
                    {a.body}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {relativeTime(a.publishAt ?? a.createdAt)}
                  </p>
                  {a.status === "DRAFT" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setConfirmPublish(a)}
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!confirmPublish}
        onClose={() => !publish.isPending && setConfirmPublish(null)}
        title="Publish announcement?"
        description={`Students will be notified and can see "${confirmPublish?.title ?? ""}".`}
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
          All enrolled students will receive a notification.
        </p>
      </Dialog>
    </div>
  );
}
