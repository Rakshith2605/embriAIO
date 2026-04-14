"use client";

import Link from "next/link";
import { Chapter, CompletionStatus } from "@/types/curriculum";
import { useProgress } from "@/hooks/useProgress";
import {
  CheckCircle2, Circle, Clock, BookOpen,
  Dumbbell, Star, FileCode2, ArrowRight, Timer,
} from "lucide-react";

const typeConfig = {
  main:         { label: "Main",         icon: BookOpen  },
  exercise:     { label: "Exercises",    icon: Dumbbell  },
  bonus:        { label: "Bonus",        icon: Star      },
  supplemental: { label: "Supplemental", icon: FileCode2 },
};

const statusConfig: Record<CompletionStatus, { icon: typeof Circle; color: string }> = {
  not_started: { icon: Circle,       color: '#A08E6B' },
  in_progress: { icon: Clock,        color: '#C0392B' },
  completed:   { icon: CheckCircle2, color: '#C0392B' },
};

interface Props {
  chapter: Chapter;
}

export function NotebookList({ chapter }: Props) {
  const { getNotebookStatus, isHydrated } = useProgress(chapter.id);

  if (!chapter.hasCode || chapter.mainNotebooks.length === 0) return null;

  const baseHref = chapter.id.startsWith("appendix")
    ? `/appendix/${chapter.id}`
    : `/chapter/${chapter.id}`;

  return (
    <section>
      <div className="flex items-center gap-4 mb-4">
        <p className="font-jetbrains text-[9.5px] tracking-[0.22em] uppercase whitespace-nowrap" style={{ color: '#A08E6B' }}>
          Notebooks · {chapter.mainNotebooks.length}
        </p>
        <div className="flex-1 h-px" style={{ background: '#C8B882', opacity: 0.5 }} />
      </div>
      <div style={{ border: '1px solid #C8B882', background: '#FFFDF5' }} className="overflow-hidden">
        {chapter.mainNotebooks.map((nb, i) => {
          const status: CompletionStatus = isHydrated ? getNotebookStatus(nb.slug) : "not_started";
          const typeInfo = typeConfig[nb.type];
          const TypeIcon = typeInfo.icon;
          const { icon: StatusIcon, color: statusColor } = statusConfig[status];

          return (
            <Link
              key={nb.slug}
              href={`${baseHref}/notebook/${nb.slug}`}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors group"
              style={{
                borderBottom: i < chapter.mainNotebooks.length - 1 ? '1px solid #C8B882' : 'none',
                background: status === 'completed' ? 'rgba(192,57,43,0.04)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  status === 'completed' ? 'rgba(192,57,43,0.04)' : 'transparent';
              }}
            >
              {/* Status icon */}
              <StatusIcon className="h-4 w-4 shrink-0" style={{ color: statusColor }} />

              {/* Type badge */}
              <span
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 font-jetbrains text-[8.5px] shrink-0"
                style={{ border: '1px solid #C8B882', background: '#EDE8D5', color: '#5C4E35' }}
              >
                <TypeIcon className="h-2.5 w-2.5" />
                {typeInfo.label}
              </span>

              {/* Title + description */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-playfair text-[13px] truncate transition-colors"
                  style={{ color: '#1C1610' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#1C1610'; }}
                >
                  {nb.title}
                </p>
                {nb.description && (
                  <p className="font-jetbrains text-[9px] truncate mt-0.5" style={{ color: '#A08E6B' }}>
                    {nb.description}
                  </p>
                )}
              </div>

              {/* Time estimate */}
              {nb.estimatedMinutes && (
                <span className="hidden md:flex items-center gap-1 font-jetbrains text-[9px] shrink-0" style={{ color: '#A08E6B' }}>
                  <Timer className="h-3 w-3" />
                  ~{nb.estimatedMinutes}m
                </span>
              )}

              {/* Arrow */}
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-all group-hover:translate-x-0.5" style={{ color: '#C0392B' }} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
