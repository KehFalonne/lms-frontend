import ContentItemPageClient from "./page-client";

export const instant = false;

export default async function ContentItemPage({
  params,
}: {
  params: Promise<{ courseId: string; contentId: string }>;
}) {
  const { courseId, contentId } = await params;
  return <ContentItemPageClient courseId={courseId} contentId={contentId} />;
}
