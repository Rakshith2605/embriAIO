"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CourseDefinition } from "@/lib/courses";
import { cn } from "@/lib/utils";
import { BookOpen, Clock, Layers, ArrowRight, Lock } from "lucide-react";

function readProgress(localStorageKey: string, totalNotebooks: number): number {
  try {
    const raw = localStorage.getItem(localStorageKey);
    if (!raw) return 0;
    const state = JSON.parse(raw) as { notebooks?: Record<string, string> };
    const notebooks = state.notebooks ?? {};
    const completed = Object.values(notebooks).filter((s) => s === "completed").length;
    return totalNotebooks > 0 ? Math.round((completed / totalNotebooks) * 100) : 0;
  } catch {
    return 0;
  }
}

interface Props {
  course: CourseDefinition;
}

export function CourseCard({ course }: Props) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (course.progressLocalStorageKey && course.totalNotebooks) {
      setProgress(readProgress(course.progressLocalStorageKey, course.totalNotebooks));
    }
  }, [course.progressLocalStorageKey, course.totalNotebooks]);

  const isAvailable = course.status === "available";
  const isBeta = course.status === "beta";
  const isComingSoon = course.status === "coming-soon";

  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300",
        isAvailable
          ? "border-border bg-card hover:border-ring/60 hover:shadow-lg hover:shadow-black/20 cursor-pointer"
          : "border-border/50 bg-card/50 cursor-default"
      )}
    >
      {/* Gradient header */}
      <div className={cn("relative h-2 bg-gradient-to-r", course.fromColor, course.toColor)} />

      {/* Status badge */}
      <div className="absolute top-4 right-4">
        {isAvailable && (
          <span className="inline-flex items-center rounded-full bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-green-500">
            Available
          </span>
        )}
        {isBeta && (
          <span className="inline-flex items-center rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
            Beta
          </span>
        )}
        {isComingSoon && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Lock className="h-2.5 w-2.5" />
            Coming Soon
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 pt-4">
        {/* Title */}
        <h3
          className={cn(
            "text-base font-bold leading-snug mb-1 pr-24 transition-colors",
            isAvailable ? `${course.accentColor} group-hover:brightness-110` : "text-foreground/50"
          )}
        >
          {course.title}
        </h3>
        <p className={cn("text-xs font-medium mb-3", isAvailable ? "text-foreground/70" : "text-foreground/40")}>
          {course.subtitle}
        </p>
        <p className={cn("text-xs leading-relaxed flex-1 mb-4", isAvailable ? "text-muted-foreground" : "text-muted-foreground/50")}>
          {course.description}
        </p>

        {/* Stats row */}
        <div className={cn("flex items-center gap-4 text-[11px] mb-4", isAvailable ? "text-muted-foreground" : "text-muted-foreground/40")}>
          {course.chapters && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {course.chapters} chapters
            </span>
          )}
          {course.notebooks && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {course.notebooks} notebooks
            </span>
          )}
          {course.estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{course.estimatedHours}h
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                isAvailable
                  ? "bg-background border-border text-muted-foreground"
                  : "bg-background/50 border-border/40 text-muted-foreground/40"
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Progress bar (available + started) */}
        {isAvailable && progress !== null && progress > 0 && (
          <div className="mb-4 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", course.accentColor.replace("text-", "bg-"))}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        {isAvailable ? (
          <div className="flex items-center justify-between mt-auto">
            {course.author && (
              <span className="text-[11px] text-muted-foreground">by {course.author}</span>
            )}
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1 text-xs font-semibold transition-all",
                course.accentColor,
                "group-hover:gap-2"
              )}
            >
              {progress && progress > 0 ? "Continue" : "Start Learning"}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        ) : (
          <div className="mt-auto">
            {course.author && (
              <span className="text-[11px] text-muted-foreground/40">by {course.author}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isAvailable) {
    return <Link href={course.href}>{cardContent}</Link>;
  }
  return <div>{cardContent}</div>;
}
