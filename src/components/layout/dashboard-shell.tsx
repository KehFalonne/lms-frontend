"use client";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { status } = useAuth();

    const showChrome = status === "authenticated";

    return (
        <div className="bg-surface flex min-h-screen">
            {showChrome && (
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            )}
            <div className="flex flex-1 flex-col">
                {showChrome && <Topbar onMenuClick={() => setMobileOpen(true)} />}
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
