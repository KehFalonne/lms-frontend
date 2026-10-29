import CourseDiscussionsPageClient from "./page-client";

export const instant = false;

export default async function CourseDiscussionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseDiscussionsPageClient courseId={courseId} />;
}
