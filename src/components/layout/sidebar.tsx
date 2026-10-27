"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GraduationCap, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { getNavItems } from "@/lib/constants/routes";
import { useAuthStore } from "@/stores/auth.store";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const items = getNavItems(user?.roles ?? []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  const content = (
    <>
      <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-5">
        <Link
          href={user ? getNavItems(user.roles)[0].href : "/"}
          className="flex items-center gap-2"
        >
          <GraduationCap className="text-primary h-6 w-6" aria-hidden />
          <span className="font-semibold tracking-tight">GU-LMS</span>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="pb-safe flex-1 overflow-y-auto p-3" aria-label="Main navigation">
        <ul className="space-y-1">
          {items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-border text-muted-foreground border-t p-4 text-xs">
        GU-LMS · Gracious University
      </div>
    </>
  );

  return (
    <>
      <aside className="border-border bg-background hidden h-screen w-60 shrink-0 flex-col border-r md:flex">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="animate-slide-in bg-background absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col shadow-xl"
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
