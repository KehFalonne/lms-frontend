"use client";
import { format } from "date-fns";
import { Calendar as CalIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
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
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-sm font-semibold">
                {format(date, "EEEE, MMM d, yyyy")}
              </h3>
              <span className="text-muted-foreground text-xs">
                {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="space-y-1.5">
              {dayEvents.map((e) => {
                const style = EVENT_STYLES[e.eventType];
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => onEventClick(e)}
                      className="border-border hover:bg-surface flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors"
                    >
                      <div className={`h-10 w-1 shrink-0 rounded ${style.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium">{e.title}</span>
                          <span className={`text-[10px] uppercase ${style.text}`}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {!e.allDay && format(new Date(e.startAt), "h:mm a")}
                          {e.courseCode && ` · ${e.courseCode}`}
                          {e.location && ` · ${e.location}`}
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
