import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pathname = { current: "/admin/dashboard" };

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser } from "@/features/auth/types/auth.types";

const adminUser = {
  id: "u1",
  universityId: "GU-001",
  email: "admin@gu.edu",
  firstName: "Ada",
  middleName: "",
  lastName: "Admin",
  fullName: "Ada Admin",
  phone: "",
  avatar: "",
  status: "ACTIVE",
  isStaff: false,
  isActive: true,
  isSuperuser: true,
  roles: ["SUPER_ADMIN"],
  permissions: [],
  studentProfile: null,
  staffProfile: null,
  createdAt: "",
  updatedAt: "",
} as unknown as AuthUser;

describe("Sidebar collapse", () => {
  beforeEach(() => {
    pathname.current = "/admin/dashboard";
    useAuthStore.setState({ user: adminUser, status: "authenticated" });
  });

  it("shows a collapse toggle and reports the collapsed state", () => {
    const onToggle = vi.fn();
    const { rerender } = render(<Sidebar onToggleCollapsed={onToggle} />);

    expect(
      screen.getByRole("button", { name: "Collapse sidebar" })
    ).toBeInTheDocument();

    rerender(<Sidebar collapsed onToggleCollapsed={onToggle} />);
    expect(
      screen.getByRole("button", { name: "Expand sidebar" })
    ).toBeInTheDocument();
  });

  it("calls onToggleCollapsed when the toggle is clicked", async () => {
    const onToggle = vi.fn();
    render(<Sidebar onToggleCollapsed={onToggle} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Collapse sidebar" })
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("adds tooltips to nav links when collapsed", () => {
    render(<Sidebar collapsed onToggleCollapsed={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "title",
      "Dashboard"
    );
  });

  it("expands the sidebar when a group icon is clicked while collapsed", async () => {
    const onToggle = vi.fn();
    render(<Sidebar collapsed onToggleCollapsed={onToggle} />);

    const usersGroup = screen.getByRole("button", { name: /Users & Access/i });
    await userEvent.click(usersGroup);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(usersGroup).toHaveAttribute("aria-expanded", "true");
  });
});
