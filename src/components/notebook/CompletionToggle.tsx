"use client";

import { ChapterId, CompletionStatus } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  chapterId: ChapterId;
  notebookSlug: string;
}

export function CompletionToggle({ chapterId, notebookSlug }: Props) {
  const { getNotebookStatus, markComplete, resetNotebook, isHydrated } = useProgress(chapterId);

  if (!isHydrated) return null;

  const status: CompletionStatus = getNotebookStatus(notebookSlug);
  const isComplete = status === "completed";

  return (
    <button
      onClick={() => (isComplete ? resetNotebook(notebookSlug) : markComplete(notebookSlug))}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium border transition-all",
        isComplete
          ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/20"
          : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
      )}
    >
      {isComplete ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Completed
          <RotateCcw className="h-3 w-3 opacity-60" />
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          Mark Complete
        </>
      )}
    </button>
  );
}
