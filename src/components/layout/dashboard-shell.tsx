"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getFullscreenElement,
  subscribeToFullscreenChange,
} from "@/lib/utils/fullscreen";

const SIDEBAR_AUTO_HIDE_KEY = "gu-lms.sidebar.auto-hide";
const SIDEBAR_COLLAPSED_KEY = "gu-lms.sidebar.collapsed";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarAutoHide, setSidebarAutoHide] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { status, loadSession } = useAuth();

  const showChrome = status === "authenticated";

  // On a hard refresh the persisted status resets to "unknown" and only
  // AuthGate-wrapped pages call loadSession — bootstrap it here so the
  // sidebar/topbar come back on every page under the shell.
  useEffect(() => {
    if (status === "unknown") loadSession();
  }, [status, loadSession]);

  useEffect(() => {
    setSidebarAutoHide(window.localStorage.getItem(SIDEBAR_AUTO_HIDE_KEY) === "true");
    setSidebarCollapsed(
      window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
    );

    const onFullscreenChange = () => {
      const active = Boolean(getFullscreenElement());
      setIsFullscreen(active);
    };

    onFullscreenChange();
    return subscribeToFullscreenChange(onFullscreenChange);
  }, []);

  const toggleSidebarCollapsed = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
  };

  return (
    <div className="bg-surface flex min-h-screen min-w-0">
      {showChrome && (
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          autoHide={sidebarAutoHide}
          fullscreen={isFullscreen}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {showChrome && <Topbar onMenuClick={() => setMobileOpen(true)} />}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
