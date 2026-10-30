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

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarAutoHide, setSidebarAutoHide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { status } = useAuth();

  const showChrome = status === "authenticated";

  useEffect(() => {
    setSidebarAutoHide(window.localStorage.getItem(SIDEBAR_AUTO_HIDE_KEY) === "true");

    const onFullscreenChange = () => {
      const active = Boolean(getFullscreenElement());
      setIsFullscreen(active);
    };

    onFullscreenChange();
    return subscribeToFullscreenChange(onFullscreenChange);
  }, []);

  return (
    <div className="bg-surface flex min-h-screen min-w-0">
      {showChrome && (
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          autoHide={sidebarAutoHide}
          fullscreen={isFullscreen}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {showChrome && <Topbar onMenuClick={() => setMobileOpen(true)} />}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
