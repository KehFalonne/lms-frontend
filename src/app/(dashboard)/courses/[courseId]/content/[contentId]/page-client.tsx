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
      <nav
        aria-label="Lesson navigation"
        className="border-border bg-background/95 sticky top-14 z-20 mb-4 flex items-center rounded-lg border px-3 py-2 shadow-sm backdrop-blur sm:top-16"
      >
        <Link
          href={`/courses/${courseId}/content`}
          className="text-muted-foreground hover:text-foreground inline-flex min-h-8 items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          <span>All course content</span>
        </Link>
      </nav>

      {isLoading && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {item && <ContentViewer item={item} offeringId={courseId} />}
    </div>
  );
}
