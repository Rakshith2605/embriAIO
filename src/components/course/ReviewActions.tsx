"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, RotateCcw } from "lucide-react";

export function ReviewActions({ courseId, status }: { courseId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const isDraft = status === "draft";

  async function handlePublish() {
    setLoading("publish");
    try {
      const res = await fetch(`/api/courses/${courseId}/publish`, { method: "POST" });
      if (res.ok) {
        router.push("/my-courses");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to publish");
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleUnpublish() {
    setLoading("unpublish");
    try {
      const res = await fetch(`/api/courses/${courseId}/publish`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to unpublish");
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/my-courses");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {isDraft ? (
        <button
          onClick={handlePublish}
          disabled={!!loading}
          className="flex items-center gap-2 px-5 py-2.5 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ background: "#27AE60", color: "#FFFDF5" }}
        >
          <Send className="h-4 w-4" />
          {loading === "publish" ? "Publishing..." : "Publish Course"}
        </button>
      ) : (
        <button
          onClick={handleUnpublish}
          disabled={!!loading}
          className="flex items-center gap-2 px-5 py-2.5 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ background: "#F59E0B", color: "#1C1610" }}
        >
          <RotateCcw className="h-4 w-4" />
          {loading === "unpublish" ? "..." : "Unpublish"}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={!!loading}
        className="flex items-center gap-2 px-5 py-2.5 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:opacity-90 disabled:opacity-50"
        style={{ border: "1px solid #EF4444", color: "#EF4444" }}
      >
        <Trash2 className="h-4 w-4" />
        {loading === "delete" ? "..." : "Delete"}
      </button>
    </>
  );
}
