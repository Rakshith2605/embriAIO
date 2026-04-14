"use client";

import { useState } from "react";
import { ChapterVideo } from "@/types/curriculum";
import { PlayCircle, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [hovered, setHovered] = useState(false);

  const src = video.source ?? "other";
  const label = video.label ?? sourceLabels[src] ?? "Video";
  const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div
      style={{
        borderBottom: '1px solid #C8B882',
        background: '#FFFDF5',
        borderColor: hovered ? '#C0392B' : undefined,
        transition: 'border-color 0.15s',
      }}
      className="last:border-b-0"
    >
      {/* Row header */}
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Thumbnail */}
        <div className="relative shrink-0 h-12 w-20 overflow-hidden" style={{ background: '#EDE8D5' }}>
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
          <p className="font-playfair font-bold text-[13px] leading-snug truncate" style={{ color: '#1C1610' }}>
            {video.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center px-2 py-0.5 font-jetbrains text-[8.5px]"
              style={{ border: '1px solid #C8B882', background: '#EDE8D5', color: '#5C4E35' }}
            >
              {label}
            </span>
            {video.durationSeconds && (
              <span className="font-jetbrains text-[8.5px]" style={{ color: '#A08E6B' }}>
                ⏱ {formatDuration(video.durationSeconds)}
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
            className="p-1 transition-colors"
            style={{ color: '#A08E6B' }}
            title="Open on YouTube"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            style={{ color: '#A08E6B' }}
          />
        </div>
      </button>

      {/* Inline player */}
      {open && (
        <div className="px-4 pb-4">
          <div
            className="relative overflow-hidden bg-black aspect-video"
            style={{ border: '1px solid #C8B882' }}
          >
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
      <div className="flex items-center gap-4 mb-4">
        <p className="font-jetbrains text-[9.5px] tracking-[0.22em] uppercase whitespace-nowrap" style={{ color: '#A08E6B' }}>
          Videos · {all.length}
        </p>
        <div className="flex-1 h-px" style={{ background: '#C8B882', opacity: 0.5 }} />
      </div>
      <div style={{ border: '1px solid #C8B882', background: '#FFFDF5' }} className="overflow-hidden">
        {all.map((v, i) => (
          <VideoRow key={v.youtubeId} video={v} defaultOpen={i === 0 && all.length === 1} />
        ))}
      </div>
    </section>
  );
}
