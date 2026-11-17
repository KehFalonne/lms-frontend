import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const now = new Date().toISOString();

vi.mock("@/features/lecturer/hooks/useLecturer", () => ({
  useLecturerDashboard: () => ({
    data: {
      data: {
        stats: { activeCourses: 3, totalStudents: 120, pendingSubmissions: 7 },
        upcomingAssessments: [
          {
            id: "a1",
            title: "Midterm CA",
            availableFrom: tomorrow,
            courseOfferingId: "co1",
            courseCode: "CSC 101",
          },
        ],
        recentSubmissions: [
          {
            id: "s1",
            studentName: "Jane Doe",
            studentId: "ST1",
            assignmentTitle: "Assignment 1",
            assignmentId: "as1",
            courseOfferingId: "co1",
            courseCode: "CSC 101",
            submittedAt: now,
            isLate: true,
            status: "LATE",
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useMyTeachingCourses: () => ({
    data: {
      data: [
        {
          id: "co1",
          course: { id: "c1", code: "CSC 101", title: "Intro to CS", credits: 3, level: 100 },
          semester: { id: "sm1", name: "First Semester 2026" },
          programme: { id: "p1", name: "Computer Science" },
          section: "A",
          status: "ACTIVE",
          teachingRole: "PRIMARY_INSTRUCTOR",
          canGrade: true,
          canManageContent: true,
          studentCount: 45,
          assignmentCount: 2,
          assessmentCount: 1,
          pendingSubmissions: 5,
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

import LecturerDashboardPage from "@/app/(lecturer)/lecturer/dashboard/page";
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

describe("Lecturer dashboard", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: lecturerUser, status: "authenticated" });
  });

  it("renders hero, stats and workload panels", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <LecturerDashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: /good (morning|afternoon|evening), Ada/i })).toBeInTheDocument();
    expect(screen.getByText("Pending Grading")).toBeInTheDocument();
    expect(screen.getAllByText("7").length).toBeGreaterThan(0);
    expect(screen.getByText("Recent submissions")).toBeInTheDocument();
    expect(screen.getByText("Upcoming assessments")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Late")).toBeInTheDocument();
    expect(screen.getByText("Midterm CA")).toBeInTheDocument();
    expect(screen.getByText("Intro to CS")).toBeInTheDocument();
    expect(
      screen.getAllByText((_, el) => el?.textContent?.includes("45 students") ?? false)
        .length
    ).toBeGreaterThan(0);
    expect(screen.getByText("Quick links")).toBeInTheDocument();
  });

  it("links submissions to the submissions page", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <LecturerDashboardPage />
      </QueryClientProvider>
    );

    const link = screen.getByRole("link", { name: /Jane Doe/i });
    expect(link).toHaveAttribute(
      "href",
      "/lecturer/courses/co1/assignments/as1/submissions"
    );
  });
});
