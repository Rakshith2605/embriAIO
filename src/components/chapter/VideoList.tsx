"use client";

import { useState } from "react";
import { ChapterVideo } from "@/types/curriculum";
import { PlayCircle, ChevronDown, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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

function VideoRow({ video, defaultOpen = false }: { video: ChapterVideo; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [loaded, setLoaded] = useState(false);

  const src = video.source ?? "other";
  const badgeStyle = sourceStyles[src] ?? sourceStyles.other;
  const label = video.label ?? sourceLabels[src] ?? "Video";
  const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div className="border-b border-border last:border-0">
      {/* Row header — click to toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-left group"
      >
        {/* Thumbnail */}
        <div className="relative shrink-0 h-12 w-20 rounded-md overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbUrl}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <PlayCircle className="h-5 w-5 text-white drop-shadow" />
          </div>
        </div>

        {/* Title + badges */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug truncate">
            {video.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", badgeStyle)}>
              {label}
            </span>
            {video.durationSeconds && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(video.durationSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Open on YouTube"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Inline player */}
      {open && (
        <div className="px-4 pb-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
            )}
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  video?: ChapterVideo;
  extraVideos?: ChapterVideo[];
}

export function VideoList({ video, extraVideos }: Props) {
  const all = [
    ...(video ? [video] : []),
    ...(extraVideos ?? []),
  ];

  if (all.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">
        Videos <span className="text-muted-foreground font-normal text-sm">({all.length})</span>
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        {all.map((v, i) => (
          <VideoRow key={v.youtubeId} video={v} defaultOpen={i === 0 && all.length === 1} />
        ))}
      </div>
    </section>
  );
}
