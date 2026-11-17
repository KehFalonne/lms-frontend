import { describe, it, expect, vi } from "vitest";
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
  useCourseAnalytics: () => ({
    data: {
      data: {
        overview: {
          enrolledCount: 45,
          assignmentCount: 2,
          submittedCount: 72,
          expectedSubmissions: 90,
          submissionRate: 80,
          gradedCount: 30,
          averageGradePct: 68.5,
          assessmentAttempts: 40,
          assessmentCompletionRate: 85,
          avgContentProgress: 62,
          activeLearners30d: 38,
        },
        gradeDistribution: [
          { bucket: "0-49", count: 3, share: 10 },
          { bucket: "50-59", count: 6, share: 20 },
          { bucket: "60-69", count: 9, share: 30 },
          { bucket: "70-79", count: 8, share: 26.7 },
          { bucket: "80-100", count: 4, share: 13.3 },
        ],
        engagement: {
          eventsByType: [
            { type: "CONTENT_VIEWED", label: "Content viewed", count: 120 },
            { type: "ASSIGNMENT_SUBMITTED", label: "Assignment submitted", count: 72 },
          ],
          activityByDay: [{ date: now, count: 15 }],
        },
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
        assessments: [
          {
            id: "a1",
            title: "Midterm CA",
            attempts: 40,
            completed: 34,
            completionRate: 85,
            avgPercentage: 72.4,
            bestPercentage: 96,
            worstPercentage: 41,
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

import LecturerCourseAnalyticsPage from "@/app/(lecturer)/lecturer/courses/[courseId]/analytics/page";

const params = {
  status: "fulfilled",
  value: { courseId: "co1" },
  then: () => {},
} as unknown as Promise<{ courseId: string }>;

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LecturerCourseAnalyticsPage params={params} />
    </QueryClientProvider>
  );
}

describe("Lecturer course analytics", () => {
  it("renders overview stats and panels", () => {
    renderPage();

    expect(screen.getByText("Enrolled students")).toBeInTheDocument();
    expect(screen.getByText("Submission rate")).toBeInTheDocument();
    expect(screen.getByText("Average grade")).toBeInTheDocument();
    expect(screen.getByText("Assessment completion")).toBeInTheDocument();
    expect(screen.getByText("Avg content progress")).toBeInTheDocument();
    expect(screen.getByText("Active learners · 30d")).toBeInTheDocument();
    expect(screen.getByText("Grade distribution")).toBeInTheDocument();
    expect(screen.getByText("Activity · last 14 days")).toBeInTheDocument();
    expect(screen.getByText("Engagement by event")).toBeInTheDocument();
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
    expect(screen.getByText("Assessment performance")).toBeInTheDocument();
  });

  it("shows assessment rows and activity feed", () => {
    renderPage();

    expect(screen.getByText("Midterm CA")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Content viewed")).toBeInTheDocument();
  });
});
