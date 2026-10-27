import { Megaphone, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { relativeTime } from "@/lib/utils/format";
import type { Announcement } from "../types/announcement.types";

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
          <Megaphone className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{announcement.title}</h3>
            {announcement.isPinned && (
              <Badge variant="warning">
                <Pin className="mr-1 h-3 w-3" />
                Pinned
              </Badge>
            )}
          </div>

          <p className="mt-2 text-sm whitespace-pre-line">{announcement.body}</p>

          <p className="text-muted-foreground mt-3 text-xs">
            {announcement.createdBy
              ? `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`
              : "System"}{" "}
            · {relativeTime(announcement.publishAt ?? announcement.createdAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}
