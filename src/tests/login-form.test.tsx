import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/features/auth/api/auth.api", () => ({
  login: vi.fn(),
  me: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

import { LoginForm } from "@/features/auth/components/login-form";
import * as authApi from "@/features/auth/api/auth.api";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders identifier and password fields", () => {
    renderWithProviders(<LoginForm />);
    expect(
      screen.getByLabelText(/university id, matricule, or email/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/enter your university id, matricule, or email/i)
      ).toBeInTheDocument();
    });
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("calls login API with credentials", async () => {
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      message: "Login successful",
      data: {
        access: "a",
        refresh: "r",
        user: {
          id: "1",
          universityId: "GU2026001",
          email: "john@gu.edu",
          firstName: "John",
          middleName: "",
          lastName: "Doe",
          avatar: "",
          roles: ["STUDENT"],
        },
      },
    });
    (authApi.me as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      message: "Success",
      data: {
        id: "1",
        universityId: "GU2026001",
        email: "john@gu.edu",
        firstName: "John",
        middleName: "",
        lastName: "Doe",
        fullName: "John Doe",
        phone: "",
        avatar: "",
        status: "ACTIVE",
        isStaff: false,
        isActive: true,
        isSuperuser: false,
        roles: ["STUDENT"],
        permissions: [],
        studentProfile: null,
        staffProfile: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    });

    renderWithProviders(<LoginForm />);
    await userEvent.type(
      screen.getByLabelText(/university id, matricule, or email/i),
      "GU2026001"
    );
    await userEvent.type(screen.getByLabelText(/password/i), "Student1234!");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        identifier: "GU2026001",
        password: "Student1234!",
      });
    });
  });

  it("shows server error on invalid credentials", async () => {
    (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          success: false,
          statusCode: 400,
          message: "Invalid credentials.",
          errors: {},
        },
      },
    });

    renderWithProviders(<LoginForm />);
    await userEvent.type(
      screen.getByLabelText(/university id, matricule, or email/i),
      "GU2026001"
    );
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
