"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CourseDefinition } from "@/lib/courses";
import { cn } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";

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

  // Derive a border-left color class from the accentColor (text-X-400 → border-X-400)
  const accentBorder = course.accentColor.replace("text-", "border-");

  const inner = (
    <div
      className={cn(
        "group flex flex-col gap-4 rounded-xl border border-l-2 p-5 transition-all",
        accentBorder,
        available
          ? "border-border bg-card hover:border-ring/40 hover:shadow-md hover:shadow-black/20 cursor-pointer"
          : "border-border/40 bg-card/40 cursor-default"
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className={cn("text-sm font-semibold leading-snug", available ? "text-foreground" : "text-foreground/40")}>
          {course.title}
        </h3>
        {!available && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
            <Lock className="h-3 w-3" />
            Soon
          </span>
        )}
      </div>

      {/* Stats */}
      <div className={cn("flex items-center gap-5 text-xs", available ? "text-muted-foreground" : "text-muted-foreground/40")}>
        {course.chapters && <span>{course.chapters} chapters</span>}
        {course.videos   && <span>{course.videos} videos</span>}
        {course.notebooks && <span>{course.notebooks} notebooks</span>}
      </div>

      {/* Progress bar */}
      {available && progress !== null && progress > 0 && (
        <div className="space-y-1">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", course.accentColor.replace("text-", "bg-"))}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{progress}% complete</p>
        </div>
      )}

      {/* Arrow */}
      {available && (
        <div className="flex justify-end">
          <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-0.5", course.accentColor)} />
        </div>
      )}
    </div>
  );

  return available ? <Link href={course.href}>{inner}</Link> : <div>{inner}</div>;
}
