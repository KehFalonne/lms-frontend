"use client";
import { useMemo } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  FileText,
  LogIn,
  MessageSquare,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RecentActivityEvent } from "../types/lecturer.types";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";

export const ANALYTICS_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const EVENT_ICONS: Record<string, typeof Activity> = {
  ASSIGNMENT_SUBMITTED: ClipboardList,
  ASSESSMENT_SUBMITTED: FileQuestion,
  CONTENT_VIEWED: BookOpen,
  CONTENT_COMPLETED: CheckCircle2,
  PDF_OPENED: FileText,
  PDF_DOWNLOADED: FileText,
  DISCUSSION_VIEWED: MessageSquare,
  LOGIN: LogIn,
};

export function eventIcon(type: string): typeof Activity {
  return EVENT_ICONS[type] ?? Activity;
}

export function GradeDistributionChart({
  data,
}: {
  data: { bucket: string; count: number }[];
}) {
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return (
      <p className="text-muted-foreground px-4 pb-6 text-sm">
        No published grades yet.
      </p>
    );
  }
  return (
    <div className="h-64 px-2 pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            contentStyle={{ borderRadius: 12, fontSize: 12 }}
            formatter={(value) => [`${value} grades`, "Count"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell
                key={entry.bucket}
                fill={ANALYTICS_COLORS[i % ANALYTICS_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityChart({
  data,
  name = "events",
}: {
  data: { date: string; count: number }[];
  name?: string;
}) {
  const rows = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        day: new Date(d.date).toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
      })),
    [data]
  );
  const hasData = rows.some((r) => r.count > 0);
  if (!hasData) {
    return (
      <p className="text-muted-foreground px-4 pb-6 text-sm">
        No learning activity recorded in this window.
      </p>
    );
  }
  return (
    <div className="h-64 px-2 pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            contentStyle={{ borderRadius: 12, fontSize: 12 }}
            formatter={(value) => [`${value} ${name}`, "Activity"]}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityFeed({ events }: { events: RecentActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground px-4 pb-6 text-sm">
        No recent activity to show.
      </p>
    );
  }
  return (
    <ul className="space-y-1 px-4 pb-5 sm:px-5">
      {events.map((event) => {
        const Icon = eventIcon(event.eventType);
        return (
          <li
            key={event.id}
            className="hover:bg-muted/40 flex items-start gap-3 rounded-xl p-2 transition-colors"
          >
            <span className="bg-info/10 text-info ring-info/15 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-semibold">{event.studentName}</span>{" "}
                <span className="text-muted-foreground">
                  {event.label.toLowerCase()}
                </span>
              </p>
              <p className="text-muted-foreground text-xs">
                {relativeTime(event.occurredAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function EngagementList({
  data,
}: {
  data: { type: string; label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground px-4 pb-6 text-sm">
        No events recorded for this course yet.
      </p>
    );
  }
  return (
    <ul className="space-y-3 px-4 pb-5 sm:px-5">
      {data.map((entry, i) => {
        const Icon = eventIcon(entry.type);
        return (
          <li key={entry.type} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                "bg-primary/10 text-primary ring-primary/15"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium">{entry.label}</p>
                <p className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {entry.count}
                </p>
              </div>
              <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(4, (entry.count / max) * 100)}%`,
                    backgroundColor: ANALYTICS_COLORS[i % ANALYTICS_COLORS.length],
                  }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
