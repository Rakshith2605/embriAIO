"use client";

import { useEffect, useRef } from "react";

interface Props {
  courseId: string;
  chapterId: string;
  isSubscribed: boolean;
}

/**
 * Automatically marks a chapter as "in_progress" when a subscribed user views it.
 * Renders nothing — just a side-effect tracker.
 */
export function ChapterProgressTracker({ courseId, chapterId, isSubscribed }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!isSubscribed || tracked.current) return;
    tracked.current = true;

    fetch(`/api/courses/${courseId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter_id: chapterId, status: "in_progress" }),
    }).catch(() => {});
  }, [courseId, chapterId, isSubscribed]);

  return null;
}
