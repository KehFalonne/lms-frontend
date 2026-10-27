"use client";
import { use } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses/hooks/useCourses";

export default function LecturerCourseOverview({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading } = useCourse(courseId);
  const c = data?.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!c) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About this course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {c.course.description || "No description provided."}
          </p>
          <Row label="Course Code" value={c.course.code} />
          <Row label="Credits" value={String(c.course.credits)} />
          <Row label="Level" value={String(c.course.level)} />
          <Row label="Section" value={c.section} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrollment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Programme" value={c.programme.name} />
          <Row label="Semester" value={c.semester.name} />
          <Row label="Capacity" value={String(c.capacity)} />
          <Row label="Enrolled" value={String(c.enrolledCount)} />
          <Row label="Instructors" value={String(c.instructorCount)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex justify-between border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
