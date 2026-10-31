"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Link2,
  PlayCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useContentTree } from "@/features/content/hooks/useContent";
import type { ContentType, ProgressStatus } from "@/features/content/types/content.types";

const ICONS: Record<ContentType, typeof FileText> = {
  TEXT: FileText,
  PDF: FileText,
  DOCUMENT: FileText,
  VIDEO: PlayCircle,
  AUDIO: PlayCircle,
  LINK: Link2,
  EMBED: Link2,
  FILE: FileText,
};

export default function CourseContentPageClient({ courseId }: { courseId: string }) {
  const { data, isLoading, isError, refetch } = useContentTree(courseId);
  const modules = data?.data ?? [];

  useEffect(() => {
    if (isLoading) return;

    const savedScroll = window.sessionStorage.getItem(`course-content-scroll-${courseId}`);
    if (!savedScroll) return;

    const scrollY = Number(savedScroll);
    if (!Number.isFinite(scrollY) || scrollY <= 0) return;

    let restoreTimer: number | undefined;
    const restorePosition = () => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
      restoreTimer = window.setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
      }, 180);
    };

    const animationFrame = window.requestAnimationFrame(restorePosition);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (restoreTimer) window.clearTimeout(restoreTimer);
    };
  }, [courseId, isLoading, modules.length]);

  function rememberContentListPosition() {
    window.sessionStorage.setItem(
      `course-content-scroll-${courseId}`,
      String(window.scrollY),
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (modules.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No content yet"
        description="Your lecturer hasn't published any content for this course."
      />
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <Card key={module.id} className="overflow-hidden">
          <div className="border-border bg-surface/60 border-b px-5 py-3">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Module {module.position}
            </p>
            <h3 className="mt-0.5 font-semibold">{module.title}</h3>
            {module.description && (
              <p className="text-muted-foreground mt-1 text-xs">{module.description}</p>
            )}
          </div>

          <ul className="divide-border divide-y">
            {module.contentItems.map((item) => {
              const Icon = ICONS[item.contentType] ?? FileText;
              return (
                <li key={item.id}>
                  <Link
                    href={`/courses/${courseId}/content/${item.id}`}
                    onPointerDown={rememberContentListPosition}
                    onClick={rememberContentListPosition}
                    className="hover:bg-surface flex items-center justify-between gap-3 px-5 py-3 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.contentType}
                          {item.isRequired && " · Required"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ProgressIcon status={item.progressStatus} />
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    </div>
                  </Link>
                </li>
              );
            })}

            {module.contentItems.length === 0 && (
              <li className="text-muted-foreground px-5 py-6 text-center text-sm">
                No items in this module.
              </li>
            )}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function ProgressIcon({ status }: { status: ProgressStatus }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="text-success h-4 w-4" />;
  }
  if (status === "IN_PROGRESS") {
    return <PlayCircle className="text-info h-4 w-4" />;
  }
  return <Circle className="text-muted-foreground h-4 w-4" />;
}
