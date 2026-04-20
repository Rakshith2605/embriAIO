"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Video, FileCode, BookOpen } from "lucide-react";

interface SidebarChapter {
  id: string;
  title: string;
  order: number;
  videoCount: number;
  notebookCount: number;
  paperCount: number;
}

interface CourseSidebarData {
  title: string;
  slug: string;
  accentColor: string | null;
  chapters: SidebarChapter[];
}

const accentColors: Record<string, string> = {
  violet: "#7C3AED", blue: "#2563EB", orange: "#EA580C", emerald: "#059669",
  cyan: "#0891B2", pink: "#DB2777", yellow: "#CA8A04", red: "#DC2626",
  indigo: "#4F46E5", teal: "#0D9488",
};

export function CourseSidebar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const [data, setData] = useState<CourseSidebarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/courses/by-slug/${encodeURIComponent(slug)}/sidebar`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CourseSidebarData | null) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="px-4 py-2 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-6 rounded animate-pulse"
            style={{ background: "rgba(200,184,130,0.3)" }}
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const accent = accentColors[data.accentColor ?? ""] ?? "#C0392B";

  // Extract current chapterId from URL: /course/{slug}/{chapterId}
  const segments = pathname.split("/");
  const activeChapterId = segments.length >= 4 ? segments[3] : null;

  return (
    <>
      <div className="px-4 pb-2">
        <Link
          href={`/course/${data.slug}`}
          className="font-playfair font-bold text-[13px] leading-tight hover:underline"
          style={{ color: "#1C1610" }}
        >
          {data.title}
        </Link>
      </div>

      <p
        className="px-4 pb-1 font-jetbrains text-[8.5px] tracking-[0.2em] uppercase"
        style={{ color: "#A08E6B" }}
      >
        Chapters
      </p>

      {data.chapters.map((ch, idx) => {
        const isActive = ch.id === activeChapterId;
        return (
          <Link
            key={ch.id}
            href={`/course/${data.slug}/${ch.id}`}
            className="flex items-start gap-2 px-4 py-1.5 transition-colors group"
            style={{
              background: isActive ? "rgba(192,57,43,0.08)" : undefined,
              borderLeft: isActive ? `2px solid ${accent}` : "2px solid transparent",
            }}
          >
            <span
              className="font-jetbrains text-[9px] tracking-wider shrink-0 pt-0.5"
              style={{ color: isActive ? accent : "#A08E6B" }}
            >
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="font-source-serif text-[12.5px] leading-snug truncate"
                style={{
                  color: isActive ? "#1C1610" : "#5C4E35",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {ch.title}
              </p>
              {(ch.videoCount > 0 || ch.notebookCount > 0 || ch.paperCount > 0) && (
                <div
                  className="flex gap-2 mt-0.5 font-jetbrains text-[8px] uppercase tracking-wider"
                  style={{ color: "#A08E6B" }}
                >
                  {ch.videoCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Video className="h-2.5 w-2.5" /> {ch.videoCount}
                    </span>
                  )}
                  {ch.notebookCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <FileCode className="h-2.5 w-2.5" /> {ch.notebookCount}
                    </span>
                  )}
                  {ch.paperCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <BookOpen className="h-2.5 w-2.5" /> {ch.paperCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </>
  );
}
