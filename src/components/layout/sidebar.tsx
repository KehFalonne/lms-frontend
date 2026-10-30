"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GraduationCap, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { getNavItems } from "@/lib/constants/routes";
import { useAuthStore } from "@/stores/auth.store";
import {
  getFullscreenElement,
  subscribeToFullscreenChange,
} from "@/lib/utils/fullscreen";
import {
  acquireBodyScrollLock,
  releaseBodyScrollLock,
} from "@/lib/utils/body-scroll-lock";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  autoHide?: boolean;
  fullscreen?: boolean;
}

export function Sidebar({
  mobileOpen = false,
  onClose,
  autoHide = false,
  fullscreen = false,
}: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const items = getNavItems(user?.roles ?? []);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collapsed = autoHide && !isHovered && !isPinned && !mobileOpen;
  const shouldHide = fullscreen || browserFullscreen;

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handlePointerEnter = () => {
    if (!autoHide) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setIsHovered(true), 60);
  };

  const handlePointerLeave = () => {
    if (!autoHide) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setIsHovered(false), 180);
  };

  useEffect(() => clearHoverTimer, []);

  useEffect(() => {
    const updateFullscreen = () => {
      setBrowserFullscreen(Boolean(getFullscreenElement()));
    };

    updateFullscreen();
    return subscribeToFullscreenChange(updateFullscreen);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    acquireBodyScrollLock();
    return () => {
      releaseBodyScrollLock();
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

  useEffect(() => {
    if (!autoHide || !isPinned) return;

    const onDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const panel = document.querySelector("[data-sidebar-panel]");
      if (panel && !panel.contains(target)) {
        setIsPinned(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPinned(false);
    };

    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [autoHide, isPinned]);

  const content = (
    <>
      <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-5">
        <Link
          href={user ? getNavItems(user.roles)[0].href : "/"}
          className="flex items-center gap-2"
        >
          <GraduationCap className="text-primary h-6 w-6" aria-hidden />
          <span
            className={cn(
              "max-w-[8rem] overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
              collapsed
                ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
                : "translate-x-0 opacity-100"
            )}
          >
            GU-LMS
          </span>
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

      <nav
        className={cn(
          "pb-safe min-h-0 flex-1 scrollbar-none overflow-y-auto overscroll-contain p-3 md:min-h-0 md:flex-none md:overflow-visible md:overscroll-auto",
          collapsed && "px-2"
        )}
        data-scroll-region
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
          {items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "focus-visible:ring-primary/50 flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2",
                    collapsed && "justify-center gap-0 px-0",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  )}
                  title={collapsed ? label : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      "max-w-[12rem] overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
                      collapsed
                        ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
                        : "translate-x-0 opacity-100"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cn(
          "border-border text-muted-foreground mt-auto flex shrink-0 items-center gap-2 border-t p-4 text-xs transition-[padding] duration-300 ease-out",
          collapsed && "justify-center p-2"
        )}
      >
        <GraduationCap className="text-primary h-5 w-5 shrink-0" aria-hidden />
        <span
          className={cn(
            "inline-block max-w-[16rem] overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
            collapsed
              ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
              : "translate-x-0 opacity-100"
          )}
        >
          GU-LMS · Gracious University
        </span>
      </div>
    </>
  );

  return (
    <>
      <div
        className={cn(
          "relative min-h-screen shrink-0",
          shouldHide
            ? "hidden"
            : autoHide
              ? "hidden w-16 md:block"
              : "hidden w-60 md:block"
        )}
      >
        <aside
          className={cn(
            "border-border bg-background fixed inset-y-0 left-0 z-40 flex h-screen max-h-screen flex-col overflow-hidden border-r transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            autoHide
              ? collapsed
                ? "w-16"
                : "w-60 shadow-[8px_0_24px_-18px_rgba(15,23,42,0.45)]"
              : "w-60"
          )}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={(event) => {
            if (!autoHide) return;
            const target = event.target as HTMLElement;
            if (target.closest("a, button")) return;
            setIsPinned((current) => !current);
          }}
          data-sidebar-panel
        >
          {content}
        </aside>
      </div>

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
