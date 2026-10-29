"use client";
import { CheckCircle2, Circle } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncementReaders } from "../hooks/useAnnouncements";
import type { Announcement } from "../types/announcement.types";

interface Props {
  announcement: Announcement;
  onClose: () => void;
}

export function ReadersDialog({ announcement, onClose }: Props) {
  const { data, isLoading } = useAnnouncementReaders(announcement.id);
  const payload = data?.data; // ← now fully typed, no cast needed

  return (
    <Dialog
      open={!!announcement}
      onClose={onClose}
      title="Read receipts"
      description={announcement.title}
      size="lg"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {isLoading && <Skeleton className="h-40 w-full" />}
      {payload && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="border-success/30 bg-success/5 rounded-md border p-3">
              <p className="text-success text-xs">Read</p>
              <p className="text-2xl font-semibold">{payload.readCount}</p>
            </div>
            <div className="border-warning/30 bg-warning/5 rounded-md border p-3">
              <p className="text-warning text-xs">Not read</p>
              <p className="text-2xl font-semibold">
                {payload.totalStudents - payload.readCount}
              </p>
            </div>
          </div>

          {payload.readers.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Read
              </p>
              <ul className="space-y-1">
                {payload.readers.map((r) => (
                  <li
                    key={r.id}
                    className="border-border flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
                    <Avatar
                      size="sm"
                      fallback={`${r.firstName[0] ?? ""}${r.lastName[0] ?? ""}`.toUpperCase()}
                    />
                    <span className="text-sm">
                      {r.firstName} {r.lastName}
                    </span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {r.universityId}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {payload.notRead.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Not yet read
              </p>
              <ul className="space-y-1">
                {payload.notRead.map((r) => (
                  <li
                    key={r.id}
                    className="border-border flex items-center gap-2 rounded-md border px-3 py-2 opacity-75"
                  >
                    <Circle className="text-muted-foreground h-4 w-4 shrink-0" />
                    <Avatar
                      size="sm"
                      fallback={`${r.firstName[0] ?? ""}${r.lastName[0] ?? ""}`.toUpperCase()}
                    />
                    <span className="text-sm">
                      {r.firstName} {r.lastName}
                    </span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {r.universityId}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
