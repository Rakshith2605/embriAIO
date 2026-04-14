"use client";

import { ChapterId, CompletionStatus } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";

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
      className="inline-flex items-center gap-2 px-3 py-1.5 font-jetbrains text-[10px] tracking-[0.08em] uppercase transition-all"
      style={isComplete
        ? { border: '1px solid #C0392B', color: '#C0392B', background: 'rgba(192,57,43,0.06)' }
        : { border: '1px solid #C8B882', color: '#5C4E35', background: 'transparent' }
      }
      onMouseEnter={(e) => {
        if (isComplete) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.1)';
        } else {
          (e.currentTarget as HTMLElement).style.borderColor = '#C0392B';
          (e.currentTarget as HTMLElement).style.color = '#C0392B';
        }
      }}
      onMouseLeave={(e) => {
        if (isComplete) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.06)';
        } else {
          (e.currentTarget as HTMLElement).style.borderColor = '#C8B882';
          (e.currentTarget as HTMLElement).style.color = '#5C4E35';
        }
      }}
    >
      {isComplete ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
          <RotateCcw className="h-3 w-3 opacity-60" />
        </>
      ) : (
        <>
          <Circle className="h-3.5 w-3.5" />
          Mark Complete
        </>
      )}
    </button>
  );
}
