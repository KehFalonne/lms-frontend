import { get, post } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

interface UploadTarget {
  fileId: string;
  uploadUrl: string;
  method: "PUT" | "POST";
  storageKey: string;
  headers: Record<string, string>;
}

/**
 * Request a presigned upload URL from the backend.
 */
async function requestUploadUrl(
  filename: string,
  sizeBytes: number,
  mimeType: string
): Promise<UploadTarget> {
  const res = await post<ApiResponse<UploadTarget>>("/files/upload-url/", {
    filename,
    sizeBytes,
    mimeType: mimeType || "application/octet-stream",
  });
  return res.data;
}

/**
 * Upload the raw file to the target URL. Uses XHR so we can report progress.
 */
function uploadToTarget(
  target: UploadTarget,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const isLocal = target.uploadUrl.startsWith("/");
    const url = isLocal ? new URL(API_BASE).origin + target.uploadUrl : target.uploadUrl;

    const xhr = new XMLHttpRequest();
    xhr.open(target.method, url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    if (isLocal) {
      const fd = new FormData();
      fd.append("file", file);
      xhr.send(fd);
    } else {
      for (const [k, v] of Object.entries(target.headers ?? {})) {
        xhr.setRequestHeader(k, v);
      }
      xhr.send(file);
    }
  });
}

/**
 * Mark the upload as complete on the backend.
 */
async function completeUpload(fileId: string): Promise<void> {
  await post("/files/complete/", { fileId });
}

/**
 * End-to-end upload: request → put → complete. Returns the backend file ID.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const target = await requestUploadUrl(file.name, file.size, file.type);
  await uploadToTarget(target, file, onProgress);
  await completeUpload(target.fileId);
  return target.fileId;
}

/**
 * Fetch a signed download URL and open it.
 */
export async function downloadFile(fileId: string): Promise<void> {
  const res = await get<ApiResponse<{ downloadUrl: string; expiresIn: number }>>(
    `/files/${fileId}/download-url/`
  );
  window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer");
}

export const FILE_LIMITS = {
  maxSizeMB: 50,
  allowedExtensions: [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "md",
    "csv",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "mp3",
    "mp4",
    "wav",
    "webm",
    "mov",
    "zip",
    "tar",
    "gz",
  ],
};

export function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!FILE_LIMITS.allowedExtensions.includes(ext)) {
    return `Extension .${ext} is not allowed.`;
  }
  if (file.size > FILE_LIMITS.maxSizeMB * 1024 * 1024) {
    return `File exceeds ${FILE_LIMITS.maxSizeMB} MB.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}
