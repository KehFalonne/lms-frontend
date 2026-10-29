"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { getProctoringEvents } from "../api/assessments.api";
import { PROCTORING_LABELS } from "../types/proctoring.types";
import { formatDateTime } from "@/lib/utils/format";
import type { ProctoringEvent } from "../types/proctoring.types";

interface Props {
  attemptId: string | null;
  onClose: () => void;
}

interface Bucket {
  key: string;
  label: string;
  events: ProctoringEvent[];
  counts: Record<string, number>;
}

const BUCKET_MINUTES = 5;

export function ProctoringEventDialog({ attemptId, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["proctoring-events", attemptId],
    queryFn: () => getProctoringEvents(attemptId!),
    enabled: !!attemptId,
  });

  const events = useMemo(() => data?.data ?? [], [data]);

  const buckets = useMemo<Bucket[]>(() => {
    const map = new Map<string, ProctoringEvent[]>();
    for (const e of events) {
      const d = new Date(e.createdAt);
      const minutes = d.getMinutes();
      const bucketMin = Math.floor(minutes / BUCKET_MINUTES) * BUCKET_MINUTES;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}-${String(bucketMin).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    const result: Bucket[] = [];
    for (const [key, evts] of Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    )) {
      const first = evts[0];
      const d = new Date(first.createdAt);
      const minutes = d.getMinutes();
      const startMin = Math.floor(minutes / BUCKET_MINUTES) * BUCKET_MINUTES;
      const endMin = startMin + BUCKET_MINUTES;
      const pad = (n: number) => String(n).padStart(2, "0");
      const label = `${pad(d.getHours())}:${pad(startMin)} – ${pad(d.getHours())}:${pad(endMin)}`;
      const counts: Record<string, number> = {};
      for (const e of evts) counts[e.eventType] = (counts[e.eventType] ?? 0) + 1;
      result.push({ key, label, events: evts, counts });
    }
    return result;
  }, [events]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Dialog
      open={!!attemptId}
      onClose={onClose}
      title="Integrity log"
      description={`${events.length} event${events.length === 1 ? "" : "s"} across ${buckets.length} window${buckets.length === 1 ? "" : "s"}`}
      size="lg"
    >
      {isLoading && <Skeleton className="h-40 w-full" />}
      {!isLoading && events.length === 0 && (
        <EmptyState
          icon={AlertTriangle}
          title="No events"
          description="Nothing was flagged for this attempt."
        />
      )}
      {!isLoading && events.length > 0 && (
        <div className="space-y-2">
          {buckets.map((bucket) => {
            const isOpen = expanded.has(bucket.key);
            return (
              <div
                key={bucket.key}
                className="border-border overflow-hidden rounded-md border"
              >
                <button
                  type="button"
                  onClick={() => toggle(bucket.key)}
                  className={cn(
                    "bg-surface/50 hover:bg-surface flex w-full items-start justify-between gap-3 p-3 text-left transition-colors"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{bucket.label}</span>
                    <Badge variant="outline">
                      {bucket.events.length} event
                      {bucket.events.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {Object.entries(bucket.counts).map(([type, n]) => (
                      <Badge key={type} variant="warning">
                        {n}×{" "}
                        {PROCTORING_LABELS[type as keyof typeof PROCTORING_LABELS] ??
                          type}
                      </Badge>
                    ))}
                  </div>
                </button>
                {isOpen && (
                  <ul className="divide-border bg-background divide-y">
                    {bucket.events.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-start justify-between gap-3 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">
                            {PROCTORING_LABELS[e.eventType] ?? e.eventType}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDateTime(e.createdAt)}
                            {e.ipAddress ? ` · IP ${e.ipAddress}` : ""}
                          </p>
                        </div>
                        {Object.keys(e.detail).length > 0 && (
                          <code className="bg-surface text-muted-foreground rounded px-2 py-0.5 text-[10px]">
                            {JSON.stringify(e.detail).slice(0, 40)}
                          </code>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
