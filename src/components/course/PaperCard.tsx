"use client";

import { useState } from "react";
import { ExternalLink, BookOpen, Headphones, CheckCircle2, Circle } from "lucide-react";

interface Props {
  paperId: string;
  courseId: string;
  chapterId?: string;
  title: string;
  url: string;
  description?: string;
  initialCompleted?: boolean;
}

export function PaperCard({ paperId, courseId, chapterId, title, url, description, initialCompleted = false }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const notebookLmUrl = `https://notebooklm.google.com/notebook/new?pli=1&sourceUrl=${encodeURIComponent(url)}`;

  async function toggleRead() {
    setLoading(true);
    const newCompleted = !completed;
    try {
      const res = await fetch(`/api/courses/${courseId}/papers/${paperId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });
      if (res.ok) {
        setCompleted(newCompleted);
        window.dispatchEvent(new CustomEvent("embra:progress-updated", { detail: { courseId, chapterId } }));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
      className="p-4 flex items-start gap-4 group hover:shadow-sm transition-shadow"
    >
      <div
        className="shrink-0 flex items-center justify-center w-10 h-10"
        style={{ background: "#F4E8C1", border: "1px solid #C8B882" }}
      >
        <BookOpen className="h-5 w-5" style={{ color: "#C0392B" }} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-playfair font-bold text-[15px] leading-snug mb-0.5"
          style={{ color: "#1C1610" }}
        >
          {title}
        </p>
        {description && (
          <p
            className="font-source-serif text-[13px] leading-relaxed mb-2 line-clamp-2"
            style={{ color: "#5C4E35" }}
          >
            {description}
          </p>
        )}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-jetbrains text-[11px] tracking-wide uppercase"
            style={{ color: "#C0392B" }}
          >
            Read Paper
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={notebookLmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 font-jetbrains text-[10px] tracking-wide uppercase transition-colors hover:opacity-80"
            style={{ background: "#1C1610", color: "#F7F2E7" }}
          >
            <Headphones className="h-3 w-3" />
            Listen with NotebookLM
          </a>
        </div>
      </div>

      <button
        onClick={toggleRead}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 font-jetbrains text-[10px] uppercase tracking-wider shrink-0 transition-colors disabled:opacity-50"
        style={{
          border: `1px solid ${completed ? "#059669" : "#C8B882"}`,
          background: completed ? "#E8F5E9" : "transparent",
          color: completed ? "#059669" : "#5C4E35",
        }}
        title={completed ? "Mark as unread" : "Mark as read"}
      >
        {completed ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Read
          </>
        ) : (
          <>
            <Circle className="h-3.5 w-3.5" />
            Mark as Read
          </>
        )}
      </button>
    </div>
  );
}