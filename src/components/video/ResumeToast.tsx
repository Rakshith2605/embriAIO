"use client";

import { useEffect, useState } from "react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface Props {
  savedTime: number;
  percentWatched: number;
  onDismiss: () => void;
  onWatchFromBeginning: () => void;
}

export function ResumeToast({
  savedTime,
  percentWatched,
  onDismiss,
  onWatchFromBeginning,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 px-4 py-2 shadow-lg flex items-center gap-3"
      style={{
        background: "#FFFDF5",
        border: "1px solid #C8B882",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s",
      }}
    >
      <span className="font-jetbrains text-[10px]" style={{ color: "#5C4E35" }}>
        Resuming from {formatTime(savedTime)}
        {percentWatched > 0 && ` (${Math.round(percentWatched)}% watched)`}
      </span>
      <span className="font-jetbrains text-[10px]" style={{ color: "#A08E6B" }}>
        {" · "}
      </span>
      <button
        onClick={() => {
          setVisible(false);
          onWatchFromBeginning();
          setTimeout(onDismiss, 300);
        }}
        className="font-jetbrains text-[10px] tracking-wide hover:underline"
        style={{ color: "#C0392B" }}
      >
        Watch from beginning
      </button>
    </div>
  );
}
