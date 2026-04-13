"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ChapterError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <AlertTriangle className="h-12 w-12 text-destructive/50" />
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/chapter/ch01"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
