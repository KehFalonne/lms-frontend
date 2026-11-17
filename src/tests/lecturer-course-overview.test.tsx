import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const offering = {
  id: "co1",
  course: {
    id: "c1",
    code: "CSC 101",
    title: "Intro to CS",
    description: "Fundamentals of computing and problem solving.",
    credits: 3,
    level: 100,
    courseType: "Core",
    status: "ACTIVE",
    prerequisiteCount: 1,
  },
  semester: {
    id: "s1",
    name: "First Semester 2026",
    code: "SEM1",
    sequence: 1,
    startDate: "2026-01-05",
    endDate: "2026-05-15",
    status: "ACTIVE",
    isCurrent: true,
  },
  programme: {
    id: "p1",
    code: "BSC-CS",
    name: "Computer Science",
    degreeType: "BACHELORS",
    durationYears: 4,
  },
  section: "A",
  capacity: 60,
  status: "ACTIVE",
  enrolledCount: 45,
  instructorCount: 2,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

vi.mock("@/features/courses/hooks/useCourses", () => ({
  useCourse: () => ({ data: { data: offering }, isLoading: false }),
}));

const params = {
  status: "fulfilled",
  value: { courseId: "co1" },
  then: () => {},
} as unknown as Promise<{ courseId: string }>;

import LecturerCourseOverview from "@/app/(lecturer)/lecturer/courses/[courseId]/page";

describe("Lecturer course overview", () => {
  it("renders about and semester panels with course facts", () => {
    render(<LecturerCourseOverview params={params} />);

    expect(screen.getByText("About this course")).toBeInTheDocument();
    expect(screen.getByText("Semester at a glance")).toBeInTheDocument();
    expect(
      screen.getByText("Fundamentals of computing and problem solving.")
    ).toBeInTheDocument();
    expect(screen.getByText("CSC 101")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        (_, el) => el?.textContent?.replace(/\s+/g, " ").trim() === "45 / 60"
      ).length
    ).toBeGreaterThan(0);
  });

  it("links quick actions to the course tabs", () => {
    render(<LecturerCourseOverview params={params} />);

    expect(screen.getByText("Quick actions")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Manage content/i })).toHaveAttribute(
      "href",
      "/lecturer/courses/co1/content"
    );
    expect(screen.getByRole("link", { name: /Assignments/i })).toHaveAttribute(
      "href",
      "/lecturer/courses/co1/assignments"
    );
    expect(screen.getByRole("link", { name: /Students/i })).toHaveAttribute(
      "href",
      "/lecturer/courses/co1/students"
    );
    expect(screen.getByRole("link", { name: /Course analytics/i })).toHaveAttribute(
      "href",
      "/lecturer/courses/co1/analytics"
    );
  });
});
