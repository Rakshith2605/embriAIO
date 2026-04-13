"use client";

import { Chapter } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { getGithubTreeUrl } from "@/lib/utils";

const colorMap: Record<string, string> = {
  violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
  blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
  orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
  yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20",
  green: "from-green-500/20 to-green-500/5 border-green-500/20",
  pink: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
  red: "from-red-500/20 to-red-500/5 border-red-500/20",
  slate: "from-slate-500/20 to-slate-500/5 border-slate-500/20",
  purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
};

const ringMap: Record<string, string> = {
  violet: "text-violet-500",
  blue: "text-blue-500",
  cyan: "text-cyan-500",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
  pink: "text-pink-500",
  red: "text-red-500",
  slate: "text-slate-500",
  purple: "text-purple-500",
};

interface Props {
  chapter: Chapter;
}

export function ChapterHero({ chapter }: Props) {
  const { completedCount, totalNotebooks, percentComplete, isHydrated } = useProgress(chapter.id);
  const gradient = colorMap[chapter.color] ?? colorMap.violet;
  const accent = ringMap[chapter.color] ?? ringMap.violet;
  const isComplete = isHydrated && totalNotebooks > 0 && completedCount === totalNotebooks;

  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-6 mb-6", gradient)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {chapter.title}
            </span>
            {chapter.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-background/60 text-muted-foreground border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">{chapter.subtitle}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{chapter.description}</p>
        </div>

        {isHydrated && totalNotebooks > 0 && (
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - percentComplete / 100)}`}
                  className={cn("transition-all duration-700", accent)}
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-xs font-bold", accent)}>{percentComplete}%</span>
              </div>
            </div>
            <span className={cn("text-[10px] font-medium", isComplete ? "text-green-500" : "text-muted-foreground")}>
              {isComplete ? "Complete!" : `${completedCount}/${totalNotebooks}`}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <a
          href={getGithubTreeUrl(chapter.githubPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-background/60 hover:bg-background/80 border border-border transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
