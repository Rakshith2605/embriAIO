"use client";

/**
 * JupyterFrame — wraps NotebookRenderer which fetches and renders .ipynb JSON
 * directly in React (no iframe, no WASM). Falls back to Binder for execution.
 *
 * githubPath format: "ch02/01_main-chapter-code/ch02.ipynb"
 */

import { NotebookRenderer } from "./NotebookRenderer";

interface Props {
  githubPath: string;
  title: string;
  height?: string;
}

export function JupyterFrame({ githubPath, title, height }: Props) {
  // Extract chapterId (first segment) and filename (last segment)
  const parts = githubPath.split("/");
  const chapterId = parts[0].toLowerCase();
  const filename = parts.at(-1) ?? "";

  return (
    <NotebookRenderer
      chapterId={chapterId}
      filename={filename}
      githubPath={githubPath}
      title={title}
      height={height}
    />
  );
}
