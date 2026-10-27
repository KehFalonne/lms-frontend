"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses/hooks/useCourses";

export default function CourseOverviewPageClient({ courseId }: { courseId: string }) {
  const { data, isLoading } = useCourse(courseId);
  const offering = data?.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!offering) {
    return <div className="text-muted-foreground text-sm">Course not found.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>About this course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {offering.course.description || "No description provided."}
          </p>
          <Row label="Course Code" value={offering.course.code} />
          <Row label="Credits" value={String(offering.course.credits)} />
          <Row label="Level" value={String(offering.course.level)} />
          <Row label="Section" value={offering.section} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Semester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Semester" value={offering.semester.name} />
          <Row label="Programme" value={offering.programme.name} />
          <Row label="Capacity" value={String(offering.capacity)} />
          <Row label="Enrolled" value={String(offering.enrolledCount)} />
          <Row label="Instructors" value={String(offering.instructorCount)} />
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
