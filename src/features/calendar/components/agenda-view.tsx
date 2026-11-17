"use client";
import { format } from "date-fns";
import { Calendar as CalIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { EVENT_STYLES } from "./event-colors";
import type { CalendarItem } from "../types/calendar.types";

interface Props {
  events: CalendarItem[];
  onEventClick: (event: CalendarItem) => void;
}

export function AgendaView({ events, onEventClick }: Props) {
  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CalIcon className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
        <p className="text-muted-foreground text-sm">No events in this period.</p>
      </Card>
    );
  }

  const grouped: Record<string, CalendarItem[]> = {};
  events.forEach((e) => {
    const key = format(new Date(e.startAt), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="space-y-4">
      {sortedKeys.map((key) => {
        const dayEvents = grouped[key];
        const date = new Date(key);
        return (
          <div key={key}>
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold tracking-tight">
                {format(date, "EEEE, MMM d, yyyy")}
              </h3>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="space-y-2">
              {dayEvents.map((e) => {
                const style = EVENT_STYLES[e.eventType];
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => onEventClick(e)}
                      className="group flex w-full items-stretch gap-3 rounded-xl border border-border/70 bg-background p-3 text-left shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      <span aria-hidden className={cn("w-1 shrink-0 rounded-full", style.dot)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold group-hover:text-primary">
                            {e.title}
                          </span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", style.bg, style.text)}>
                            {style.label}
                          </span>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{e.allDay ? "All day" : format(new Date(e.startAt), "h:mm a")}</span>
                          {e.courseCode && (
                            <span className="course-code rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                              {e.courseCode}
                            </span>
                          )}
                          {e.location && <span className="truncate">📍 {e.location}</span>}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
