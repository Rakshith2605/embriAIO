"use client";

import { ExternalLink, FileCode } from "lucide-react";

interface Props {
  title: string;
  colabUrl: string;
  description?: string;
}

export function ColabEmbed({ title, colabUrl, description }: Props) {
  return (
    <div
      style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
      className="p-4 flex items-start gap-4 group hover:shadow-sm transition-shadow"
    >
      {/* Colab icon area */}
      <div
        className="shrink-0 flex items-center justify-center w-10 h-10"
        style={{ background: "#F4E8C1", border: "1px solid #C8B882" }}
      >
        <FileCode className="h-5 w-5" style={{ color: "#C0392B" }} />
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
        <a
          href={colabUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-jetbrains text-[11px] tracking-wide uppercase"
          style={{ color: "#C0392B" }}
        >
          Open in Google Colab
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
