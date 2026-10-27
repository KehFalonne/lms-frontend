"use client";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyCourses } from "@/features/courses/hooks/useCourses";
import { primaryRoleLabel } from "@/lib/constants/routes";
import { useMyAssignments } from "@/features/assignments/hooks/useAssignments";
import { useMyAssessments } from "@/features/assessments/hooks/useAssessments";
import { useMyGrades } from "@/features/grading/hooks/useGrades";

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { data, isLoading } = useMyCourses();
  const courses = data?.data ?? [];
  const role = primaryRoleLabel(user?.roles);
  const { data: assignmentsData } = useMyAssignments();
  const assignments = assignmentsData?.data ?? [];
  const pendingAssignments = assignments.filter((a) => !a.mySubmission).length;
  const { data: assessmentsData } = useMyAssessments();
  const assessments = assessmentsData?.data ?? [];
  const pendingAssessments = assessments.filter((a) => !a.lastAttempt).length;
  const { data: gradesData } = useMyGrades();
  const grades = gradesData?.data ?? [];
  const gradedCourses = grades.filter((g) => Number(g.percentage) > 0);
  const avgGrade =
    gradedCourses.length > 0
      ? gradedCourses.reduce((s, g) => s + Number(g.percentage), 0) / gradedCourses.length
      : null;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.firstName ?? "there"}`}
        description={`Signed in as ${role}.`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="My Courses" value={isLoading ? "—" : courses.length} />
        <StatCard
          label="Assignments"
          value={assignments.length > 0 ? pendingAssignments : "—"}
        />
        <StatCard
          label="Assessments"
          value={assessments.length > 0 ? pendingAssessments : "—"}
        />
        <StatCard
          label="Average Grade"
          value={avgGrade !== null ? avgGrade.toFixed(1) + "%" : "—"}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}
          {!isLoading && courses.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Your enrolled courses will appear here once registration is complete."
            />
          )}
          {!isLoading && courses.length > 0 && (
            <ul className="divide-border divide-y">
              {courses.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/courses/${e.courseOffering.id}`}
                    className="hover:bg-surface/50 -mx-2 flex items-center justify-between rounded px-2 py-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{e.courseOffering.course.code}</Badge>
                      </div>
                      <p className="mt-1 font-medium">{e.courseOffering.course.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {e.courseOffering.semester.name} · Section{" "}
                        {e.courseOffering.section}
                      </p>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight sm:mt-2 sm:text-2xl">
        {value}
      </p>
    </Card>
  );
}
