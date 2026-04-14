"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Chapter } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { SidebarNotebookItem } from "./SidebarNotebookItem";
import { cn } from "@/lib/utils";

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

  // All videos for this chapter
  const allVideos = [
    ...(chapter.video ? [chapter.video] : []),
    ...(chapter.extraVideos ?? []),
  ];

  // Extract chapter number label from chapter.title or use order
  const chapterLabel = chapter.title;

  return (
    <div>
      {/* Chapter row button */}
      <button
        onClick={() => { setIsOpen((o) => !o); }}
        style={{
          borderLeft: isActiveChapter ? '2px solid #C0392B' : '2px solid transparent',
          background: isActiveChapter ? 'rgba(192,57,43,0.06)' : 'transparent',
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"
        onMouseEnter={(e) => {
          if (!isActiveChapter) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.04)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActiveChapter) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }
        }}
      >
        {/* Chapter number label */}
        <Link
          href={baseHref}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-start gap-2 min-w-0"
        >
          <span className="font-jetbrains text-[9px] shrink-0 mt-0.5" style={{ color: '#A08E6B' }}>
            {chapterLabel.split(':')[0]?.trim() ?? chapterLabel}
          </span>
          <div className="flex-1 min-w-0">
            <span
              className={cn("font-playfair text-[12px] leading-snug truncate block", isActiveChapter && "italic")}
              style={{ color: isActiveChapter ? '#C0392B' : '#1C1610' }}
            >
              {chapter.subtitle}
            </span>
          </div>
        </Link>

        {/* Progress count + chevron */}
        <div className="flex items-center gap-1 shrink-0">
          {isHydrated && totalNotebooks > 0 && (
            <span className="font-jetbrains text-[8px]" style={{ color: '#A08E6B' }}>
              {completedCount}/{totalNotebooks}
            </span>
          )}
          <ChevronRight
            className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")}
            style={{ color: '#A08E6B' }}
          />
        </div>
      </button>

      {/* Progress bar */}
      {isHydrated && totalNotebooks > 0 && percentComplete > 0 && (
        <div className="h-[3px] overflow-hidden" style={{ background: 'rgba(200,184,130,0.3)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${percentComplete}%`, background: '#C0392B' }}
          />
        </div>
      )}

      {/* Expanded content */}
      {isOpen && (
        <div className="ml-0 mt-0.5 pb-1">
          {/* Videos */}
          {allVideos.map((v) => (
            <Link
              key={v.youtubeId}
              href={baseHref}
              className="flex items-center gap-1.5 py-1 pl-8 pr-4 transition-colors group/video"
              style={{ color: '#5C4E35' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#C0392B';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#5C4E35';
              }}
            >
              <span className="font-jetbrains text-[9px] shrink-0" style={{ color: '#C0392B' }}>↳</span>
              <span className="font-jetbrains text-[9px] truncate leading-snug">{v.title}</span>
            </Link>
          ))}

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
