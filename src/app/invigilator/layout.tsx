import { DashboardShell } from "@/components/layout/dashboard-shell";

export const instant = false;

export default function InvigilatorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
