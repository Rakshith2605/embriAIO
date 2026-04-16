export interface ParsedColab {
  fileId: string;
  type: "drive" | "github";
  openUrl: string;
}

/* ───── Colab URL patterns ────────────────────────────── */

const COLAB_DRIVE_PATTERN =
  /^https?:\/\/colab\.research\.google\.com\/drive\/([\w-]+)/;

const COLAB_GITHUB_PATTERN =
  /^https?:\/\/colab\.research\.google\.com\/github\/(.+)/;

/**
 * Parse and validate a Google Colab URL.
 * Accepts drive links and github-backed links.
 * Returns null for invalid URLs.
 */
export function parseColabUrl(url: string): ParsedColab | null {
  const trimmed = url.trim();

  // Drive-based Colab link
  const driveMatch = trimmed.match(COLAB_DRIVE_PATTERN);
  if (driveMatch?.[1]) {
    return {
      fileId: driveMatch[1],
      type: "drive",
      openUrl: `https://colab.research.google.com/drive/${driveMatch[1]}`,
    };
  }

  // GitHub-backed Colab link
  const githubMatch = trimmed.match(COLAB_GITHUB_PATTERN);
  if (githubMatch?.[1]) {
    return {
      fileId: githubMatch[1],
      type: "github",
      openUrl: `https://colab.research.google.com/github/${githubMatch[1]}`,
    };
  }

  return null;
}

/**
 * Step-by-step instructions for setting up Colab sharing.
 * Displayed in the UI as a reminder banner.
 */
export const COLAB_SHARING_INSTRUCTIONS = {
  title: "Required: Set Colab Sharing Permissions",
  steps: [
    "Open your notebook in Google Colab",
    'Click the "Share" button (top-right)',
    'Under "General access", select "Anyone with the link"',
    'Set the permission to "Viewer"',
    "Copy the link and paste it here",
  ],
  warning:
    "If the notebook is not shared publicly, other users will see an access denied error when they try to open it.",
} as const;
