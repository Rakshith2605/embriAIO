"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CourseDefinition } from "@/lib/courses";

function readProgress(key: string, total: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const state = JSON.parse(raw) as { notebooks?: Record<string, string> };
    const done = Object.values(state.notebooks ?? {}).filter((s) => s === "completed").length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  } catch {
    return 0;
  }
}

export function CourseCard({ course }: { course: CourseDefinition }) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (course.progressLocalStorageKey && course.totalNotebooks) {
      setProgress(readProgress(course.progressLocalStorageKey, course.totalNotebooks));
    }
  }, [course.progressLocalStorageKey, course.totalNotebooks]);

  const available = course.status === "available" || course.status === "beta";

  const inner = (
    <div
      style={
        available
          ? { border: '1px solid #C8B882', background: '#FFFDF5', transition: 'border-color 0.2s' }
          : { border: '1px dashed #C8B882', background: 'rgba(255,253,245,0.6)' }
      }
      className={`group flex flex-col gap-3 p-5 rounded-none ${available ? 'hover:border-pg-rust cursor-pointer' : 'opacity-75 cursor-default'}`}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-playfair font-bold text-[22px] text-pg-ink leading-snug">
          {course.title}
        </h3>
        {!available && (
          <span className="shrink-0 font-jetbrains text-[10px] tracking-widest uppercase text-pg-faint pt-1">
            Soon
          </span>
        )}
      </div>

      {/* Metadata line */}
      <p className="font-jetbrains text-[11px] text-pg-faint tracking-wide">
        {[
          course.chapters ? `${course.chapters} chapters` : null,
          course.videos   ? `${course.videos} videos`   : null,
          course.notebooks ? `${course.notebooks} notebooks` : null,
        ]
          .filter(Boolean)
          .join('  ·  ')}
      </p>

      {/* Progress bar */}
      {available && progress !== null && progress > 0 && (
        <div className="space-y-1 mt-1">
          <div className="h-0.5 bg-pg-gold/30 overflow-hidden w-full">
            <div
              className="h-full bg-pg-rust transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-jetbrains text-[10px] text-pg-faint">{progress}% complete</p>
        </div>
      )}

      {/* Arrow */}
      {available && (
        <div className="flex justify-end mt-1">
          <span
            className="font-jetbrains text-[16px] text-pg-rust group-hover:translate-x-0.5 transition-transform inline-block"
            aria-hidden
          >
            →
          </span>
        </div>
      )}
    </div>
  );

  return available ? <Link href={course.href}>{inner}</Link> : <div>{inner}</div>;
}
