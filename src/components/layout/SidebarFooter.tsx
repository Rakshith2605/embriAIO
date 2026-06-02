"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOverallProgress } from "@/hooks/useProgress";
import { useProgressContext } from "@/context/ProgressContext";
import { RotateCcw, ExternalLink } from "lucide-react";

interface CourseProgress {
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  percentComplete: number;
  courseCount: number;
  totalVideoSeconds: number;
  watchedVideoSeconds: number;
  totalNotebooks: number;
  completedNotebooks: number;
  totalPapers: number;
  completedPapers: number;
  videoPercent: number;
  colabPercent: number;
  paperPercent: number;
  weights: { video: number; colab: number; paper: number };
}

export function SidebarFooter() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const showCurriculum = /^\/(chapter|appendix|search)(\/|$)/.test(pathname);
  const isCourseRoute = /^\/course\//.test(pathname);

  // Old curriculum-based progress (for chapter/appendix pages)
  const { completedNotebooks, percentComplete: curriculumPercent, isHydrated } = useOverallProgress();
  const { dispatch } = useProgressContext();

  // Supabase course-based progress (for course pages)
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [courseProgressLoaded, setCourseProgressLoaded] = useState(false);

  const fetchCourseProgress = useCallback(() => {
    if (!session?.user?.email) return;
    fetch("/api/courses/my-progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CourseProgress | null) => {
        setCourseProgress(data);
        setCourseProgressLoaded(true);
      })
      .catch(() => setCourseProgressLoaded(true));
  }, [session?.user?.email]);

  useEffect(() => {
    if (!isCourseRoute) return;
    setCourseProgressLoaded(false);
    fetchCourseProgress();
  }, [pathname, isCourseRoute, fetchCourseProgress]);

  // Listen for progress events to refresh live (Fix D)
  useEffect(() => {
    if (!isCourseRoute) return;
    const handler = () => fetchCourseProgress();
    window.addEventListener("embra:progress-updated", handler);
    return () => window.removeEventListener("embra:progress-updated", handler);
  }, [isCourseRoute, fetchCourseProgress]);

  const loaded = showCurriculum ? isHydrated : (isCourseRoute ? courseProgressLoaded : true);
  const percent = showCurriculum ? curriculumPercent : (isCourseRoute ? (courseProgress?.percentComplete ?? 0) : 0);
  const completedLabel = showCurriculum
    ? (completedNotebooks > 0 ? `${completedNotebooks} notebook${completedNotebooks !== 1 ? "s" : ""} completed` : null)
    : (isCourseRoute && courseProgress && courseProgress.totalChapters > 0
        ? (() => {
            const parts: string[] = [];
            const wp = courseProgress as CourseProgress;
            if (wp.weights?.video > 0) parts.push(`Video ${wp.videoPercent}%`);
            if (wp.weights?.colab > 0) parts.push(`Colab ${wp.colabPercent}%`);
            if (wp.weights?.paper > 0) parts.push(`Papers ${wp.paperPercent}%`);
            return parts.length > 0 ? parts.join(" · ") : `${courseProgress.completedChapters}/${courseProgress.totalChapters} chapters`;
          })()
        : null);

  return (
    <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid #C8B882' }}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-jetbrains text-[9px] uppercase tracking-[0.1em]" style={{ color: '#8B7355' }}>
            Overall Progress
          </span>
          <span className="font-jetbrains text-[9px]" style={{ color: '#1C1610' }}>
            {loaded ? `${percent}%` : '—'}
          </span>
        </div>
        <div className="h-[3px] overflow-hidden" style={{ background: 'rgba(200,184,130,0.3)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: loaded ? `${percent}%` : '0%', background: '#C0392B' }}
          />
        </div>
        {loaded && completedLabel && (
          <p className="font-jetbrains text-[9px]" style={{ color: '#8B7355' }}>
            {completedLabel}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isCourseRoute && (
          <a
            href="https://github.com/rasbt/LLMs-from-scratch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-jetbrains text-[9px] transition-colors"
            style={{ color: '#8B7355' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
          >
            <ExternalLink className="h-3 w-3" />
            GitHub Repo
          </a>
        )}
        {showCurriculum && (
          <>
            <span style={{ color: '#C8B882' }}>·</span>
            <button
              onClick={() => {
                if (confirm('Reset all progress? This cannot be undone.')) {
                  dispatch({ type: 'RESET_ALL' });
                }
              }}
              className="flex items-center gap-1.5 font-jetbrains text-[9px] transition-colors"
              style={{ color: '#8B7355' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
