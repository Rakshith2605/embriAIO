import { VideoPlatform } from "@/types/user-course";

export interface ParsedVideo {
  platform: VideoPlatform;
  videoId: string;
  embedUrl: string;
}

/* ───── YouTube ───────────────────────────────────────── */

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
  /youtube\.com\/shorts\/([\w-]{11})/,
];

function parseYouTube(url: string): ParsedVideo | null {
  for (const pattern of YT_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        platform: "youtube",
        videoId: match[1],
        embedUrl: `https://www.youtube-nocookie.com/embed/${match[1]}`,
      };
    }
  }
  return null;
}

/* ───── PeerTube ──────────────────────────────────────── */

// PeerTube instances use /w/{shortId} or /videos/watch/{uuid}
const PEERTUBE_PATTERNS = [
  /^https?:\/\/([\w.-]+)\/w\/([\w-]+)/,
  /^https?:\/\/([\w.-]+)\/videos\/watch\/([\w-]+)/,
];

// Known PeerTube instances (can be extended)
const KNOWN_PEERTUBE_HOSTS = new Set([
  "framatube.org",
  "videos.lecturesmedia.com",
  "peertube.social",
  "tilvids.com",
  "diode.zone",
  "tube.tchncs.de",
  "video.liberta.vip",
  "skeptikon.fr",
]);

function parsePeerTube(url: string): ParsedVideo | null {
  for (const pattern of PEERTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1] && match?.[2]) {
      const host = match[1];
      const videoId = match[2];
      // Only allow known PeerTube hosts to prevent abuse
      if (KNOWN_PEERTUBE_HOSTS.has(host)) {
        return {
          platform: "peertube",
          videoId,
          embedUrl: `https://${host}/videos/embed/${videoId}`,
        };
      }
    }
  }
  return null;
}

/* ───── Main parser ───────────────────────────────────── */

/**
 * Parse a video URL and return platform info + embed URL.
 * Returns null if the URL is not a recognized video platform.
 * Only accepts HTTPS URLs.
 */
export function parseVideoUrl(url: string): ParsedVideo | null {
  const trimmed = url.trim();

  // Must be HTTPS
  if (!trimmed.startsWith("https://")) return null;

  // Try YouTube first (most common)
  const yt = parseYouTube(trimmed);
  if (yt) return yt;

  // Try PeerTube
  const pt = parsePeerTube(trimmed);
  if (pt) return pt;

  return null;
}

/**
 * Get a thumbnail URL for a parsed video.
 */
export function getVideoThumbnail(parsed: ParsedVideo): string | null {
  if (parsed.platform === "youtube") {
    return `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
  }
  // PeerTube doesn't have a reliable public thumbnail pattern
  return null;
}
