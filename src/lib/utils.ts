import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatProgress(completed: number, total: number): string {
  if (total === 0) return "No notebooks";
  if (completed === 0) return "Not started";
  if (completed === total) return "Completed";
  return `${completed} / ${total} done`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getGithubRawUrl(githubPath: string): string {
  return `https://raw.githubusercontent.com/rasbt/LLMs-from-scratch/main/${githubPath}`;
}

export function getGithubUrl(githubPath: string): string {
  return `https://github.com/rasbt/LLMs-from-scratch/blob/main/${githubPath}`;
}

export function getGithubTreeUrl(githubPath: string): string {
  return `https://github.com/rasbt/LLMs-from-scratch/tree/main/${githubPath}`;
}
