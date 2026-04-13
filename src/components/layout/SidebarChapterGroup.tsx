"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, BookOpen, Code2, PlayCircle } from "lucide-react";
import { Chapter } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { SidebarNotebookItem } from "./SidebarNotebookItem";
import { cn } from "@/lib/utils";

const sourceColors: Record<string, string> = {
  raschka:      "text-primary/70",
  workshop:     "text-violet-400",
  freecodecamp: "text-orange-400",
  other:        "text-sidebar-foreground/50",
};

interface Props {
  chapter: Chapter;
}

export function SidebarChapterGroup({ chapter }: Props) {
  const pathname = usePathname();
  const baseHref = chapter.id.startsWith("appendix")
    ? `/appendix/${chapter.id}`
    : `/chapter/${chapter.id}`;
  const isActiveChapter = pathname.startsWith(baseHref);

  const [isOpen, setIsOpen] = useState(isActiveChapter);
  const { completedCount, totalNotebooks, percentComplete, getNotebookStatus, isHydrated } =
    useProgress(chapter.id);

  const isComplete = isHydrated && totalNotebooks > 0 && completedCount === totalNotebooks;

  // All videos for this chapter
  const allVideos = [
    ...(chapter.video ? [chapter.video] : []),
    ...(chapter.extraVideos ?? []),
  ];

  return (
    <div className="px-2">
      {/* Chapter row: link + toggle chevron */}
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg transition-colors group",
          isActiveChapter
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        )}
      >
        <Link
          href={baseHref}
          className="flex-1 flex items-center gap-2 px-2 py-2 min-w-0"
        >
          {chapter.hasCode ? (
            <Code2 className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
          ) : (
            <BookOpen className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium truncate">{chapter.title}</span>
              {isHydrated && totalNotebooks > 0 && (
                <span className={cn("text-[10px] shrink-0", isComplete ? "text-green-400" : "text-sidebar-foreground/40")}>
                  {completedCount}/{totalNotebooks}
                </span>
              )}
            </div>
            <p className="text-[10px] text-sidebar-foreground/50 truncate leading-tight">
              {chapter.subtitle}
            </p>
          </div>
        </Link>

        {/* Chevron toggle — separate button so clicking title navigates */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="shrink-0 p-2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          <ChevronRight
            className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")}
          />
        </button>
      </div>

      {/* Progress bar */}
      {isHydrated && totalNotebooks > 0 && percentComplete > 0 && (
        <div className="mx-2 mt-0.5 mb-1 h-0.5 rounded-full bg-sidebar-border overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isComplete ? "bg-green-400" : "bg-sidebar-primary"
            )}
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      )}

      {/* Expanded content */}
      {isOpen && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3 pb-2">
          {/* Videos */}
          {allVideos.map((v) => {
            const src = v.source ?? "other";
            const colorClass = sourceColors[src] ?? sourceColors.other;
            return (
              <Link
                key={v.youtubeId}
                href={baseHref}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors group/video",
                  pathname === baseHref
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <PlayCircle className={cn("h-3.5 w-3.5 shrink-0", colorClass)} />
                <span className="truncate leading-snug">{v.title}</span>
              </Link>
            );
          })}

          {/* Notebooks */}
          {chapter.mainNotebooks.map((nb) => {
            const href = chapter.id.startsWith("appendix")
              ? `/appendix/${chapter.id}/notebook/${nb.slug}`
              : `/chapter/${chapter.id}/notebook/${nb.slug}`;
            return (
              <SidebarNotebookItem
                key={nb.slug}
                href={href}
                label={nb.title}
                status={isHydrated ? getNotebookStatus(nb.slug) : "not_started"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
