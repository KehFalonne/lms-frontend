import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { GradeBadge } from "./grade-badge";
import { cn } from "@/lib/utils/cn";
import type { CourseFinalGrade } from "../types/grading.types";

const TILES = [
  "bg-primary/10 text-primary ring-primary/20",
  "bg-info/10 text-info ring-info/20",
  "bg-success/10 text-success ring-success/20",
  "bg-warning/10 text-warning ring-warning/25",
];

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/**
 * Per-course final grade row — monogram tile, category chips, tinted letter.
 */
export function FinalGradeCard({ grade }: { grade: CourseFinalGrade }) {
  const pct = Number(grade.percentage);
  const cue = hashCode(grade.courseCode || grade.courseTitle) % TILES.length;

  return (
    <Link
      href={`/courses/${grade.courseOfferingId}/grades`}
      className="group focus-visible:ring-primary/50 block rounded-2xl outline-none focus-visible:ring-2"
    >
      <article className="ring-primary/10 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/85 p-3.5 ring-1 backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_28px_56px_-28px_hsl(222_47%_22%/0.6)] sm:gap-4 sm:p-4 dark:border-white/10 dark:bg-slate-800/75">
        {/* Course monogram */}
        <span
          className={cn(
            "course-code flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold tracking-wide uppercase ring-1 sm:h-16 sm:w-16 sm:text-[11px]",
            TILES[cue]
          )}
        >
          {grade.courseCode.split(" ")[0]}
        </span>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="course-code-badge bg-primary/10 text-primary ring-primary/15 inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase ring-1">
              {grade.courseCode}
            </span>
            <span className="text-muted-foreground inline-flex items-center text-[8px] font-semibold tracking-[0.16em] uppercase">
              {grade.semester}
            </span>
          </div>
          <h3 className="mt-1 line-clamp-1 text-sm leading-5 font-semibold">
            {grade.courseTitle}
          </h3>

          {grade.categories.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {grade.categories.slice(0, 3).map((c) => (
                <span
                  key={c.category}
                  className="text-muted-foreground bg-muted/60 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-medium tabular-nums"
                >
                  <span className="text-foreground font-semibold">
                    {Number(c.average).toFixed(0)}%
                  </span>
                  {c.category}
                </span>
              ))}
              {grade.categories.length > 3 && (
                <span className="text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-medium">
                  +{grade.categories.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right rail — score */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-2xl leading-7 font-semibold tracking-tight tabular-nums">
              {pct.toFixed(1)}
              <span className="text-muted-foreground text-sm font-medium">%</span>
            </p>
            <div className="mt-1 flex justify-end">
              <GradeBadge letter={grade.letterGrade} size="sm" />
            </div>
          </div>
          <ChevronRight
            className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}
