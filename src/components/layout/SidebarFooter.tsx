"use client";

import { useOverallProgress } from "@/hooks/useProgress";
import { useProgressContext } from "@/context/ProgressContext";
import { RotateCcw, ExternalLink } from "lucide-react";

export function SidebarFooter() {
  const { completedNotebooks, percentComplete, isHydrated } = useOverallProgress();
  const { dispatch } = useProgressContext();

  return (
    <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-sidebar-foreground/70">Overall Progress</span>
          <span className="font-medium text-sidebar-foreground">
            {isHydrated ? `${percentComplete}%` : "—"}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-sidebar-border overflow-hidden">
          <div
            className="h-full rounded-full bg-sidebar-primary transition-all duration-500"
            style={{ width: isHydrated ? `${percentComplete}%` : "0%" }}
          />
        </div>
        {isHydrated && completedNotebooks > 0 && (
          <p className="text-xs text-sidebar-foreground/50">
            {completedNotebooks} notebook{completedNotebooks !== 1 ? "s" : ""} completed
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <a
          href="https://github.com/rasbt/LLMs-from-scratch"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          GitHub Repo
        </a>
        <span className="text-sidebar-border">·</span>
        <button
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) {
              dispatch({ type: "RESET_ALL" });
            }
          }}
          className="flex items-center gap-1.5 text-xs text-sidebar-foreground/60 hover:text-destructive transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
