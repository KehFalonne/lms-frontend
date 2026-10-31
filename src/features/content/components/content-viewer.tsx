"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download, ExternalLink, FileText, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadFile, getDownloadUrl } from "@/features/files/api/files.api";
import { useContentProgress, useMarkProgress } from "../hooks/useContent";
import type { ContentItemDetail, ContentType } from "../types/content.types";
import { isDirectVideoUrl, normalizeVideoUrl } from "../utils/video-url";

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
  const progressQuery = useContentProgress(item.id);
  const savedProgress = progressQuery.data?.data.progressPercent ?? 0;
  const progressStatus = progressQuery.data?.data.status ?? "NOT_STARTED";
  const isCompleted = progressStatus === "COMPLETED";
  const requiresVideoCompletion = item.contentType === "VIDEO" && item.isRequired;
  const canMarkComplete =
    !isCompleted && (!requiresVideoCompletion || savedProgress >= 90);

  useEffect(() => {
    if (!progressQuery.isSuccess || isCompleted) return;
    markProgress.mutate({ contentId: item.id, status: "IN_PROGRESS" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, progressQuery.isSuccess, isCompleted]);

  const Icon = ICONS[item.contentType] ?? FileText;

  return (
    <div className="space-y-6">
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
      </div>

      <div className="border-border bg-background rounded-lg border p-6">
        <ContentBody
          item={item}
          progressPercent={savedProgress}
          onProgress={(progressPercent) => {
            if (isCompleted) return;
            markProgress.mutate({
              contentId: item.id,
              status: "IN_PROGRESS",
              progressPercent,
            });
          }}
        />
      </div>

      {/* Mobile-friendly sticky action bar */}
      <div className="border-border bg-background/95 pb-safe sticky bottom-0 -mx-4 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            {item.contentType}
            {item.isRequired && " · Required"}
          </p>
          <Button
            type="button"
            onClick={() =>
              markProgress.mutate({
                contentId: item.id,
                status: "COMPLETED",
                progressPercent: Math.max(savedProgress, 100),
              })
            }
            loading={markProgress.isPending}
            disabled={!canMarkComplete || progressQuery.isLoading}
            variant="primary"
            size="sm"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {isCompleted ? "Completed" : "Mark complete"}
          </Button>
        </div>
        {requiresVideoCompletion && !isCompleted && !canMarkComplete && (
          <p className="text-muted-foreground mt-2 text-right text-xs">
            Watch at least 90% of this video to mark it complete ({savedProgress}%
            watched).
          </p>
        )}
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
      : getSafeExternalUrl(item.externalUrl);

  switch (item.contentType) {
    case "TEXT":
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: item.body || "<p>No content yet.</p>" }}
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
        <audio controls className="w-full">
          <source src={externalUrl} />
        </audio>
      ) : (
        <p className="text-muted-foreground text-sm">No audio source available.</p>
      );

    case "PDF":
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
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex items-center gap-1 underline"
        >
          {item.externalUrl}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <p className="text-muted-foreground text-sm">No link provided.</p>
      );

    default:
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: item.body || "" }}
        />
      );
  }
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
            if (!hasResumed.current && progressPercent > 0) {
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
