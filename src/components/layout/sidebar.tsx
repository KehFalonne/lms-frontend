"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandMark } from "./brand-mark";
import { cn } from "@/lib/utils/cn";
import {
  bestMatchNavItem,
  getNavItems,
  workspaceFromPathname,
  type NavItem,
} from "@/lib/constants/routes";
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
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  mobileOpen = false,
  onClose,
  autoHide = false,
  fullscreen = false,
  collapsed: collapsedProp = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const items = getNavItems(
    user?.roles ?? [],
    Boolean(user?.staffProfile),
    workspaceFromPathname(pathname),
    Boolean(user?.studentProfile),
    Boolean(user?.isStaff),
    user?.permissions ?? [],
    Boolean(user?.isSuperuser)
  );
  const homeHref = user ? (items[0]?.href ?? "/") : "/";
  const activeHref = bestMatchNavItem(items, pathname)?.href ?? null;
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collapsed =
    !mobileOpen && (autoHide ? !isHovered && !isPinned : collapsedProp);
  const shouldHide = fullscreen || browserFullscreen;

  const handleToggleCollapse = () => {
    if (autoHide) {
      setIsPinned((pinned) => !pinned);
      return;
    }
    onToggleCollapsed?.();
  };

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
      {/* Brand lockup */}
      <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4">
        <Link
          href={homeHref}
          className="focus-visible:ring-primary/50 flex items-center gap-2.5 rounded-lg pr-1 outline-none focus-visible:ring-2"
          aria-label="GU-LMS — home"
        >
          <BrandMark size="md" />
          <span
            className={cn(
              "flex flex-col overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
              collapsed
                ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
                : "max-w-[11rem] translate-x-0 opacity-100"
            )}
          >
            <span className="text-[15px] leading-5 font-semibold tracking-tight">
              GU<span className="text-primary">-</span>LMS
            </span>
            <span className="text-muted-foreground text-[9px] font-medium tracking-[0.2em] uppercase">
              Gracious University
            </span>
          </span>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-xl md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "pb-safe min-h-0 flex-1 scrollbar-none overflow-y-auto overscroll-contain p-3 md:min-h-0 md:flex-none md:overflow-visible md:overscroll-auto",
          collapsed && "px-2"
        )}
        data-scroll-region
        aria-label="Main navigation"
      >
        <p
          aria-hidden
          className={cn(
            "text-muted-foreground/70 mb-2 px-3 text-[9px] font-semibold tracking-[0.22em] uppercase transition-opacity duration-200",
            collapsed && "opacity-0"
          )}
        >
          Navigate
        </p>

        <ul className="space-y-1">
          {items.map((item) =>
            item.children?.length ? (
              <NavGroup
                key={item.label}
                item={item}
                activeHref={activeHref}
                collapsed={collapsed}
                onClose={onClose}
                onExpand={() => {
                  if (autoHide) {
                    setIsPinned(true);
                  } else {
                    onToggleCollapsed?.();
                  }
                }}
              />
            ) : (
              <NavLink
                key={item.href ?? item.label}
                item={item}
                active={item.href === activeHref}
                collapsed={collapsed}
                onClose={onClose}
              />
            )
          )}
        </ul>
      </nav>

      {/* Footer — security note + collapse toggle */}
      <div
        className={cn(
          "border-border mt-auto flex shrink-0 items-center gap-2.5 border-t p-3.5 transition-[padding] duration-300 ease-out",
          collapsed && "flex-col justify-center gap-2 p-2.5"
        )}
      >
        <span className="bg-success/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <ShieldCheck className="text-success h-4 w-4" aria-hidden />
        </span>
        <span
          className={cn(
            "flex max-w-[12rem] flex-col overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
            collapsed ? "hidden" : "translate-x-0 opacity-100"
          )}
        >
          <span className="text-[11px] leading-4 font-semibold">Secured session</span>
          <span className="text-muted-foreground text-[9px] leading-4">
            Gracious University · GU-LMS
          </span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className={cn(
            "hidden h-9 w-9 rounded-xl md:inline-flex",
            collapsed ? "shrink-0" : "ml-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronsLeft className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div
        className={cn(
          "relative min-h-screen shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          shouldHide
            ? "hidden"
            : collapsed
              ? "hidden w-16 md:block"
              : "hidden w-64 md:block"
        )}
      >
        <aside
          className={cn(
            "border-border bg-background fixed inset-y-0 left-0 z-40 flex h-screen max-h-screen flex-col overflow-hidden border-r transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            collapsed
              ? "w-16"
              : autoHide
                ? "w-64 shadow-[10px_0_36px_-20px_hsl(221_83%_53%/0.5)]"
                : "w-64"
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
            className="animate-fade-in absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="animate-slide-in bg-background pb-safe absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col overflow-hidden shadow-[0_24px_60px_-24px_hsl(222_47%_22%/0.55)]"
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

const NAV_LINK_BASE =
  "group focus-visible:ring-primary/50 relative flex items-center gap-3 rounded-xl text-sm font-medium transition-[background-color,color,box-shadow] duration-200 outline-none focus-visible:ring-2";

function navLinkClasses(active: boolean, collapsed: boolean): string {
  return cn(
    NAV_LINK_BASE,
    collapsed ? "justify-center gap-0 px-0" : "px-2.5",
    active
      ? "bg-primary/[0.09] text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.18)]"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  );
}

function ActiveRail({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full transition-opacity duration-200",
        active ? "opacity-100" : "opacity-0"
      )}
    />
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onClose,
  nested = false,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClose?: () => void;
  nested?: boolean;
}) {
  if (!item.href) return null;
  const { href, label, icon: Icon } = item;

  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        title={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          navLinkClasses(active, collapsed),
          nested
            ? cn("min-h-10 py-1.5 text-[13px]", !active && "text-foreground/80")
            : "min-h-11 py-2"
        )}
      >
        <ActiveRail active={active} />
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            nested ? "h-7 w-7" : "h-8 w-8",
            active
              ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_hsl(221_83%_53%/0.7)]"
              : "text-muted-foreground group-hover:bg-background group-hover:text-primary group-hover:shadow-sm"
          )}
        >
          <Icon className={nested ? "h-4 w-4" : "h-[18px] w-[18px]"} aria-hidden />
        </span>
        <span
          className={cn(
            "max-w-[12rem] min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
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
}

function NavGroup({
  item,
  activeHref,
  collapsed,
  onClose,
  onExpand,
}: {
  item: NavItem;
  activeHref: string | null;
  collapsed: boolean;
  onClose?: () => void;
  onExpand: () => void;
}) {
  const children = item.children ?? [];
  const hasActiveChild = children.some((child) => child.href === activeHref);
  const [open, setOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  const { label, icon: Icon } = item;

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (collapsed) {
            onExpand();
            setOpen(true);
          } else {
            setOpen((current) => !current);
          }
        }}
        title={collapsed ? label : undefined}
        aria-expanded={open}
        className={cn(navLinkClasses(hasActiveChild, collapsed), "min-h-11 w-full py-2")}
      >
        <ActiveRail active={hasActiveChild} />
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            hasActiveChild
              ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_hsl(221_83%_53%/0.7)]"
              : "text-muted-foreground group-hover:bg-background group-hover:text-primary group-hover:shadow-sm"
          )}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span
          className={cn(
            "max-w-[12rem] min-w-0 overflow-hidden text-[13px] whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out",
            collapsed
              ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
              : "translate-x-0 opacity-100"
          )}
        >
          {label}
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200",
            collapsed ? "hidden" : "ml-auto",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          open && !collapsed ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="border-border/70 bg-muted/20 ml-5 space-y-0.5 rounded-r-xl border-l py-1.5 pl-2">
            {children.map((child) => (
              <NavLink
                key={child.href ?? child.label}
                item={child}
                nested
                active={child.href === activeHref}
                collapsed={false}
                onClose={onClose}
              />
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
