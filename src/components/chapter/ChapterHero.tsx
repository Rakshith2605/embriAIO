"use client";

import { Chapter } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { ExternalLink } from "lucide-react";
import { getGithubTreeUrl } from "@/lib/utils";

interface Props {
  chapter: Chapter;
}

export function ChapterHero({ chapter }: Props) {
  const { completedCount, totalNotebooks, percentComplete, isHydrated } = useProgress(chapter.id);
  const isComplete = isHydrated && totalNotebooks > 0 && completedCount === totalNotebooks;

  return (
    <div
      style={{
        background: '#FFFDF5',
        border: '1px solid #C8B882',
        borderLeft: '3px solid #C0392B',
      }}
      className="p-6 mb-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-jetbrains text-[9px] tracking-[0.2em] uppercase" style={{ color: '#C0392B' }}>
              § {chapter.title}
            </span>
            {chapter.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 font-jetbrains text-[9px] tracking-wide"
                style={{ border: '1px solid #C8B882', background: '#EDE8D5', color: '#5C4E35' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="font-playfair font-bold text-[26px] leading-tight mb-3"
            style={{ color: '#1C1610' }}
          >
            {chapter.subtitle}
          </h1>

          {/* Description */}
          <p
            className="font-source-serif font-light text-[14px] leading-relaxed max-w-2xl"
            style={{ color: '#5C4E35' }}
          >
            {chapter.description}
          </p>
        </div>

        {/* Progress ring */}
        {isHydrated && totalNotebooks > 0 && (
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28" cy="28" r="22"
                  fill="none"
                  stroke="#C8B882"
                  strokeWidth="4"
                />
                <circle
                  cx="28" cy="28" r="22"
                  fill="none"
                  stroke="#C0392B"
                  strokeWidth="4"
                  strokeLinecap="butt"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - percentComplete / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-jetbrains text-[10px] font-bold" style={{ color: '#C0392B' }}>
                  {percentComplete}%
                </span>
              </div>
            </div>
            <span className="font-jetbrains text-[9px]" style={{ color: isComplete ? '#C0392B' : '#A08E6B' }}>
              {isComplete ? 'Complete!' : `${completedCount}/${totalNotebooks}`}
            </span>
          </div>
        )}
      </div>

      {/* GitHub button */}
      <div className="mt-4 flex items-center gap-3">
        <a
          href={getGithubTreeUrl(chapter.githubPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-jetbrains text-[10px] tracking-[0.1em] uppercase transition-colors"
          style={{ border: '1px solid #C8B882', color: '#5C4E35' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C0392B';
            (e.currentTarget as HTMLElement).style.color = '#C0392B';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C8B882';
            (e.currentTarget as HTMLElement).style.color = '#5C4E35';
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
