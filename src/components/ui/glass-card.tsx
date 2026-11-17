import type { HTMLAttributes, ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared GU-LMS surface primitives — the "DBMS Week 4" card language:
 * frosted white, hairline primary ring, deep navy shadow, tinted icon chips.
 */
export const TONE_CHIP: Record<string, string> = {
  primary: "bg-primary/10 text-primary ring-primary/20",
  info: "bg-info/10 text-info ring-info/20",
  warning: "bg-warning/10 text-warning ring-warning/25",
  success: "bg-success/10 text-success ring-success/20",
};

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/60 bg-white/85 shadow-[0_28px_60px_-30px_hsl(222_47%_22%/0.55)] ring-1 ring-primary/10 backdrop-blur-md",
        "dark:border-white/10 dark:bg-slate-800/75 dark:shadow-[0_28px_60px_-28px_rgba(0,0,0,0.75)] dark:ring-white/5",
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  icon: Icon,
  tone,
  title,
  right,
}: {
  icon?: typeof BookOpen;
  tone?: keyof typeof TONE_CHIP;
  title: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 pb-3 sm:px-5 sm:pt-5">
      <h2 className="flex min-w-0 items-center gap-2.5 text-[13px] font-semibold leading-5">
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
              tone ? TONE_CHIP[tone] : TONE_CHIP.primary,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <span className="truncate">{title}</span>
      </h2>
      {right}
    </div>
  );
}
