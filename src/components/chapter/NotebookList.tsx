"use client";

import Link from "next/link";
import { Chapter, CompletionStatus } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Circle, Clock, BookOpen,
  Dumbbell, Star, FileCode2, ArrowRight, Timer,
} from "lucide-react";

const typeConfig = {
  main:         { label: "Main",         icon: BookOpen,   className: "bg-primary/10 text-primary border-primary/20" },
  exercise:     { label: "Exercises",    icon: Dumbbell,   className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  bonus:        { label: "Bonus",        icon: Star,       className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  supplemental: { label: "Supplemental", icon: FileCode2,  className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
};

const statusConfig: Record<CompletionStatus, { icon: typeof Circle; dotClass: string }> = {
  not_started: { icon: Circle,       dotClass: "text-muted-foreground/40" },
  in_progress: { icon: Clock,        dotClass: "text-yellow-500" },
  completed:   { icon: CheckCircle2, dotClass: "text-green-500" },
};

interface Props {
  chapter: Chapter;
}

export function NotebookList({ chapter }: Props) {
  const { getNotebookStatus, isHydrated } = useProgress(chapter.id);

  if (!chapter.hasCode || chapter.mainNotebooks.length === 0) return null;

  const baseHref = chapter.id.startsWith("appendix")
    ? `/appendix/${chapter.id}`
    : `/chapter/${chapter.id}`;

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">
        Notebooks <span className="text-muted-foreground font-normal text-sm">({chapter.mainNotebooks.length})</span>
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {chapter.mainNotebooks.map((nb, i) => {
          const status: CompletionStatus = isHydrated ? getNotebookStatus(nb.slug) : "not_started";
          const typeInfo = typeConfig[nb.type];
          const TypeIcon = typeInfo.icon;
          const { icon: StatusIcon, dotClass } = statusConfig[status];

          return (
            <Link
              key={nb.slug}
              href={`${baseHref}/notebook/${nb.slug}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40 transition-colors group",
                i < chapter.mainNotebooks.length - 1 && "border-b border-border",
                status === "completed" && "bg-green-500/5 hover:bg-green-500/10"
              )}
            >
              {/* Status icon */}
              <StatusIcon className={cn("h-4 w-4 shrink-0", dotClass)} />

              {/* Type badge */}
              <span
                className={cn(
                  "hidden sm:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0",
                  typeInfo.className
                )}
              >
                <TypeIcon className="h-2.5 w-2.5" />
                {typeInfo.label}
              </span>

              {/* Title + description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {nb.title}
                </p>
                {nb.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {nb.description}
                  </p>
                )}
              </div>

              {/* Time estimate */}
              {nb.estimatedMinutes && (
                <span className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <Timer className="h-3 w-3" />
                  ~{nb.estimatedMinutes}m
                </span>
              )}

              {/* Arrow */}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
