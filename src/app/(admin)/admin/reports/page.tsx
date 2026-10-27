"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { ADMIN_ROLES } from "@/lib/constants/routes";

interface ReportsOverview {
  totals: {
    students: number;
    staff: number;
    courses: number;
    programmes: number;
    enrollments: number;
  };
  enrollmentTrend: { period: string; enrollments: number; students: number }[];
  courseActivity: {
    courseCode: string;
    activeStudents: number;
    submissions: number;
    averageScore: number;
  }[];
  programmeDistribution: {
    programmeCode: string;
    programmeName: string;
    students: number;
  }[];
  facultyDistribution: {
    facultyCode: string;
    facultyName: string;
    students: number;
    staff: number;
  }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminReportsPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <ReportsContent />
    </AuthGate>
  );
}

function ReportsContent() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => get<ApiResponse<ReportsOverview>>("/admin/reports/overview/"),
    staleTime: 60_000,
  });

  const r = data?.data;

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Institutional insights and trends."
      />

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {r && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <Stat label="Students" value={r.totals.students} />
            <Stat label="Staff" value={r.totals.staff} />
            <Stat label="Courses" value={r.totals.courses} />
            <Stat label="Programmes" value={r.totals.programmes} />
            <Stat label="Enrollments" value={r.totals.enrollments} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enrollment Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {r.enrollmentTrend.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={r.enrollmentTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="enrollments"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {r.courseActivity.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={r.courseActivity}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="courseCode" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="activeStudents" fill="#3b82f6" name="Students" />
                      <Bar dataKey="submissions" fill="#10b981" name="Submissions" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Programme Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {r.programmeDistribution.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={r.programmeDistribution}
                        dataKey="students"
                        nameKey="programmeCode"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {r.programmeDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Faculty Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {r.facultyDistribution.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={r.facultyDistribution} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="facultyCode"
                        type="category"
                        tick={{ fontSize: 11 }}
                        width={50}
                      />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="students"
                        fill="#3b82f6"
                        name="Students"
                        stackId="a"
                      />
                      <Bar dataKey="staff" fill="#f59e0b" name="Staff" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      No data yet
    </div>
  );
}
