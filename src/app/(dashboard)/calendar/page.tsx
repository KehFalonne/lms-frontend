"use client";
import { useMemo, useState } from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
} from "date-fns";
import { Calendar as CalIcon, List, LayoutGrid } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AgendaView } from "@/features/calendar/components/agenda-view";
import { CreateEventDialog } from "@/features/calendar/components/create-event-dialog";
import { EventDialog } from "@/features/calendar/components/event-dialog";
import { MonthView } from "@/features/calendar/components/month-view";
import { useCalendar } from "@/features/calendar/hooks/useCalendar";
import type { CalendarItem } from "@/features/calendar/types/calendar.types";

type View = "month" | "agenda";

export default function CalendarPage() {
  return (
    <AuthGate>
      <CalendarContent />
    </AuthGate>
  );
}

function CalendarContent() {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [openEvent, setOpenEvent] = useState<CalendarItem | null>(null);

  // Fetch range: current month + buffer
  const { from, to } = useMemo(() => {
    const start = startOfWeek(startOfMonth(subMonths(cursor, 1)));
    const end = endOfWeek(endOfMonth(addMonths(cursor, 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }, [cursor]);

  const { data, isLoading, isError, refetch } = useCalendar(from, to);
  const events = data?.data ?? [];

  const selectedEvents = useMemo(
    () =>
      events.filter((e) => {
        const s = new Date(e.startAt);
        return (
          s.getFullYear() === selected.getFullYear() &&
          s.getMonth() === selected.getMonth() &&
          s.getDate() === selected.getDate()
        );
      }),
    [events, selected]
  );

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Assignments, assessments, and course events."
        actions={
          <div className="flex items-center gap-2">
            <CreateEventDialog defaultDate={selected} />
            <div className="border-border flex items-center gap-1 rounded-md border p-0.5">
              <button
                onClick={() => setView("month")}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm ${
                  view === "month" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Month</span>
              </button>
              <button
                onClick={() => setView("agenda")}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm ${
                  view === "agenda" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Agenda</span>
              </button>
            </div>
          </div>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-[600px] w-full" />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {view === "month" ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <MonthView
                cursor={cursor}
                onCursorChange={setCursor}
                selected={selected}
                onSelect={setSelected}
                events={events}
                onEventClick={setOpenEvent}
              />
              <div className="border-border bg-background rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold">
                  {format(selected, "EEEE, MMM d")}
                </h3>
                {selectedEvents.length === 0 ? (
                  <EmptyState
                    icon={CalIcon}
                    title="No events"
                    description="Nothing scheduled for this day."
                  />
                ) : (
                  <ul className="space-y-2">
                    {selectedEvents.map((e) => (
                      <li key={e.id}>
                        <button
                          onClick={() => setOpenEvent(e)}
                          className="border-border hover:bg-surface w-full rounded-md border p-2 text-left text-sm transition-colors"
                        >
                          <p className="font-medium">{e.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {!e.allDay && format(new Date(e.startAt), "h:mm a")}
                            {e.courseCode && ` · ${e.courseCode}`}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <AgendaView events={events} onEventClick={setOpenEvent} />
          )}
        </>
      )}

      <EventDialog event={openEvent} onClose={() => setOpenEvent(null)} />
    </div>
  );
}
