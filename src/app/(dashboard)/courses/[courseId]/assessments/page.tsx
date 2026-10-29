import CourseAssessmentsPageClient from "./page-client";

export const instant = false;

export default async function CourseAssessmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseAssessmentsPageClient courseId={courseId} />;
}
