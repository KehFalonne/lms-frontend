"use client";
import { useEffect } from "react";
import { CheckCircle2, Download, ExternalLink, FileText, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMarkProgress } from "../hooks/useContent";
import type { ContentItemDetail, ContentType } from "../types/content.types";

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

  // Auto-mark in-progress on open
  useEffect(() => {
    markProgress.mutate({ contentId: item.id, status: "IN_PROGRESS" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

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
        <ContentBody item={item} />
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
              markProgress.mutate({ contentId: item.id, status: "COMPLETED" })
            }
            loading={markProgress.isPending}
            variant="primary"
            size="sm"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Mark complete
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContentBody({ item }: { item: ContentItemDetail }) {
  const externalUrl = getSafeExternalUrl(item.externalUrl);

  switch (item.contentType) {
    case "TEXT":
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: item.body || "<p>No content yet.</p>" }}
        />
      );

    case "VIDEO":
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
                window.open(`/api/v1/files/${item.fileId}/download-url/`, "_blank");
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
