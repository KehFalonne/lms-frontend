"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Printer,
  Search,
  StickyNote,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadFile, getDownloadUrl } from "@/features/files/api/files.api";
import { useContentProgress, useMarkProgress } from "../hooks/useContent";
import type { AudioChapter, ContentItemDetail, ContentType } from "../types/content.types";
import { isDirectVideoUrl, normalizeVideoUrl } from "../utils/video-url";
import {
  countTextMatches,
  highlightContentHtml,
  sanitizeContentHtml,
} from "../utils/content-html";

const ICONS: Record<ContentType, typeof FileText> = {
  TEXT: FileText,
  PDF: FileText,
  DOCUMENT: FileText,
  VIDEO: PlayCircle,
  AUDIO: PlayCircle,
  LINK: ExternalLink,
  EMBED: ExternalLink,
  FILE: FileText,
};

interface Props {
  item: ContentItemDetail;
  offeringId: string;
}

export function ContentViewer({ item, offeringId }: Props) {
  const markProgress = useMarkProgress(offeringId);
  const savePlaybackProgress = useMarkProgress(offeringId);
  const progressQuery = useContentProgress(item.id);
  const savedProgress = progressQuery.data?.data.progressPercent ?? 0;
  const [localProgress, setLocalProgress] = useState(savedProgress);
  const progressStatus = progressQuery.data?.data.status ?? "NOT_STARTED";
  const isCompleted = progressStatus === "COMPLETED";
  const requiresTrackedMediaCompletion =
    item.contentType === "VIDEO" || item.contentType === "AUDIO";
  const requiresReadingCompletion = item.contentType === "TEXT";
  const requiresLinkOpen = item.contentType === "LINK";
  const requiresTrackedCompletion =
    requiresTrackedMediaCompletion || requiresReadingCompletion || requiresLinkOpen;
  const canMarkComplete =
    !isCompleted &&
    (!requiresTrackedCompletion ||
      (requiresLinkOpen ? localProgress >= 100 : localProgress >= 90));

  useEffect(() => {
    setLocalProgress((previous) => Math.max(previous, savedProgress));
  }, [savedProgress]);

  useEffect(() => {
    if (!progressQuery.isSuccess || isCompleted) return;
    savePlaybackProgress.mutate({ contentId: item.id, status: "IN_PROGRESS" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, progressQuery.isSuccess, isCompleted]);

  const Icon = ICONS[item.contentType] ?? FileText;

  return (
    <div className="space-y-6 pb-24 sm:pb-20">
      <div className="border-border bg-background rounded-lg border p-5">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          <span>{item.contentType}</span>
          {item.isRequired && (
            <>
              <span>·</span>
              <span className="text-warning">Required</span>
            </>
          )}
        </div>
        <h1 className="mt-2 text-xl font-semibold">{item.title}</h1>
        {item.description && (
          <p className="text-muted-foreground mt-2 text-sm">{item.description}</p>
        )}
        {item.contentType === "TEXT" && item.body && (
          <p className="text-muted-foreground mt-3 text-xs">
            Estimated reading time: {getReadingTimeMinutes(item.body)} min
          </p>
        )}
      </div>

      <div className="border-border bg-background rounded-lg border p-6">
        <ContentBody
          item={item}
          progressPercent={localProgress}
          onProgress={(progressPercent) => {
            if (isCompleted) return;
            setLocalProgress((previous) => Math.max(previous, progressPercent));
            savePlaybackProgress.mutate({
              contentId: item.id,
              status: "IN_PROGRESS",
              progressPercent,
            });
          }}
        />
      </div>

      <div data-completion-actions className="border-border bg-background/95 pb-safe fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 shadow-[0_-8px_24px_-20px_hsl(var(--foreground))] backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {item.contentType}
              </span>
              {item.isRequired && (
                <span className="text-warning rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium">
                  Required
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  isCompleted
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? "Completed" : "In progress"}
              </span>
            </div>
            {!isCompleted && !canMarkComplete && (
              <p className="text-muted-foreground mt-1 text-xs">
                {requiresLinkOpen
                  ? "Open the resource to unlock completion."
                  : requiresReadingCompletion
                    ? `${localProgress}% read · reach 90% to complete.`
                    : `${localProgress}% complete · reach 90% to finish.`}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={() =>
              markProgress.mutate({
                contentId: item.id,
                status: "COMPLETED",
                progressPercent: Math.max(localProgress, 100),
              })
            }
            loading={markProgress.isPending}
            disabled={!canMarkComplete || progressQuery.isLoading}
            variant="primary"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {isCompleted ? "Completed" : "Mark complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContentBody({
  item,
  progressPercent,
  onProgress,
}: {
  item: ContentItemDetail;
  progressPercent: number;
  onProgress: (progressPercent: number) => void;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const fileUrl = useQuery({
    queryKey: ["content-file-url", item.fileId],
    queryFn: () =>
      getDownloadUrl(item.fileId!).then((response) => response.data.downloadUrl),
    enabled: Boolean(item.fileId),
    staleTime: 8 * 60 * 1000,
  }).data;
  const externalUrl =
    item.contentType === "VIDEO"
      ? (fileUrl ?? normalizeVideoUrl(item.externalUrl))
      : (fileUrl ?? getSafeExternalUrl(item.externalUrl));

  switch (item.contentType) {
    case "TEXT":
      return (
        <TextLessonBody
          body={item.body}
          attachmentIds={item.attachmentIds ?? []}
          storageKey={item.id}
          onProgress={onProgress}
        />
      );

    case "VIDEO":
      if (externalUrl && (isDirectVideoUrl(externalUrl) || Boolean(item.fileId))) {
        return (
          <DirectVideoPlayer
            src={externalUrl}
            title={item.title}
            progressPercent={progressPercent}
            onProgress={onProgress}
          />
        );
      }
      if (externalUrl) {
        return (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            <iframe
              src={externalUrl}
              title={item.title}
              className="h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <p className="text-muted-foreground text-sm">No valid video source available.</p>
      );

    case "EMBED":
      if (externalUrl) {
        return (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            <iframe
              src={externalUrl}
              title={item.title}
              className="h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return <p className="text-muted-foreground text-sm">No video source available.</p>;

    case "AUDIO":
      return externalUrl ? (
        <div className="space-y-3">
          {item.fileName && (
            <p className="text-muted-foreground text-xs">
              {item.fileName}
              {item.fileSizeBytes ? ` · ${formatBytes(item.fileSizeBytes)}` : ""}
            </p>
          )}
          <AudioPlayer
            src={externalUrl}
            title={item.title}
            progressPercent={progressPercent}
            onProgress={onProgress}
            chapters={item.chapters ?? []}
            mimeType={item.fileMimeType ?? undefined}
          />
          {item.transcript?.trim() && (
            <details className="border-border rounded-md border p-4">
              <summary className="cursor-pointer text-sm font-medium">
                Show transcript
              </summary>
              <p className="text-muted-foreground mt-3 whitespace-pre-wrap text-sm leading-6">
                {item.transcript}
              </p>
            </details>
          )}
          {item.fileId && item.allowDownload !== false && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void downloadFile(item.fileId!, item.fileName ?? undefined)}
            >
              <Download className="h-4 w-4" />
              Download audio
            </Button>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No audio source available.</p>
      );

    case "PDF":
      return externalUrl ? (
        <div className="space-y-3">
          {item.fileName && (
            <p className="text-muted-foreground text-xs">
              {item.fileName}
              {item.fileSizeBytes ? ` · ${formatBytes(item.fileSizeBytes)}` : ""}
            </p>
          )}
          <div className="border-border hidden h-[70vh] min-h-[480px] overflow-hidden rounded-md border bg-slate-100 sm:block">
            <iframe src={externalUrl} title={item.title} className="h-full w-full" />
          </div>
          <div className="border-border bg-muted/30 rounded-md border p-4 text-sm sm:hidden">
            <p className="font-medium">PDF preview</p>
            <p className="text-muted-foreground mt-1">
              Open the PDF in a new tab for the best mobile reading experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => window.open(externalUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" />
              Open PDF
            </Button>
            {item.fileId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void downloadFile(item.fileId!, item.fileName ?? undefined)}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No PDF file or valid PDF URL is available.
        </p>
      );

    case "DOCUMENT":
    case "FILE":
      return (
        <div className="border-border rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-3 text-sm">
            Preview unavailable. Use the download button below.
          </p>
          <Button
            type="button"
            onClick={() => {
              if (item.fileId) {
                void downloadFile(item.fileId);
              }
            }}
            disabled={!item.fileId}
          >
            <Download className="h-4 w-4" />
            Download file
          </Button>
        </div>
      );

    case "LINK":
      return externalUrl ? (
        <div className="border-border bg-surface/40 max-w-2xl rounded-xl border p-5">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <ExternalLink className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">External resource</p>
              <p className="text-muted-foreground mt-1 text-xs">{getUrlHost(externalUrl)}</p>
              <p className="text-muted-foreground mt-2 break-all text-sm">{externalUrl}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                window.open(externalUrl, "_blank", "noopener,noreferrer");
                onProgress(100);
              }}
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open resource
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!navigator.clipboard) return;
                void navigator.clipboard.writeText(externalUrl).then(() => {
                  setLinkCopied(true);
                  window.setTimeout(() => setLinkCopied(false), 1800);
                });
              }}
            >
              {linkCopied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No link provided.</p>
      );

    default:
      return (
        <div
          className="lesson-document lesson-content"
          dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(item.body || "") }}
        />
      );
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getReadingTimeMinutes(value: string): number {
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function TextLessonBody({
  body,
  attachmentIds,
  storageKey,
  onProgress,
}: {
  body: string;
  attachmentIds: string[];
  storageKey: string;
  onProgress: (progressPercent: number) => void;
}) {
  type LessonHeading = { title: string; level: number; index: number };
  const articleRef = useRef<HTMLElement>(null);
  const lastReported = useRef(0);
  const onProgressRef = useRef(onProgress);
  const [search, setSearch] = useState("");
  const [activeMatch, setActiveMatch] = useState(0);
  const [headings, setHeadings] = useState<LessonHeading[]>([]);
  const [activeHeadingIndex, setActiveHeadingIndex] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [isMobileOutlineOpen, setIsMobileOutlineOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchPosition, setMobileSearchPosition] = useState({ x: 0, y: 0 });
  const mobileSearchDrag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const saveScrollTimer = useRef<number | null>(null);
  onProgressRef.current = onProgress;

  useEffect(() => {
    const savedNote = window.localStorage.getItem(`lesson-note-${storageKey}`) ?? "";
    setNote(savedNote);
    setSavedNote(savedNote);
  }, [storageKey]);

  function saveLessonNote() {
    const nextNote = note.trim();
    if (nextNote) {
      window.localStorage.setItem(`lesson-note-${storageKey}`, nextNote);
    } else {
      window.localStorage.removeItem(`lesson-note-${storageKey}`);
    }
    setNote(nextNote);
    setSavedNote(nextNote);
  }

  function downloadLessonHtml() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Lesson</title></head><body>${sanitizeContentHtml(body || "<p>No content yet.</p>")}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "lesson.html";
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const savedPosition = window.sessionStorage.getItem(`lesson-search-icon-position-${storageKey}`);
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as { x?: number; y?: number };
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setMobileSearchPosition({ x: parsed.x, y: parsed.y });
          return;
        }
      } catch {
        window.sessionStorage.removeItem(`lesson-search-icon-position-${storageKey}`);
      }
    }
    setMobileSearchPosition({
      x: Math.max(12, window.innerWidth - 56),
      y: Math.max(88, window.innerHeight * 0.35),
    });
  }, [storageKey]);

  function startMobileSearchDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    mobileSearchDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: mobileSearchPosition.x,
      originY: mobileSearchPosition.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveMobileSearchIcon(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = mobileSearchDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) drag.moved = true;
    if (!drag.moved) return;

    const nextPosition = {
      x: Math.max(8, Math.min(drag.originX + deltaX, window.innerWidth - 52)),
      y: Math.max(72, Math.min(drag.originY + deltaY, window.innerHeight - 56)),
    };
    setMobileSearchPosition(nextPosition);
    window.sessionStorage.setItem(
      `lesson-search-icon-position-${storageKey}`,
      JSON.stringify(nextPosition),
    );
  }

  function finishMobileSearchDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = mobileSearchDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved) setIsMobileSearchOpen((open) => !open);
    mobileSearchDrag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  useEffect(() => {
    const scrollStorageKey = `lesson-scroll-position-${storageKey}`;
    const savedScroll = window.localStorage.getItem(scrollStorageKey);
    if (savedScroll) {
      const scrollY = Number(savedScroll);
      if (Number.isFinite(scrollY) && scrollY > 0) {
        const restoreTimer = window.setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" });
        }, 80);

        return () => window.clearTimeout(restoreTimer);
      }
    }
  }, [body, storageKey]);

  useEffect(() => {
    const scrollStorageKey = `lesson-scroll-position-${storageKey}`;

    function persistScrollPosition() {
      window.localStorage.setItem(scrollStorageKey, String(window.scrollY));
    }

    function rememberScrollPosition() {
      if (saveScrollTimer.current) return;
      saveScrollTimer.current = window.setTimeout(() => {
        persistScrollPosition();
        saveScrollTimer.current = null;
      }, 150);
    }

    window.addEventListener("scroll", rememberScrollPosition, { passive: true });
    window.addEventListener("pagehide", persistScrollPosition);
    return () => {
      window.removeEventListener("scroll", rememberScrollPosition);
      window.removeEventListener("pagehide", persistScrollPosition);
      if (saveScrollTimer.current) {
        window.clearTimeout(saveScrollTimer.current);
        saveScrollTimer.current = null;
      }
      persistScrollPosition();
    };
  }, [storageKey]);

  useEffect(() => {
    setActiveMatch(0);
  }, [search]);

  useEffect(() => {
    articleRef.current?.querySelectorAll("mark").forEach((mark, index) => {
      mark.classList.toggle("lesson-search-active", index === activeMatch);
    });
  }, [search, activeMatch, body]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    setHeadings(
      Array.from(article.querySelectorAll("h1, h2, h3"))
        .map((heading, index) => ({
          title: heading.textContent?.trim() ?? "",
          level: Number(heading.tagName.substring(1)),
          index,
        }))
        .filter((heading) => heading.title),
    );
  }, [body, search]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article || headings.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const headingElements = Array.from(article.querySelectorAll("h1, h2, h3"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeading = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visibleHeading) return;
        const nextIndex = headingElements.indexOf(visibleHeading.target as Element);
        if (nextIndex >= 0) setActiveHeadingIndex(nextIndex);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 1] },
    );

    headingElements.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [body, search, headings.length]);

  const matchCount = countTextMatches(body, search);

  function goToMatch(index: number) {
    if (!articleRef.current || matchCount === 0) return;
    const nextIndex = (index + matchCount) % matchCount;
    const matches = articleRef.current.querySelectorAll("mark");
    matches[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveMatch(nextIndex);
  }

  function goToHeading(index: number) {
    setActiveHeadingIndex(index);
    articleRef.current
      ?.querySelectorAll("h1, h2, h3")
      .item(index)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    function reportReadingProgress() {
      const article = articleRef.current;
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = Math.max(article.scrollHeight, rect.height);
      const viewportBottom = window.scrollY + window.innerHeight;
      const percent = Math.max(
        0,
        Math.min(100, Math.round(((viewportBottom - articleTop) / articleHeight) * 100))
      );
      if (
        percent >= lastReported.current + 5 ||
        (percent === 100 && lastReported.current < 100)
      ) {
        lastReported.current = percent;
        onProgressRef.current(percent);
      }
    }

    reportReadingProgress();
    window.addEventListener("scroll", reportReadingProgress, { passive: true });
    window.addEventListener("resize", reportReadingProgress);
    return () => {
      window.removeEventListener("scroll", reportReadingProgress);
      window.removeEventListener("resize", reportReadingProgress);
    };
  }, []);

  const searchPanel = (
    <div
      className="w-full space-y-2 lg:sticky lg:top-32 lg:z-10"
      role="search"
      aria-label="Search lesson content"
    >
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSearch("");
              event.currentTarget.blur();
              return;
            }
            if (event.key === "Enter" && matchCount > 0) {
              event.preventDefault();
              goToMatch(activeMatch + (event.shiftKey ? -1 : 1));
            }
          }}
          placeholder="Search this lesson"
          aria-label="Search this lesson"
          className={`border-transparent bg-transparent pl-9 opacity-60 transition-all duration-200 hover:border-border hover:bg-background/95 hover:opacity-100 focus:border-border focus:bg-background/95 focus:opacity-100 sm:border-border sm:bg-background sm:opacity-100 ${search ? "pr-10" : ""}`}
        />
        {search && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground absolute right-2 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            onClick={() => setSearch("")}
            aria-label="Clear lesson search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {search.trim() && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            {matchCount} match{matchCount === 1 ? "" : "es"} found
            {matchCount > 0 && ` · ${activeMatch + 1} of ${matchCount}`}
          </p>
          {matchCount > 0 && (
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="outline" onClick={() => goToMatch(activeMatch - 1)}>
                Previous
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => goToMatch(activeMatch + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div
        className={
          headings.length > 0
            ? "grid w-full gap-8 lg:grid-cols-[minmax(18rem,21rem)_minmax(0,52rem)_minmax(16rem,20rem)] lg:items-start"
            : "grid w-full gap-8 lg:grid-cols-[minmax(0,52rem)_minmax(16rem,20rem)] lg:items-start"
        }
      >
        {headings.length > 0 && (
          <aside className="border-border hidden rounded-lg border p-3 lg:sticky lg:top-32 lg:block lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto">
            <details open>
              <summary className="cursor-pointer text-sm font-medium">On this page</summary>
              <nav aria-label="Lesson sections" className="mt-2 space-y-1">
                {headings.map((heading) => (
                  <button
                    key={`${heading.index}-${heading.title}`}
                    type="button"
                  className={`block w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                    activeHeadingIndex === heading.index
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                    style={{ paddingLeft: `${(heading.level - 1) * 0.75 + 0.5}rem` }}
                    onClick={() => goToHeading(heading.index)}
                  >
                    {heading.title}
                  </button>
                ))}
              </nav>
            </details>
          </aside>
        )}
        {headings.length > 0 && (
          <div className="fixed left-0 top-1/2 z-30 -translate-y-1/2 lg:hidden">
            <div
              className={`border-border bg-background/95 w-[min(18rem,calc(100vw-2rem))] max-h-[65vh] overflow-y-auto rounded-r-xl border p-3 shadow-xl backdrop-blur transition-all duration-200 ease-out ${
                isMobileOutlineOpen
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-full opacity-0"
              }`}
            >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">On this page</p>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setIsMobileOutlineOpen(false)}
                    aria-label="Close lesson sections"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
                <nav aria-label="Lesson sections" className="mt-2 space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={`mobile-${heading.index}-${heading.title}`}
                      type="button"
                      className={`block w-full rounded px-2 py-2 text-left text-sm transition-colors ${
                        activeHeadingIndex === heading.index
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      style={{ paddingLeft: `${(heading.level - 1) * 0.75 + 0.5}rem` }}
                      onClick={() => {
                        setIsMobileOutlineOpen(false);
                        goToHeading(heading.index);
                      }}
                    >
                      {heading.title}
                    </button>
                  ))}
                </nav>
            </div>
            <Button
              type="button"
              size="icon"
              variant="primary"
              className={`absolute left-0 top-1/2 h-10 w-8 -translate-y-1/2 rounded-l-none rounded-r-lg shadow-lg transition-all duration-200 ease-out ${
                isMobileOutlineOpen
                  ? "pointer-events-none -translate-x-4 opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
              onClick={() => setIsMobileOutlineOpen(true)}
              aria-label="Open lesson sections"
              aria-expanded={isMobileOutlineOpen}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}
        <aside className="hidden lg:sticky lg:top-32 lg:col-start-3 lg:block">
          {searchPanel}
        </aside>
        <div className="fixed inset-0 z-30 pointer-events-none lg:hidden">
          <div
            className={`pointer-events-auto fixed right-3 top-28 w-[min(22rem,calc(100vw-1.5rem))] rounded-lg bg-background/95 p-2 shadow-xl backdrop-blur transition-all duration-200 ease-out ${
              isMobileSearchOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-95 opacity-0"
            }`}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 z-10 h-8 w-8"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-label="Close lesson search"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
            {searchPanel}
          </div>
          <Button
            type="button"
            size="icon"
            variant="primary"
            className={`pointer-events-auto fixed h-10 w-10 rounded-full shadow-lg transition-all duration-200 ease-out ${
              isMobileSearchOpen ? "scale-90 opacity-0" : "scale-100 opacity-100"
            }`}
            style={{ left: mobileSearchPosition.x, top: mobileSearchPosition.y }}
            onPointerDown={startMobileSearchDrag}
            onPointerMove={moveMobileSearchIcon}
            onPointerUp={finishMobileSearchDrag}
            onPointerCancel={finishMobileSearchDrag}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsMobileSearchOpen((open) => !open);
              }
            }}
            aria-label="Move or open lesson search"
            aria-expanded={isMobileSearchOpen}
          >
            <Search className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div
          className={
            headings.length > 0
              ? "min-w-0 max-w-full lg:col-start-2"
              : "lesson-document min-w-0 lg:col-start-1"
          }
        >
          <div
            data-lesson-actions
            className="mb-5 flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden />
                Print lesson
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={downloadLessonHtml}>
                <Download className="h-4 w-4" aria-hidden />
                Download HTML
              </Button>
            </div>
            {savedNote && <span className="text-success text-xs">Note saved</span>}
          </div>
          <details data-lesson-actions className="border-border mb-6 rounded-lg border p-3">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <StickyNote className="h-4 w-4" aria-hidden />
              My lesson note
            </summary>
            <div className="mt-3 space-y-2">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write a private note about this lesson..."
                aria-label="Private lesson note"
                rows={4}
                className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-primary w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
              />
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={saveLessonNote}>
                  Save note
                </Button>
              </div>
            </div>
          </details>
          <article
            ref={articleRef}
            data-print-content
            className="lesson-content"
            dangerouslySetInnerHTML={{
              __html: highlightContentHtml(body || "<p>No content yet.</p>", search),
            }}
          />
          {attachmentIds.length > 0 && (
            <section className="border-border mt-6 rounded-md border p-4">
              <h2 className="text-sm font-semibold">Lesson attachments</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {attachmentIds.map((fileId, index) => (
                  <Button
                    key={fileId}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void downloadFile(fileId, `lesson-attachment-${index + 1}`)}
                  >
                    <Download className="h-4 w-4" />
                    Download attachment {index + 1}
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function getSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function getUrlHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "External website";
  }
}


function DirectVideoPlayer({
  src,
  title,
  progressPercent,
  onProgress,
}: {
  src: string;
  title: string;
  progressPercent: number;
  onProgress: (progressPercent: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const lastSavedProgress = useRef(progressPercent);
  const hasResumed = useRef(false);

  function changePlaybackRate(value: string) {
    const rate = Number(value);
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }

  if (hasError) {
    return (
      <div className="border-danger/30 bg-danger/5 text-danger rounded-lg border p-6 text-center">
        <p className="font-medium">This video could not be loaded.</p>
        <p className="mt-1 text-sm">
          The video may be unavailable or the server may not allow playback.
        </p>
        <button
          type="button"
          className="text-foreground mt-3 underline"
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
            videoRef.current?.load();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg bg-black shadow-sm">
        {isLoading && (
          <div className="text-muted-foreground absolute inset-0 z-10 flex items-center justify-center bg-black">
            Loading video…
          </div>
        )}
        <video
          ref={videoRef}
          src={src}
          controls
          preload="metadata"
          playsInline
          className="max-h-[70vh] w-full"
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          aria-label={title}
          onLoadedMetadata={(event) => {
            setIsLoading(false);
            if (!hasResumed.current && progressPercent > 0 && progressPercent < 100) {
              event.currentTarget.currentTime =
                (event.currentTarget.duration * progressPercent) / 100;
              hasResumed.current = true;
            }
          }}
          onTimeUpdate={(event) => {
            const duration = event.currentTarget.duration;
            if (!Number.isFinite(duration) || duration <= 0) return;
            const percent = Math.min(
              100,
              Math.round((event.currentTarget.currentTime / duration) * 100)
            );
            if (percent >= lastSavedProgress.current + 5 || percent === 100) {
              lastSavedProgress.current = percent;
              onProgress(percent);
            }
          }}
          onEnded={() => {
            lastSavedProgress.current = 100;
            onProgress(100);
          }}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <label
          htmlFor={`playback-rate-${title}`}
          className="text-muted-foreground text-xs"
        >
          Speed
        </label>
        <select
          id={`playback-rate-${title}`}
          value={playbackRate}
          onChange={(event) => changePlaybackRate(event.target.value)}
          className="border-border bg-background rounded-md border px-2 py-1 text-xs"
        >
          <option value="0.75">0.75×</option>
          <option value="1">Normal</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2×</option>
        </select>
      </div>
    </div>
  );
}

function formatChapterTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function AudioPlayer({
  src,
  title,
  progressPercent,
  onProgress,
  chapters,
  mimeType,
}: {
  src: string;
  title: string;
  progressPercent: number;
  onProgress: (progressPercent: number) => void;
  chapters: AudioChapter[];
  mimeType?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSavedProgress = useRef(progressPercent);
  const trackedProgress = useRef(progressPercent);
  const lastPlaybackPosition = useRef<number | null>(null);
  const hasResumed = useRef(false);
  const chapterSeekTarget = useRef<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(progressPercent);

  useEffect(() => {
    setCurrentProgress(progressPercent);
    lastSavedProgress.current = progressPercent;
    trackedProgress.current = progressPercent;
    lastPlaybackPosition.current = null;
    hasResumed.current = false;
  }, [src]);

  useEffect(() => {
    setCurrentProgress((previous) => Math.max(previous, progressPercent));
    trackedProgress.current = Math.max(trackedProgress.current, progressPercent);
    if (
      hasResumed.current ||
      progressPercent <= 0 ||
      progressPercent >= 100 ||
      !audioRef.current
    ) {
      return;
    }
    const duration = audioRef.current.duration;
    if (Number.isFinite(duration) && duration > 0) {
      audioRef.current.currentTime = (duration * progressPercent) / 100;
      hasResumed.current = true;
    }
  }, [progressPercent]);

  function changePlaybackRate(value: string) {
    const rate = Number(value);
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }

  return (
    <div className="space-y-3">
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        className="w-full"
        aria-label={title}
        onLoadedMetadata={(event) => {
          if (!hasResumed.current && progressPercent > 0 && progressPercent < 100) {
            const duration = event.currentTarget.duration;
            if (Number.isFinite(duration) && duration > 0) {
              event.currentTarget.currentTime = (duration * progressPercent) / 100;
            }
            hasResumed.current = true;
          }
          lastPlaybackPosition.current = event.currentTarget.currentTime;
        }}
        onTimeUpdate={(event) => {
          const duration = event.currentTarget.duration;
          if (!Number.isFinite(duration) || duration <= 0) return;
          if (chapterSeekTarget.current !== null) {
            if (event.currentTarget.currentTime <= chapterSeekTarget.current + 0.5) {
              return;
            }
            chapterSeekTarget.current = null;
            lastPlaybackPosition.current = event.currentTarget.currentTime;
            return;
          }
          const previousPosition = lastPlaybackPosition.current;
          lastPlaybackPosition.current = event.currentTarget.currentTime;
          if (previousPosition === null) return;
          const forwardSeconds = event.currentTarget.currentTime - previousPosition;
          if (forwardSeconds <= 0) return;
          trackedProgress.current = Math.min(
            100,
            trackedProgress.current + (forwardSeconds / duration) * 100
          );
          const percent = Math.round(trackedProgress.current);
          // Progress represents the furthest point listened to, not the
          // current cursor position. Replaying must not reduce completion.
          setCurrentProgress((previous) => Math.max(previous, percent));
          if (percent >= lastSavedProgress.current + 5 || percent === 100) {
            lastSavedProgress.current = percent;
            onProgress(percent);
          }
        }}
        onEnded={() => {
          lastSavedProgress.current = 100;
          setCurrentProgress(100);
          onProgress(100);
        }}
      >
        <source
          src={src}
          type={mimeType === "audio/x-m4a" ? "audio/mp4" : mimeType}
        />
      </audio>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Listening progress</span>
          <span className="font-medium">{currentProgress}%</span>
        </div>
        <div
          className="bg-muted h-2 overflow-hidden rounded-full"
          role="progressbar"
          aria-label="Audio listening progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={currentProgress}
        >
          <div
            className="bg-primary h-full rounded-full transition-[width]"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <label htmlFor={`audio-playback-rate-${title}`} className="text-muted-foreground text-xs">
          Speed
        </label>
        <select
          id={`audio-playback-rate-${title}`}
          value={playbackRate}
          onChange={(event) => changePlaybackRate(event.target.value)}
          className="border-border bg-background rounded-md border px-2 py-1 text-xs"
        >
          <option value="0.75">0.75×</option>
          <option value="1">Normal</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2×</option>
        </select>
      </div>
      {chapters.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Chapters</p>
          <div className="flex flex-wrap gap-2">
            {chapters.map((chapter) => (
              <button
                key={`${chapter.title}-${chapter.startSeconds}`}
                type="button"
                className="border-border hover:bg-muted rounded-md border px-3 py-1.5 text-left text-xs"
                onClick={() => {
                  if (audioRef.current) {
                    chapterSeekTarget.current = chapter.startSeconds;
                    audioRef.current.currentTime = chapter.startSeconds;
                    void audioRef.current.play();
                  }
                }}
              >
                {formatChapterTime(chapter.startSeconds)} · {chapter.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
