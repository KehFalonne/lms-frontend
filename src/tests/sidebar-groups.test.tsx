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

describe("Sidebar admin groups", () => {
  beforeEach(() => {
    pathname.current = "/admin/dashboard";
    useAuthStore.setState({ user: adminUser, status: "authenticated" });
  });

  it("renders group headers with children collapsed", () => {
    render(<Sidebar />);

    const usersGroup = screen.getByRole("button", { name: /Users & Access/i });
    const academicGroup = screen.getByRole("button", { name: /Academic Management/i });
    const operationsGroup = screen.getByRole("button", { name: /Operations & Reports/i });
    const systemGroup = screen.getByRole("button", { name: /System/i });

    expect(usersGroup).toHaveAttribute("aria-expanded", "false");
    expect(academicGroup).toHaveAttribute("aria-expanded", "false");
    expect(operationsGroup).toHaveAttribute("aria-expanded", "false");
    expect(systemGroup).toHaveAttribute("aria-expanded", "false");

    expect(screen.getByRole("link", { name: "Faculties" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Audit Logs" })).toBeInTheDocument();
  });

  it("expands and collapses groups on click", async () => {
    render(<Sidebar />);

    const academicGroup = screen.getByRole("button", { name: /Academic Management/i });
    await userEvent.click(academicGroup);
    expect(academicGroup).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Semesters" })).toBeInTheDocument();

    await userEvent.click(academicGroup);
    expect(academicGroup).toHaveAttribute("aria-expanded", "false");
  });

  it("auto-opens the group containing the active page", () => {
    pathname.current = "/admin/courses";
    render(<Sidebar />);

    const academicGroup = screen.getByRole("button", { name: /Academic Management/i });
    expect(academicGroup).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
