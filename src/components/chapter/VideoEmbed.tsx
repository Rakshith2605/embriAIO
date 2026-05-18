"use client";

import { useState } from "react";
import { ExternalLink, Clock } from "lucide-react";
import { ChapterVideo, ChapterId } from "@/types/curriculum";
import { cn } from "@/lib/utils";
import { YouTubePlayer } from "@/components/video/YouTubePlayer";

interface Props {
  video: ChapterVideo;
  extraVideos?: ChapterVideo[];
  chapterId: ChapterId;
  onWatched?: () => void;
  compact?: boolean;
}

const sourceStyles: Record<string, string> = {
  raschka:      "bg-primary/10 text-primary border-primary/20",
  workshop:     "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  freecodecamp: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  other:        "bg-muted text-muted-foreground border-border",
};

const sourceLabels: Record<string, string> = {
  raschka:      "Raschka",
  workshop:     "Workshop",
  freecodecamp: "freeCodeCamp",
  other:        "Video",
};

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function SingleVideo({
  video,
  chapterId,
  onWatched,
  compact,
}: {
  video: ChapterVideo;
  chapterId: ChapterId;
  onWatched?: () => void;
  compact?: boolean;
}) {
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border bg-black", compact ? "aspect-video" : "")}>
      <YouTubePlayer
        videoId={video.youtubeId}
        title={video.title}
        chapterId={chapterId}
        onComplete={onWatched}
        compact={compact}
      />

      {!compact && (
        <div className="px-3 py-2 bg-background/5 flex items-center justify-end gap-2">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Open on YouTube"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

export function VideoEmbed({ video, extraVideos, chapterId, onWatched, compact = false }: Props) {
  const allVideos = [video, ...(extraVideos ?? [])];
  const [activeIdx, setActiveIdx] = useState(0);
  const active = allVideos[activeIdx];

  if (allVideos.length === 1) {
    return <SingleVideo video={video} chapterId={chapterId} onWatched={onWatched} compact={compact} />;
  }

  return (
    <div className="space-y-2">
      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2">
        {allVideos.map((v, i) => {
          const src = v.source ?? "other";
          const style = sourceStyles[src] ?? sourceStyles.other;
          const label = v.label ?? sourceLabels[src] ?? "Video";
          return (
            <button
              key={v.youtubeId}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                i === activeIdx
                  ? style + " ring-2 ring-offset-1 ring-offset-background ring-current"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {label}
              {v.durationSeconds && (
                <span className="flex items-center gap-0.5 opacity-70">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDuration(v.durationSeconds)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <SingleVideo key={active.youtubeId} video={active} chapterId={chapterId} onWatched={activeIdx === 0 ? onWatched : undefined} compact={compact} />
    </div>
  );
}
