import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);

const now = new Date().toISOString();

vi.mock("@/features/lecturer/hooks/useLecturer", () => ({
  useLecturerAnalytics: () => ({
    data: {
      data: {
        totals: {
          courseCount: 2,
          enrolledCount: 95,
          submissionRate: 78.5,
          averageGradePct: 66.4,
          assessmentCompletionRate: 82,
          avgContentProgress: 58,
          activeLearners30d: 61,
        },
        courses: [
          {
            id: "co1",
            code: "CSC 101",
            title: "Intro to CS",
            section: "A",
            semester: "First Semester 2026",
            overview: {
              enrolledCount: 45,
              submissionRate: 80,
              averageGradePct: 68.5,
              avgContentProgress: 62,
            },
          },
          {
            id: "co2",
            code: "CSC 201",
            title: "Data Structures",
            section: "B",
            semester: "First Semester 2026",
            overview: {
              enrolledCount: 50,
              submissionRate: 77,
              averageGradePct: 64.3,
              avgContentProgress: 54,
            },
          },
        ],
        gradeDistribution: [
          { bucket: "0-49", count: 3, share: 10 },
          { bucket: "50-59", count: 6, share: 20 },
          { bucket: "60-69", count: 9, share: 30 },
          { bucket: "70-79", count: 8, share: 26.7 },
          { bucket: "80-100", count: 4, share: 13.3 },
        ],
        activityByDay: [{ date: now, count: 15 }],
        recentActivity: [
          {
            id: "e1",
            studentId: "ST1",
            studentName: "Jane Doe",
            eventType: "ASSIGNMENT_SUBMITTED",
            label: "Assignment submitted",
            entityType: "assignment_submission",
            occurredAt: now,
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

import LecturerAnalyticsPage from "@/app/(lecturer)/lecturer/analytics/page";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser } from "@/features/auth/types/auth.types";

const lecturerUser = {
  id: "u1",
  universityId: "GU-002",
  email: "lecturer@gu.edu",
  firstName: "Ada",
  middleName: "",
  lastName: "Lecturer",
  fullName: "Ada Lecturer",
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

describe("Lecturer analytics sidebar page", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: lecturerUser, status: "authenticated" });
  });

  it("renders aggregate stats, course table and panels", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LecturerAnalyticsPage />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByText("Courses taught")).toBeInTheDocument();
    expect(screen.getByText("Enrolled students")).toBeInTheDocument();
    expect(screen.getAllByText("Submission rate").length).toBeGreaterThan(0);
    expect(screen.getByText("Average grade")).toBeInTheDocument();
    expect(screen.getByText("Assessment completion")).toBeInTheDocument();
    expect(screen.getByText("Avg content progress")).toBeInTheDocument();
    expect(screen.getByText("Grade distribution · all courses")).toBeInTheDocument();
    expect(screen.getByText("Activity · last 14 days")).toBeInTheDocument();
    expect(screen.getByText("Courses at a glance")).toBeInTheDocument();
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
  });

  it("links each course row to its course analytics", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LecturerAnalyticsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText("Intro to CS")).toBeInTheDocument();
    expect(screen.getByText("Data Structures")).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /details/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute(
      "href",
      "/lecturer/courses/co1/analytics"
    );
    expect(links[1]).toHaveAttribute(
      "href",
      "/lecturer/courses/co2/analytics"
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });
});
