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
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AgendaView } from "@/features/calendar/components/agenda-view";
import { CreateEventDialog } from "@/features/calendar/components/create-event-dialog";
import { EventDialog } from "@/features/calendar/components/event-dialog";
import { MonthView } from "@/features/calendar/components/month-view";
import { useCalendar } from "@/features/calendar/hooks/useCalendar";
import { cn } from "@/lib/utils/cn";
import type { CalendarEventType, CalendarItem } from "@/features/calendar/types/calendar.types";

type View = "month" | "agenda";

type FilterValue = "ALL" | "LECTURE" | "ASSIGNMENT_DUE" | "EXAM" | "MEETING";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "ALL" },
  { label: "Lectures", value: "LECTURE" },
  { label: "Assignments", value: "ASSIGNMENT_DUE" },
  { label: "Exams & Quizzes", value: "EXAM" },
  { label: "Meetings", value: "MEETING" },
];

function matchesFilter(type: CalendarEventType, filter: FilterValue) {
  if (filter === "ALL") return true;
  if (filter === "EXAM") return type === "EXAM" || type === "QUIZ";
  return type === filter;
}

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
  const [filter, setFilter] = useState<FilterValue>("ALL");

  // Fetch range: current month + buffer
  const { from, to } = useMemo(() => {
    const start = startOfWeek(startOfMonth(subMonths(cursor, 1)));
    const end = endOfWeek(endOfMonth(addMonths(cursor, 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }, [cursor]);

  const { data, isLoading, isError, refetch } = useCalendar(from, to);
  const events = useMemo(
    () => (data?.data ?? []).filter((e) => matchesFilter(e.eventType, filter)),
    [data, filter]
  );

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
      {/* Library header */}
      <header className="mb-5 sm:mb-6">
        <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
          <span aria-hidden className="bg-primary/50 h-px w-6" />
          Semester schedule
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Calendar
            </h1>
            <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
              Assignment due dates, assessment windows and course events — in one rhythm.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateEventDialog defaultDate={selected} />
            <div
              role="tablist"
              aria-label="Calendar view"
              className="border-border/60 bg-muted/50 flex items-center gap-1 rounded-xl border p-1"
            >
              <button
                role="tab"
                aria-selected={view === "month"}
                onClick={() => setView("month")}
                className={cn(
                  "focus-visible:ring-primary/50 inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 outline-none focus-visible:ring-2",
                  view === "month"
                    ? "bg-background text-primary ring-border/70 shadow-sm ring-1"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Month</span>
              </button>
              <button
                role="tab"
                aria-selected={view === "agenda"}
                onClick={() => setView("agenda")}
                className={cn(
                  "focus-visible:ring-primary/50 inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 outline-none focus-visible:ring-2",
                  view === "agenda"
                    ? "bg-background text-primary ring-border/70 shadow-sm ring-1"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Agenda</span>
              </button>
            </div>
          </div>
        </div>
        <div
          role="group"
          aria-label="Filter events by type"
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                filter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {isLoading && <Skeleton className="h-[600px] w-full rounded-2xl" />}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          {view === "month" ? (
            <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
              <MonthView
                cursor={cursor}
                onCursorChange={setCursor}
                selected={selected}
                onSelect={setSelected}
                events={events}
                onEventClick={setOpenEvent}
              />
              <GlassCard>
                <div className="border-border/60 border-b p-4">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                    {format(selected, "EEEE")}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold">
                    {format(selected, "MMMM d")}
                  </h3>
                </div>
                <div className="p-3">
                  {selectedEvents.length === 0 ? (
                    <EmptyState
                      icon={CalIcon}
                      title="No events"
                      description="Nothing scheduled for this day."
                    />
                  ) : (
                    <ul className="space-y-1.5">
                      {selectedEvents.map((e) => (
                        <li key={e.id}>
                          <button
                            onClick={() => setOpenEvent(e)}
                            className="group hover:bg-primary/[0.04] flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors"
                          >
                            <span className="bg-primary/10 ring-primary/15 flex h-10 w-9 shrink-0 flex-col items-center justify-center rounded-lg leading-none ring-1">
                              <span className="text-primary text-sm font-bold tabular-nums">
                                {new Date(e.startAt).getDate()}
                              </span>
                              <span className="text-primary/70 mt-0.5 text-[7px] font-semibold tracking-widest uppercase">
                                {format(new Date(e.startAt), "MMM")}
                              </span>
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs leading-5 font-semibold">
                                {e.title}
                              </span>
                              <span className="text-muted-foreground mt-0.5 block text-[9px] font-semibold tracking-[0.14em] uppercase">
                                {!e.allDay && format(new Date(e.startAt), "h:mm a")}
                                {e.allDay && "All day"}
                                {e.courseCode && (
                                  <>
                                    {" · "}
                                    <span className="course-code">{e.courseCode}</span>
                                  </>
                                )}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </GlassCard>
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
