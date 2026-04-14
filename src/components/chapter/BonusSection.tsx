"use client";

import { useState } from "react";
import { Chapter } from "@/types/curriculum";
import { getGithubTreeUrl } from "@/lib/utils";
import { ChevronDown, ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  chapter: Chapter;
}

export function BonusSection({ chapter }: Props) {
  const [open, setOpen] = useState(false);

  if (chapter.bonusFolders.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors"
        style={{ border: '1px solid #C8B882', background: '#FFFDF5' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = '#C0392B';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = '#C8B882';
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-jetbrains text-[9.5px] tracking-[0.22em] uppercase" style={{ color: '#5C4E35' }}>
            Bonus Materials
          </span>
          <span
            className="font-jetbrains text-[8.5px] px-2 py-0.5"
            style={{ border: '1px solid #C8B882', background: '#EDE8D5', color: '#8B7355' }}
          >
            {chapter.bonusFolders.length}
          </span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          style={{ color: '#A08E6B' }}
        />
      </button>

      {open && (
        <div
          className="divide-y overflow-hidden"
          style={{ border: '1px solid #C8B882', borderTop: 'none', background: '#FFFDF5', borderColor: '#C8B882' }}
        >
          {chapter.bonusFolders.map((folder) => (
            <a
              key={folder.slug}
              href={getGithubTreeUrl(folder.githubPath)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 transition-colors group"
              style={{ borderBottom: '1px solid #C8B882' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-playfair text-[13px] transition-colors"
                    style={{ color: '#1C1610' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#1C1610'; }}
                  >
                    {folder.title}
                  </span>
                  {folder.gpuRequired && (
                    <span
                      className="inline-flex items-center gap-1 font-jetbrains text-[8px] px-1.5 py-0.5"
                      style={{ border: '1px solid #C8B882', color: '#8B7355' }}
                    >
                      <AlertTriangle className="h-2.5 w-2.5" />
                      GPU
                    </span>
                  )}
                </div>
                {folder.description && (
                  <p className="font-jetbrains text-[9px] mt-0.5 leading-relaxed" style={{ color: '#A08E6B' }}>
                    {folder.description}
                  </p>
                )}
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#A08E6B' }} />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
