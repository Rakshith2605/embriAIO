"use client";

import { useEffect, useState } from "react";

interface WeightedProgress {
  totalVideoSeconds: number;
  watchedVideoSeconds: number;
  totalNotebooks: number;
  completedNotebooks: number;
  totalPapers: number;
  completedPapers: number;
  videoPercent: number;
  colabPercent: number;
  paperPercent: number;
  overallPercent: number;
  weights: { video: number; colab: number; paper: number };
}

interface Props {
  courseId: string;
  hasSubscription: boolean;
}

const PROGRESS_EVENT = "embra:progress-updated";

export function CourseProgressBar({ courseId, hasSubscription }: Props) {
  const [progress, setProgress] = useState<WeightedProgress | null>(null);
  const [loading, setLoading] = useState(!!hasSubscription);

  const fetchProgress = () => {
    if (!hasSubscription) return;
    fetch(`/api/courses/${courseId}/progress`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.weightedProgress) {
          setProgress(data.weightedProgress);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProgress();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { courseId?: string };
      if (!detail?.courseId || detail.courseId === courseId) {
        fetchProgress();
      }
    };
    window.addEventListener(PROGRESS_EVENT, handler);
    return () => window.removeEventListener(PROGRESS_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, hasSubscription]);

  if (loading) {
    return (
      <div className="mb-4 p-3" style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}>
        <div className="h-4 w-48 animate-pulse" style={{ background: "rgba(200,184,130,0.3)" }} />
        <div className="h-1.5 mt-2 rounded-full animate-pulse" style={{ background: "rgba(200,184,130,0.3)" }} />
      </div>
    );
  }

  if (!progress || progress.overallPercent === undefined) return null;

  return (
    <div className="mb-4 p-3" style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-jetbrains text-[10px] uppercase tracking-wider" style={{ color: "#5C4E35" }}>
          {progress.overallPercent}% complete
        </span>
        <span
          className="font-jetbrains text-[11px] font-bold"
          style={{ color: progress.overallPercent === 100 ? "#059669" : "#C0392B" }}
        >
          {progress.overallPercent}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E5DCC8" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress.overallPercent}%`,
            background: progress.overallPercent === 100 ? "#059669" : "#C0392B",
          }}
        />
      </div>
      <div className="flex gap-3 mt-2 font-jetbrains text-[9px]" style={{ color: "#8B7355" }}>
        {progress.weights.video > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#2563EB" }} />
            Video {progress.videoPercent}% ({Math.round(progress.watchedVideoSeconds / 60)}m of {Math.round(progress.totalVideoSeconds / 60)}m)
          </span>
        )}
        {progress.weights.colab > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#CA8A04" }} />
            Colab {progress.completedNotebooks}/{progress.totalNotebooks} ({progress.colabPercent}%)
          </span>
        )}
        {progress.weights.paper > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#059669" }} />
            Papers {progress.completedPapers}/{progress.totalPapers} ({progress.paperPercent}%)
          </span>
        )}
      </div>
    </div>
  );
}