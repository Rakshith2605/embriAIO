"use client";

import { ChapterId } from "@/types/curriculum";
import { YouTubePlayer } from "@/components/video/YouTubePlayer";

interface CourseVideo {
  id: string;
  title: string;
  platform: string;
  embed_url: string | null;
  video_url: string | null;
  youtube_id: string | null;
}

interface Props {
  videos: CourseVideo[];
  chapterId: ChapterId;
  courseId: string;
}

export function CourseVideoSection({ videos, chapterId, courseId }: Props) {
  if (videos.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <p className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: "#A08E6B" }}>
          § Videos
        </p>
        <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
      </div>
      <div className="space-y-6">
        {videos.map((v) => {
          if (v.youtube_id) {
            return (
              <div key={v.id}>
                <p className="font-playfair font-bold text-[15px] mb-2" style={{ color: "#1C1610" }}>
                  {v.title}
                </p>
                <div
                  className="w-full overflow-hidden"
                  style={{ border: "1px solid #C8B882" }}
                >
                  <YouTubePlayer
                    videoId={v.youtube_id ?? ""}
                    title={v.title}
                    chapterId={chapterId}
                    courseId={courseId}
                    dbVideoId={v.id}
                  />
                </div>
              </div>
            );
          }

          const embedSrc = v.embed_url
            ?? (v.video_url ? `https://www.youtube.com/embed/${v.video_url.split("v=")[1] ?? v.video_url}` : null);

          return (
            <div key={v.id}>
              <p className="font-playfair font-bold text-[15px] mb-2" style={{ color: "#1C1610" }}>
                {v.title}
              </p>
              {embedSrc ? (
                <div
                  className="relative w-full overflow-hidden"
                  style={{ border: "1px solid #C8B882", aspectRatio: "16/9" }}
                >
                  <iframe
                    src={embedSrc}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts allow-popups"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : v.video_url ? (
                <a
                  href={v.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5]"
                  style={{ border: "1px solid #C8B882", color: "#C0392B" }}
                >
                  Watch on {v.platform === "youtube" ? "YouTube" : v.platform} →
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
