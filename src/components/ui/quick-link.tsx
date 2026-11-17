import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Compact dashboard shortcut tile — tinted icon chip with hover lift,
 * used by the student and lecturer workspace quick-link grids.
 */
export function QuickLink({
  href,
  label,
  icon: Icon,
  accent,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group border-border/60 hover:border-primary/25 focus-visible:ring-primary/40 relative flex flex-col items-center gap-2 rounded-xl border bg-white/60 px-2 py-4 text-center transition-[transform,box-shadow,border-color] duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_hsl(222_47%_22%/0.5)] focus-visible:ring-2 focus-visible:outline-none dark:bg-slate-800/60"
    >
      <ArrowUpRight
        aria-hidden
        className="text-muted-foreground/0 group-hover:text-primary absolute top-2 right-2 h-3.5 w-3.5 transition-all duration-200"
      />
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110",
          accent
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-[11px] leading-4 font-medium">{label}</span>
    </Link>
  );
}
