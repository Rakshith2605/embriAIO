"use client";

import { useState } from "react";
import { Chapter } from "@/types/curriculum";
import { getGithubTreeUrl } from "@/lib/utils";
import { ChevronDown, ExternalLink, Zap, AlertTriangle } from "lucide-react";
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
        className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="font-semibold text-sm text-foreground">
            Bonus Materials
          </span>
          <span className="text-xs rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 px-2 py-0.5">
            {chapter.bonusFolders.length}
          </span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {chapter.bonusFolders.map((folder) => (
            <a
              key={folder.slug}
              href={getGithubTreeUrl(folder.githubPath)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-accent/40 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {folder.title}
                  </span>
                  {folder.gpuRequired && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      GPU
                    </span>
                  )}
                </div>
                {folder.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {folder.description}
                  </p>
                )}
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
