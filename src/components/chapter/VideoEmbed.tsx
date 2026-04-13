"use client";

import { useState } from "react";
import { PlayCircle, ExternalLink, Clock } from "lucide-react";
import { ChapterVideo } from "@/types/curriculum";
import { cn } from "@/lib/utils";

interface Props {
  video: ChapterVideo;
  extraVideos?: ChapterVideo[];
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
  onWatched,
  compact,
}: {
  video: ChapterVideo;
  onWatched?: () => void;
  compact?: boolean;
}) {
  const [clicked, setClicked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border bg-black", compact ? "aspect-video" : "")}>
      {!clicked ? (
        <button
          onClick={() => setClicked(true)}
          className="relative w-full group"
          style={{ aspectRatio: "16/9" }}
          aria-label={`Play: ${video.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="flex flex-col items-center gap-3">
              <PlayCircle className="h-16 w-16 text-white drop-shadow-lg group-hover:scale-105 transition-transform" />
              {!compact && (
                <span className="text-white text-sm font-medium drop-shadow px-4 text-center max-w-sm leading-snug">
                  {video.title}
                </span>
              )}
            </div>
          </div>
        </button>
      ) : (
        <div className="relative" style={{ aspectRatio: "16/9" }}>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => {
              setIsLoaded(true);
              setTimeout(() => onWatched?.(), 5000);
            }}
          />
        </div>
      )}

      {!compact && (
        <div className="px-3 py-2 bg-background/5 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground truncate">{video.title}</p>
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

export function VideoEmbed({ video, extraVideos, onWatched, compact = false }: Props) {
  const allVideos = [video, ...(extraVideos ?? [])];
  const [activeIdx, setActiveIdx] = useState(0);
  const active = allVideos[activeIdx];

  if (allVideos.length === 1) {
    return <SingleVideo video={video} onWatched={onWatched} compact={compact} />;
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

      <SingleVideo key={active.youtubeId} video={active} onWatched={activeIdx === 0 ? onWatched : undefined} compact={compact} />
    </div>
  );
}
