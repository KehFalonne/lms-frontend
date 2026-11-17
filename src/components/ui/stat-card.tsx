import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { TONE_CHIP } from "@/components/ui/glass-card";

/**
 * KPI card used across workspace dashboards — tone-tinted icon chip,
 * big tabular value, optional circular progress meter and urgent accent.
 */
export function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  caption,
  progress,
  urgent = false,
  pulse = false,
}: {
  icon: LucideIcon;
  tone: keyof typeof TONE_CHIP;
  label: string;
  value: string | number;
  caption: string;
  progress?: number | null;
  urgent?: boolean;
  pulse?: boolean;
}) {
  const C = 2 * Math.PI * 15.5;
  return (
    <div
      className={cn(
        "group ring-primary/10 relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 p-4 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 sm:p-5 dark:border-white/10 dark:bg-slate-800/75",
        urgent && "border-warning/25"
      )}
    >
      {/* ambient corner wash per tone */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl",
          tone === "primary" && "bg-primary/10",
          tone === "info" && "bg-info/10",
          tone === "warning" && "bg-warning/[0.07]",
          tone === "success" && "bg-success/10"
        )}
      />
      {/* urgent — slim accent bar, not a full ring */}
      {urgent && (
        <div
          aria-hidden
          className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-[linear-gradient(90deg,hsl(var(--warning))_0%,hsl(var(--warning)/0.45)_55%,transparent_100%)]"
        />
      )}
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.18em] uppercase sm:text-[10px]">
            {label}
          </p>
          <span
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition-transform duration-200 group-hover:scale-110",
              TONE_CHIP[tone]
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {pulse && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="bg-danger absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-danger relative inline-flex h-2.5 w-2.5 rounded-full" />
              </span>
            )}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {value}
            </p>
            <p className="text-muted-foreground mt-1 truncate text-[9px] sm:text-[10px]">
              {caption}
            </p>
          </div>
          {progress != null && (
            <svg
              viewBox="0 0 44 44"
              className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"
              role="presentation"
            >
              <circle
                cx="22"
                cy="22"
                r="15.5"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="5.5"
              />
              <circle
                cx="22"
                cy="22"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - Math.min(100, Math.max(0, progress)) / 100)}
                transform="rotate(-90 22 22)"
                className={cn(
                  tone === "primary" && "text-primary",
                  tone === "info" && "text-info",
                  tone === "warning" && "text-warning",
                  tone === "success" && "text-success"
                )}
              />
              <text
                x="22"
                y="26"
                textAnchor="middle"
                className="fill-foreground text-[10px] font-bold tabular-nums"
              >
                {progress}
              </text>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
