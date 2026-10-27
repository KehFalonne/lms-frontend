import CourseContentPageClient from "./page-client";

export const instant = false;

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseContentPageClient courseId={courseId} />;
}
