"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Sun,
  User as UserIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./brand-mark";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  bestMatchNavItem,
  getNavItems,
  getWorkspaceOptions,
  workspaceFromPathname,
  primaryRoleLabel,
  roleBasedLanding,
  type NavItem,
} from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/components/providers/theme-provider";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasStaffProfile = Boolean(user?.staffProfile);
  const isStaff = Boolean(user?.isStaff);
  const navItems = getNavItems(
    user?.roles ?? [],
    hasStaffProfile,
    workspaceFromPathname(pathname),
    Boolean(user?.studentProfile),
    isStaff,
    user?.permissions ?? [],
    Boolean(user?.isSuperuser)
  );
  const workspaces = getWorkspaceOptions(
    user?.roles ?? [],
    hasStaffProfile,
    Boolean(user?.studentProfile),
    isStaff
  );
  const section = bestMatchNavItem(navItems, pathname);
  const SectionIcon = section?.icon;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <header className="border-border pt-safe sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-3 sm:h-16 sm:px-5 lg:px-6">
      {/* Glass backdrop lives on its own layer — a backdrop-filter on the header
          itself would become the containing block for position:fixed children
          (e.g. the notification sheet), breaking their viewport anchoring. */}
      <div
        aria-hidden
        className="bg-background/95 absolute inset-0 -z-10 backdrop-blur"
      />
      {/* Left — mobile menu + brand · desktop section context */}
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile brand */}
        <Link
          href={roleBasedLanding(
            user?.roles ?? [],
            hasStaffProfile,
            Boolean(user?.studentProfile),
            isStaff
          )}
          className="focus-visible:ring-primary/50 flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 md:hidden"
          aria-label="GU-LMS — home"
        >
          <BrandMark size="sm" />
          <span className="text-[15px] font-semibold tracking-tight">
            GU<span className="text-primary">-</span>LMS
          </span>
        </Link>

        {/* Desktop — current section */}
        <div className="hidden min-w-0 items-center gap-2.5 md:flex" aria-live="polite">
          {SectionIcon ? (
            <>
              <span className="bg-primary/[0.08] text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <SectionIcon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-muted-foreground/70 text-[9px] font-semibold tracking-[0.2em] uppercase">
                  GU-LMS
                </p>
                <p className="truncate text-sm leading-4 font-semibold">
                  {section?.label}
                </p>
              </div>
            </>
          ) : (
            <>
              <BrandMark size="sm" />
              <p className="text-sm font-semibold tracking-tight">
                GU<span className="text-primary">-</span>LMS
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right — notifications + account */}
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationBell />

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "hover:bg-surface focus-visible:ring-primary/50 flex h-11 items-center gap-2 rounded-xl px-1.5 transition-colors outline-none focus-visible:ring-2 sm:px-2",
              open && "bg-surface"
            )}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
          >
            <Avatar
              size="sm"
              fallback={initials}
              src={user?.avatar || null}
              alt={user ? `${user.firstName} ${user.lastName}` : ""}
              className="ring-primary/10 ring-1"
            />
            <span className="hidden text-left sm:block">
              <span className="block max-w-40 truncate text-[13px] leading-4 font-semibold">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[10px] font-medium tracking-[0.14em] uppercase">
                {primaryRoleLabel(user?.roles)}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "text-muted-foreground h-4 w-4 transition-transform duration-200",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          {open && (
            <div
              role="menu"
              aria-label="Account"
              className="animate-slide-in border-border bg-background absolute top-full right-0 z-40 mt-2 w-64 rounded-xl border p-1.5 shadow-[0_24px_50px_-24px_hsl(222_47%_22%/0.45)]"
            >
              {/* Identity header */}
              <div className="bg-surface/80 flex items-center gap-3 rounded-lg px-3 py-2.5">
                <Avatar size="md" fallback={initials} src={user?.avatar || null} alt="" />
                <div className="min-w-0">
                  <p className="truncate text-sm leading-5 font-semibold">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className="bg-primary/10 text-primary mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] uppercase">
                    {primaryRoleLabel(user?.roles)}
                  </span>
                </div>
              </div>

              {workspaces.length > 1 && (
                <>
                  <p className="text-muted-foreground px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                    Switch workspace
                  </p>
                  {workspaces.map((workspace) => (
                    <Link
                      key={workspace.href}
                      href={workspace.href}
                      onClick={() => setOpen(false)}
                      role="menuitem"
                      className="hover:bg-surface focus-visible:ring-primary/40 flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    >
                      {workspace.label}
                    </Link>
                  ))}
                </>
              )}

              <div className="border-border mt-1 border-t px-2 pt-2">
                <p className="text-muted-foreground px-1 pb-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Appearance
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <ThemeButton
                    active={theme === "light"}
                    label="Light"
                    icon={Sun}
                    onClick={() => setTheme("light")}
                  />
                  <ThemeButton
                    active={theme === "dark"}
                    label="Dark"
                    icon={Moon}
                    onClick={() => setTheme("dark")}
                  />
                  <ThemeButton
                    active={theme === "system"}
                    label="System"
                    icon={Monitor}
                    onClick={() => setTheme("system")}
                  />
                </div>
              </div>

              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="hover:bg-surface focus-visible:ring-primary/40 mt-1 flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
              >
                <UserIcon className="text-muted-foreground h-4 w-4" aria-hidden />
                View profile
              </Link>

              <div className="bg-border my-1.5 h-px" />

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                role="menuitem"
                className="text-danger hover:bg-danger/10 focus-visible:ring-danger/40 flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ThemeButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Sun;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-9 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-[10px] font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
