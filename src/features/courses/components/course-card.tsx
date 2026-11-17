import Link from "next/link";
import { ArrowRight, CalendarDays, Layers, Signal, Users } from "lucide-react";

import type { CourseOfferingSummary } from "../types/course.types";
import { cn } from "@/lib/utils/cn";

const TILES = [
  "bg-primary/10 text-primary ring-primary/20",
  "bg-info/10 text-info ring-info/20",
  "bg-success/10 text-success ring-success/20",
  "bg-warning/10 text-warning ring-warning/25",
];

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Enrollment card — frosted surface, monogram tile, tracked micro-line,
 * hover lift. Hue is stable per course code.
 */
export function CourseCard({ offering }: { offering: CourseOfferingSummary }) {
  const cue = hashCode(offering.course.code) % TILES.length;

  return (
    <Link
      href={`/courses/${offering.id}`}
      className="group focus-visible:ring-primary/50 rounded-2xl outline-none focus-visible:ring-2"
    >
      <article className="ring-primary/10 flex h-full flex-col rounded-2xl border border-white/60 bg-white/85 p-5 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_34px_64px_-28px_hsl(222_47%_22%/0.6)] dark:border-white/10 dark:bg-slate-800/75">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "course-code flex min-h-12 max-w-24 min-w-12 items-center justify-center rounded-xl px-1.5 py-1 text-center text-[11px] leading-3 font-bold tracking-wide uppercase ring-1",
              TILES[cue]
            )}
          >
            {offering.course.code.split(" ")[0]}
          </span>
          <span className="bg-muted/60 text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase">
            <Signal className="h-3 w-3" aria-hidden />
            Level {offering.course.level}
          </span>
        </div>

        {/* Identity */}
        <h3 className="mt-4 line-clamp-2 min-h-12 text-[15px] leading-6 font-semibold">
          {offering.course.title}
        </h3>
        <p className="text-muted-foreground mt-1 line-clamp-1 text-[11px] font-medium">
          {offering.programmes?.length
            ? offering.programmes.map((p) => p.name).join(" · ")
            : offering.programme.name}
        </p>

        {/* Micro facts */}
        <div className="text-muted-foreground border-border/60 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t pt-3 text-[10px] font-medium tracking-wide uppercase">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" aria-hidden />
            {offering.semester.name}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3 w-3" aria-hidden />
            {offering.course.credits} cr
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden />
            Sec {offering.section}
          </span>
        </div>

        {/* Footer CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="course-code-badge bg-primary/10 text-primary ring-primary/15 inline-flex max-w-40 min-w-0 items-center rounded-full px-2.5 py-1 text-[10px] leading-3 font-bold tracking-widest uppercase ring-1">
            {offering.course.code}
          </span>
          <span className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold transition-transform duration-200 group-hover:translate-x-0.5">
            Open course
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </article>
    </Link>
  );
}
