"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, User as UserIcon } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { primaryRoleLabel } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <header className="border-border bg-background/95 pt-safe sticky top-0 z-30 flex h-14 items-center justify-between border-b px-3 backdrop-blur sm:h-16 sm:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight md:hidden"
        >
          GU-LMS
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <NotificationBell />

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "hover:bg-surface flex h-10 items-center gap-2 rounded-md px-1.5 transition-colors sm:px-2"
            )}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <Avatar
              size="sm"
              fallback={initials}
              src={user?.avatar || null}
              alt={user ? `${user.firstName} ${user.lastName}` : ""}
            />
            <div className="hidden text-left sm:block">
              <p className="text-sm leading-tight font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-muted-foreground text-xs">
                {primaryRoleLabel(user?.roles)}
              </p>
            </div>
          </button>

          {open && (
            <div
              role="menu"
              className="animate-slide-in border-border bg-background absolute top-full right-0 z-40 mt-1 w-56 rounded-md border p-1 shadow-lg"
            >
              <div className="border-border border-b px-3 py-2 sm:hidden">
                <p className="text-sm leading-tight font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {primaryRoleLabel(user?.roles)}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="hover:bg-surface flex min-h-10 items-center gap-2 rounded-sm px-3 py-2 text-sm"
                role="menuitem"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
              <div className="bg-border my-1 h-px" />
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="text-danger hover:bg-danger/10 flex min-h-10 w-full items-center gap-2 rounded-sm px-3 py-2 text-sm"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
