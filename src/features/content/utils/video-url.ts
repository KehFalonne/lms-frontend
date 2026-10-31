const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com"]);

export function normalizeVideoUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
  }

  if (YOUTUBE_HOSTS.has(host)) {
    if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/live/")) {
      return url.href;
    }

    const id =
      url.searchParams.get("v") ??
      (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : null);
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
  }

  if (VIMEO_HOSTS.has(host)) {
    const id = url.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  return url.href;
}

export function isDirectVideoUrl(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin);
    return /\.(mp4|webm|ogg|mov)(?:$|[?#])/i.test(url.pathname);
  } catch {
    return false;
  }
}
