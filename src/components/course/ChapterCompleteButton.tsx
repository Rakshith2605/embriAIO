"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface Props {
  courseId: string;
  chapterId: string;
  isSubscribed: boolean;
  initialStatus: string;
}

export function ChapterCompleteButton({ courseId, chapterId, isSubscribed, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  if (!isSubscribed) return null;

  const isCompleted = status === "completed";

  async function toggle() {
    setLoading(true);
    const newStatus = isCompleted ? "in_progress" : "completed";
    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter_id: chapterId, status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50"
      style={{
        border: `1px solid ${isCompleted ? "#059669" : "#C8B882"}`,
        background: isCompleted ? "#E8F5E9" : "#FFFDF5",
        color: isCompleted ? "#059669" : "#5C4E35",
      }}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {loading ? "Saving..." : isCompleted ? "Completed" : "Mark Complete"}
    </button>
  );
}
