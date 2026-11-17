"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Link2,
  ListOrdered,
  PlayCircle,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useContentTree } from "@/features/content/hooks/useContent";
import type { ContentType, ProgressStatus } from "@/features/content/types/content.types";
import { cn } from "@/lib/utils/cn";

const TYPE_STYLE: Record<ContentType, string> = {
  TEXT: "bg-primary/10 text-primary ring-primary/20",
  PDF: "bg-danger/10 text-danger ring-danger/20",
  DOCUMENT: "bg-warning/10 text-warning ring-warning/25",
  VIDEO: "bg-info/10 text-info ring-info/20",
  AUDIO: "bg-success/10 text-success ring-success/20",
  LINK: "bg-muted text-muted-foreground ring-border",
  EMBED: "bg-info/10 text-info ring-info/20",
  FILE: "bg-muted text-muted-foreground ring-border",
};

const TYPE_ICON: Record<ContentType, typeof FileText> = {
  TEXT: FileText,
  PDF: FileText,
  DOCUMENT: FileText,
  VIDEO: PlayCircle,
  AUDIO: PlayCircle,
  LINK: Link2,
  EMBED: Link2,
  FILE: FileText,
};

export default function CourseContentPageClient({ courseId }: { courseId: string }) {
  const { data, isLoading, isError, refetch } = useContentTree(courseId);
  const modules = data?.data ?? [];

  useEffect(() => {
    if (isLoading) return;

    const savedScroll = window.sessionStorage.getItem(`course-content-scroll-${courseId}`);
    if (!savedScroll) return;

    const scrollY = Number(savedScroll);
    if (!Number.isFinite(scrollY) || scrollY <= 0) return;

    let restoreTimer: number | undefined;
    const restorePosition = () => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
      restoreTimer = window.setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
      }, 180);
    };

    const animationFrame = window.requestAnimationFrame(restorePosition);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (restoreTimer) window.clearTimeout(restoreTimer);
    };
  }, [courseId, isLoading, modules.length]);

  function rememberContentListPosition() {
    window.sessionStorage.setItem(
      `course-content-scroll-${courseId}`,
      String(window.scrollY),
    );
  }

  const totalItems = modules.reduce((n, m) => n + m.contentItems.length, 0);
  const doneItems = modules.reduce(
    (n, m) => n + m.contentItems.filter((i) => i.progressStatus === "COMPLETED").length,
    0,
  );
  const requiredItems = modules.reduce(
    (n, m) => n + m.contentItems.filter((i) => i.isRequired).length,
    0,
  );
  const doneRequired = modules.reduce(
    (n, m) =>
      n + m.contentItems.filter((i) => i.isRequired && i.progressStatus === "COMPLETED").length,
    0,
  );
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  const reqPct = requiredItems > 0 ? Math.round((doneRequired / requiredItems) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (modules.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No content yet"
        description="Your lecturer hasn't published any content for this course."
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Course progress strip ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/85 dark:bg-slate-800/75 p-4 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 ring-primary/10 backdrop-blur-xl sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <ListOrdered className="h-3.5 w-3.5" aria-hidden />
              Course map
            </p>
            <p className="mt-1.5 text-sm font-semibold">
              <span className="tabular-nums">{doneItems}</span> of{" "}
              <span className="tabular-nums">{totalItems}</span> lessons completed
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {requiredItems > 0 ? (
                <>
                  <span className="font-semibold text-foreground tabular-nums">{doneRequired}</span> of{" "}
                  <span className="tabular-nums">{requiredItems}</span> required done
                </>
              ) : (
                "No required lessons in this course."
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full bg-success" />
              Done
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full bg-info" />
              In progress
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span aria-hidden className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              Not started
            </span>
          </div>
        </div>

        <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary))_0%,hsl(215_90%_60%)_100%)] transition-[width] duration-500"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Course content completion"
          />
        </div>
        {requiredItems > 0 && (
          <div className="bg-muted mt-1.5 h-1 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-warning/70 transition-[width] duration-500"
              style={{ width: `${reqPct}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={reqPct}
              aria-label="Required lessons completion"
            />
          </div>
        )}
      </section>

      {/* ── Modules ───────────────────────────────────────────────────── */}
      {modules.map((module) => {
        const moduleTotal = module.contentItems.length;
        const moduleDone = module.contentItems.filter(
          (i) => i.progressStatus === "COMPLETED",
        ).length;
        const modulePct = moduleTotal > 0 ? Math.round((moduleDone / moduleTotal) * 100) : 0;

        return (
          <section
            key={module.id}
            className="overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-white/85 dark:bg-slate-800/75 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 ring-primary/10 backdrop-blur-xl"
          >
            {/* Module header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold tabular-nums ring-1 ring-primary/20">
                  {String(module.position).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-[0.2em]">
                    Module {module.position} · {moduleTotal} {moduleTotal === 1 ? "item" : "items"}
                  </p>
                  <h3 className="truncate text-sm font-semibold leading-5">{module.title}</h3>
                  {module.description && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[11px]">
                      {module.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className="text-muted-foreground text-[10px] font-semibold tabular-nums">
                  {moduleDone}/{moduleTotal} done
                </span>
                <div className="bg-muted h-1.5 w-20 overflow-hidden rounded-full sm:w-28">
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${modulePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <ol className="divide-border/70 divide-y">
              {module.contentItems.map((item, index) => {
                const Icon = TYPE_ICON[item.contentType] ?? FileText;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/courses/${courseId}/content/${item.id}`}
                      onPointerDown={rememberContentListPosition}
                      onClick={rememberContentListPosition}
                      className="group hover:bg-primary/[0.04] flex items-center gap-3 px-4 py-3 transition-colors sm:px-5"
                    >
                      {/* index */}
                      <span className="text-muted-foreground/70 hidden w-5 shrink-0 text-[10px] font-semibold tabular-nums sm:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {/* type chip */}
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                          TYPE_STYLE[item.contentType],
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {/* title + meta */}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium leading-5 group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                        <span className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em]">
                          {item.contentType}
                          {item.isRequired && (
                            <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-warning ring-1 ring-warning/25">
                              Required
                            </span>
                          )}
                        </span>
                      </span>
                      {/* status */}
                      <span className="flex shrink-0 items-center gap-2">
                        <ProgressOrb status={item.progressStatus} />
                        <ChevronRight
                          className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}

              {module.contentItems.length === 0 && (
                <li className="text-muted-foreground px-5 py-6 text-center text-sm">
                  No items in this module yet.
                </li>
              )}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function ProgressOrb({ status }: { status: ProgressStatus }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="h-5 w-5 text-success" aria-label="Completed" />;
  }
  if (status === "IN_PROGRESS") {
    return <PlayCircle className="h-5 w-5 text-info" aria-label="In progress" />;
  }
  return <Circle className="h-5 w-5 text-muted-foreground/40" aria-label="Not started" />;
}
