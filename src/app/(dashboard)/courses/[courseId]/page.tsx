import CourseOverviewPageClient from "./page-client";

export const instant = false;

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseOverviewPageClient courseId={courseId} />;
}
