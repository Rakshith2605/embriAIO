"use client";

import Link from "next/link";
import { Notebook, ChapterId, CompletionStatus } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, BookOpen, Dumbbell, Star, FileCode2, ArrowRight, Timer } from "lucide-react";

const typeConfig = {
  main: { label: "Main", icon: BookOpen, className: "bg-primary/10 text-primary border-primary/20" },
  exercise: { label: "Exercises", icon: Dumbbell, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  bonus: { label: "Bonus", icon: Star, className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  supplemental: { label: "Supplemental", icon: FileCode2, className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
};

const statusConfig = {
  not_started: { icon: Circle, className: "text-muted-foreground/40" },
  in_progress: { icon: Clock, className: "text-yellow-500" },
  completed: { icon: CheckCircle2, className: "text-green-500" },
};

interface Props {
  notebook: Notebook;
  chapterId: ChapterId;
  href: string;
}

export function NotebookCard({ notebook, chapterId, href }: Props) {
  const { getNotebookStatus, isHydrated } = useProgress(chapterId);
  const status: CompletionStatus = isHydrated ? getNotebookStatus(notebook.slug) : "not_started";

  const typeInfo = typeConfig[notebook.type];
  const TypeIcon = typeInfo.icon;
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-ring/50",
        status === "completed" && "border-green-500/20 bg-green-500/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
            typeInfo.className
          )}
        >
          <TypeIcon className="h-3 w-3" />
          {typeInfo.label}
        </span>
        <StatusIcon className={cn("h-4 w-4 shrink-0 mt-0.5", statusInfo.className)} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
          {notebook.title}
        </h3>
        {notebook.description && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notebook.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        {notebook.estimatedMinutes ? (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Timer className="h-3 w-3" />
            ~{notebook.estimatedMinutes} min
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-[11px] text-primary font-medium group-hover:gap-2 transition-all">
          {status === "completed" ? "Review" : "Open"}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
