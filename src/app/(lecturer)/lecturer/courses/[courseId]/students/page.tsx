"use client";
import { use } from "react";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";

interface EnrollmentRow {
  id: string;
  student: {
    id: string;
    universityId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  enrolledAt: string;
}

export default function LecturerStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["lecturer-students", courseId],
    queryFn: () =>
      get<ApiResponse<EnrollmentRow[]>>(endpoints.courseOfferings.enrollments(courseId)),
  });

  const items = data?.data ?? [];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Students ({items.length})</h2>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={Users}
          title="No students enrolled"
          description="Student registrations will appear here."
        />
      )}

      {!isLoading && items.length > 0 && (
        <Card className="divide-border divide-y">
          {items.map((e) => {
            const initials = `${e.student.firstName[0] ?? ""}${
              e.student.lastName[0] ?? ""
            }`.toUpperCase();
            return (
              <div key={e.id} className="flex items-center gap-3 p-3 sm:p-4">
                <Avatar size="md" fallback={initials} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {e.student.firstName} {e.student.lastName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {e.student.universityId} · {e.student.email}
                  </p>
                </div>
                <Badge variant={e.status === "ACTIVE" ? "success" : "default"}>
                  {e.status}
                </Badge>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
