"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";
import { uploadFile, validateFile } from "@/features/files/api/files.api";

export interface UploadedFile {
  localId: string;
  name: string;
  size: number;
  status: "uploading" | "done" | "error";
  progress: number;
  fileId?: string;
  error?: string;
  _file?: File;
}

interface FileUploaderProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
}

let LOCAL_ID = 0;
const nextId = () => `local-${Date.now()}-${++LOCAL_ID}`;

export function FileUploader({
  files,
  onChange,
  accept,
  maxFiles = 10,
}: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<UploadedFile[]>(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const update = useCallback(
    (next: UploadedFile[]) => {
      filesRef.current = next;
      onChange(next);
    },
    [onChange]
  );

  const runUpload = useCallback(
    async (entryId: string) => {
      const entry = filesRef.current.find((f) => f.localId === entryId);
      if (!entry?._file) {
        update(
          filesRef.current.map((f) =>
            f.localId === entryId
              ? { ...f, status: "error", error: "No file to upload." }
              : f
          )
        );
        return;
      }

      try {
        const fileId = await uploadFile(entry._file, (pct) => {
          update(
            filesRef.current.map((f) =>
              f.localId === entryId ? { ...f, progress: pct } : f
            )
          );
        });

        if (!fileId) {
          update(
            filesRef.current.map((f) =>
              f.localId === entryId
                ? {
                    ...f,
                    status: "error",
                    error: "Server did not return a file ID.",
                  }
                : f
            )
          );
          return;
        }

        update(
          filesRef.current.map((f) =>
            f.localId === entryId ? { ...f, status: "done", progress: 100, fileId } : f
          )
        );
      } catch (err) {
        update(
          filesRef.current.map((f) =>
            f.localId === entryId
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : f
          )
        );
      }
    },
    [update]
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      if (arr.length === 0) {
        return;
      }

      const remaining = Math.max(0, maxFiles - filesRef.current.length);

      if (remaining === 0) {
        return;
      }

      const toProcess = arr.slice(0, remaining);
      const newEntries: UploadedFile[] = [];

      for (const file of toProcess) {
        const err = validateFile(file);
        if (err) {
          newEntries.push({
            localId: nextId(),
            name: file.name,
            size: file.size,
            status: "error",
            progress: 0,
            error: err,
          });
        } else {
          newEntries.push({
            localId: nextId(),
            name: file.name,
            size: file.size,
            status: "uploading",
            progress: 0,
            _file: file,
          });
        }
      }

      const merged = [...filesRef.current, ...newEntries];

      update(merged);

      newEntries
        .filter((e) => e.status === "uploading")
        .forEach((e) => {
          void runUpload(e.localId);
        });
    },
    [maxFiles, update, runUpload]
  );

  const remove = (localId: string) => {
    update(filesRef.current.filter((f) => f.localId !== localId));
  };

  const retry = (localId: string) => {
    const entry = filesRef.current.find((f) => f.localId === localId);
    if (!entry) return;
    update(
      filesRef.current.map((f) =>
        f.localId === localId
          ? { ...f, status: "uploading", progress: 0, error: undefined }
          : f
      )
    );
    void runUpload(localId);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "active:bg-surface flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-8",
          dragging ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        <UploadCloud className="text-muted-foreground mb-3 h-8 w-8" />
        <p className="text-sm font-medium">Drag files here</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Up to {maxFiles} files · 50 MB each
        </p>
        <span className="border-border bg-background mt-3 inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium">
          Browse files
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.localId} className="border-border rounded-md border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {f.status === "uploading" && (
                    <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
                  )}
                  {f.status === "done" && (
                    <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
                  )}
                  {f.status === "error" && (
                    <AlertCircle className="text-danger h-4 w-4 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm" title={f.name}>
                    {f.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatBytes(f.size)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {f.status === "error" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => retry(f.localId)}
                      aria-label="Retry"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(f.localId)}
                    className="hover:bg-surface rounded p-1"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {f.status === "uploading" && (
                <Progress value={f.progress} className="mt-2" />
              )}
              {f.status === "error" && f.error && (
                <p className="text-danger mt-1 text-xs">{f.error}</p>
              )}
              {f.status === "done" && f.fileId && (
                <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                  fileId: {f.fileId.slice(0, 8)}...
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
