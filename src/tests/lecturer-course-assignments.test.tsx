import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const assignments = [
  {
    id: "a1",
    title: "Midterm CA",
    description: "Solve the first three problem sets.",
    status: "PUBLISHED",
    maxScore: 20,
    submissionType: "FILE",
    dueAt: future,
  },
  {
    id: "a2",
    title: "Lab Report",
    description: "",
    status: "DRAFT",
    maxScore: 10,
    submissionType: "TEXT",
    dueAt: past,
  },
];

vi.mock("@/features/assignments/hooks/useAssignments", () => ({
  useCourseAssignments: () => ({
    data: { data: assignments },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  usePublishAssignment: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/features/assignments/components/assignment-form-dialog", () => ({
  AssignmentFormDialog: () => <button type="button">New assignment</button>,
}));

const params = {
  status: "fulfilled",
  value: { courseId: "co1" },
  then: () => {},
} as unknown as Promise<{ courseId: string }>;

import LecturerAssignmentsPage from "@/app/(lecturer)/lecturer/courses/[courseId]/assignments/page";

describe("Lecturer course assignments", () => {
  it("renders summary chips and assignment cards", () => {
    render(<LecturerAssignmentsPage params={params} />);

    expect(screen.getByRole("heading", { name: "Assignments" })).toBeInTheDocument();
    expect(screen.getByText("2 assignments")).toBeInTheDocument();
    expect(screen.getByText("1 published")).toBeInTheDocument();
    expect(screen.getByText("1 draft")).toBeInTheDocument();
    expect(screen.getByText("Midterm CA")).toBeInTheDocument();
    expect(screen.getByText("Lab Report")).toBeInTheDocument();
  });

  it("links submissions to the course tab route", () => {
    render(<LecturerAssignmentsPage params={params} />);

    const links = screen.getAllByRole("link", { name: /Submissions/i });
    expect(links.length).toBe(2);
    links.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(
        /^\/lecturer\/courses\/co1\/assignments\/a\d\/submissions$/
      );
    });
  });
});
