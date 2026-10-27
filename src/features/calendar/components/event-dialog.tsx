"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useDeleteCalendarEvent } from "../hooks/useCalendar";
import { EVENT_STYLES } from "./event-colors";
import type { CalendarItem } from "../types/calendar.types";

interface Props {
  event: CalendarItem | null;
  onClose: () => void;
}

export function EventDialog({ event, onClose }: Props) {
  const del = useDeleteCalendarEvent();

  if (!event) return null;

  const style = EVENT_STYLES[event.eventType];
  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);

  return (
    <Dialog
      open={!!event}
      onClose={() => !del.isPending && onClose()}
      title={event.title}
      description={
        event.courseCode ? `${event.courseCode} · ${event.courseTitle}` : undefined
      }
      footer={
        <>
          {event.canEdit && event.sourceType === "EVENT" && (
            <Button
              variant="outline"
              className="text-danger mr-auto"
              onClick={() => del.mutate(event.id, { onSuccess: onClose })}
              loading={del.isPending}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <span className="font-medium">{style.label}</span>
        </div>
        <Row
          label="When"
          value={
            event.allDay
              ? startDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : `${startDate.toLocaleString()} – ${endDate.toLocaleTimeString()}`
          }
        />
        {event.location && <Row label="Location" value={event.location} />}
        {event.description && (
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
              Description
            </p>
            <p className="whitespace-pre-line">{event.description}</p>
          </div>
        )}
        {event.sourceType === "ASSIGNMENT_DUE" && (
          <p className="border-info/30 bg-info/10 text-info rounded-md border p-2 text-xs">
            This is an assignment due date. Manage it from the assignments page.
          </p>
        )}
        {event.sourceType === "ASSESSMENT_WINDOW" && (
          <p className="border-info/30 bg-info/10 text-info rounded-md border p-2 text-xs">
            This is an assessment deadline. Manage it from the assessments page.
          </p>
        )}
      </div>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex justify-between border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
