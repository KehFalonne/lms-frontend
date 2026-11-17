import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  usePathname: () => "/lecturer/courses",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/features/auth/api/auth.api", () => ({
  me: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  updateAvatar: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar-stub" />,
}));

vi.mock("@/components/layout/topbar", () => ({
  Topbar: () => <div data-testid="topbar-stub" />,
}));

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuthStore } from "@/stores/auth.store";
import * as authApi from "@/features/auth/api/auth.api";
import type { AuthUser } from "@/features/auth/types/auth.types";

const lecturerUser = {
  id: "u1",
  universityId: "GU-002",
  email: "lecturer@gu.edu",
  firstName: "Kilian",
  middleName: "",
  lastName: "Falonne",
  fullName: "Kilian Falonne",
  phone: "",
  avatar: "",
  status: "ACTIVE",
  isStaff: true,
  isActive: true,
  isSuperuser: false,
  roles: ["LECTURER"],
  permissions: [],
  studentProfile: null,
  staffProfile: { id: "sp1" },
  createdAt: "",
  updatedAt: "",
} as unknown as AuthUser;

const meMock = vi.mocked(authApi.me);

function renderShell(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("DashboardShell session bootstrap", () => {
  beforeEach(() => {
    meMock.mockReset();
    localStorage.clear();
    useAuthStore.setState({ user: null, status: "unknown" });
  });

  it("loads the session and shows chrome when status is unknown after a refresh", async () => {
    localStorage.setItem("access_token", "token");
    meMock.mockResolvedValue({ data: lecturerUser } as never);

    renderShell(
      <DashboardShell>
        <p>Page content</p>
      </DashboardShell>
    );

    await waitFor(() => expect(meMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByTestId("sidebar-stub")).toBeInTheDocument()
    );
    expect(screen.getByTestId("topbar-stub")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("keeps chrome hidden and does not refetch while unauthenticated", () => {
    useAuthStore.setState({ user: null, status: "unauthenticated" });

    renderShell(
      <DashboardShell>
        <p>Page content</p>
      </DashboardShell>
    );

    expect(screen.queryByTestId("sidebar-stub")).not.toBeInTheDocument();
    expect(screen.queryByTestId("topbar-stub")).not.toBeInTheDocument();
    expect(meMock).not.toHaveBeenCalled();
  });
});
