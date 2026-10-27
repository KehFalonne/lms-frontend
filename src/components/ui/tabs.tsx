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

export function Tabs({ tabs, className }: TabsProps) {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      className={cn(
        "border-border relative flex scrollbar-none items-center gap-1 overflow-x-auto border-b",
        "after:from-background after:pointer-events-none after:absolute after:top-0 after:right-0 after:h-full after:w-8 after:bg-gradient-to-l after:to-transparent",
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
              "relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {active && (
              <span className="bg-primary absolute inset-x-0 -bottom-px h-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
