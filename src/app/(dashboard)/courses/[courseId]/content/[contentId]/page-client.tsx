"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ContentViewer } from "@/features/content/components/content-viewer";
import { useContentItem } from "@/features/content/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function ContentItemPageClient({
  courseId,
  contentId,
}: {
  courseId: string;
  contentId: string;
}) {
  const { data, isLoading, isError, refetch } = useContentItem(contentId);
  const item = data?.data;

  return (
    <div>
      <Link
        href={`/courses/${courseId}/content`}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to content
      </Link>

      {isLoading && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {item && <ContentViewer item={item} offeringId={courseId} />}
    </div>
  );
}
