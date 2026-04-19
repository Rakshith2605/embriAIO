"use client";

import { ExternalLink, BookOpen, Headphones } from "lucide-react";

interface Props {
  title: string;
  url: string;
  description?: string;
}

export function PaperCard({ title, url, description }: Props) {
  const notebookLmUrl = `https://notebooklm.google.com/notebook/new?pli=1&sourceUrl=${encodeURIComponent(url)}`;

  return (
    <div
      style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
      className="p-4 flex items-start gap-4 group hover:shadow-sm transition-shadow"
    >
      {/* Paper icon */}
      <div
        className="shrink-0 flex items-center justify-center w-10 h-10"
        style={{ background: "#F4E8C1", border: "1px solid #C8B882" }}
      >
        <BookOpen className="h-5 w-5" style={{ color: "#C0392B" }} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-playfair font-bold text-[15px] leading-snug mb-0.5"
          style={{ color: "#1C1610" }}
        >
          {title}
        </p>
        {description && (
          <p
            className="font-source-serif text-[13px] leading-relaxed mb-2 line-clamp-2"
            style={{ color: "#5C4E35" }}
          >
            {description}
          </p>
        )}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-jetbrains text-[11px] tracking-wide uppercase"
            style={{ color: "#C0392B" }}
          >
            Read Paper
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={notebookLmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 font-jetbrains text-[10px] tracking-wide uppercase transition-colors hover:opacity-80"
            style={{ background: "#1C1610", color: "#F7F2E7" }}
          >
            <Headphones className="h-3 w-3" />
            Listen with NotebookLM
          </a>
        </div>
      </div>
    </div>
  );
}
