"use client";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { EVENT_STYLES } from "./event-colors";
import type { CalendarItem } from "../types/calendar.types";

interface Props {
  cursor: Date;
  onCursorChange: (d: Date) => void;
  selected: Date;
  onSelect: (d: Date) => void;
  events: CalendarItem[];
  onEventClick: (event: CalendarItem) => void;
}

export function MonthView({
  cursor,
  onCursorChange,
  selected,
  onSelect,
  events,
  onEventClick,
}: Props) {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsOn = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startAt), day));

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{format(cursor, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCursorChange(subMonths(cursor, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onCursorChange(new Date());
              onSelect(new Date());
            }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCursorChange(addMonths(cursor, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-border bg-border grid grid-cols-7 gap-px overflow-hidden rounded-md border text-center text-xs font-medium">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-surface text-muted-foreground py-2">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dayEvents = eventsOn(day);
          const isSel = isSameDay(day, selected);
          const today = isToday(day);
          const inMonth = isSameMonth(day, cursor);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={cn(
                "bg-background hover:bg-surface min-h-[80px] p-1.5 text-left align-top transition-colors sm:min-h-[100px] sm:p-2",
                !inMonth && "opacity-40",
                isSel && "ring-primary ring-2 ring-inset"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  today && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((e) => {
                  const style = EVENT_STYLES[e.eventType];
                  return (
                    <button
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick(e);
                      }}
                      className={cn(
                        "block w-full truncate rounded px-1 py-0.5 text-left text-[10px] sm:text-xs",
                        style.bg,
                        style.text
                      )}
                    >
                      {e.title}
                    </button>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="text-muted-foreground text-[10px]">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
