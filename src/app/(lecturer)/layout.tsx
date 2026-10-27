import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
