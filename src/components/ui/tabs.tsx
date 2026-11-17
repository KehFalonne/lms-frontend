"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export interface TabDef {
  label: string;
  href: string;
  exact?: boolean;
}

interface TabsProps {
  tabs: TabDef[];
  className?: string;
}

/**
 * Segmented pill control — quiet track, elevated active segment.
 * Horizontally scrollable on small screens.
 */
export function Tabs({ tabs, className }: TabsProps) {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Course sections"
      className={cn(
        "scrollbar-none inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/50 p-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "focus-visible:ring-primary/50 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium outline-none transition-all duration-200 focus-visible:ring-2",
              active
                ? "bg-background text-primary shadow-[0_1px_2px_hsl(222_47%_11%/0.08)] ring-1 ring-border/70"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
