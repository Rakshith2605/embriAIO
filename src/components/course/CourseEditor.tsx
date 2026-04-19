"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileCode,
  BookOpen,
  Loader2,
  Send,
  ArrowLeft,
  Globe,
  Lock,
  Shield,
} from "lucide-react";
import type {
  AccentColor,
  CourseVisibility,
  CourseFormData,
  ChapterFormData,
} from "@/types/user-course";
import { ColorPicker } from "./ColorPicker";
import { VideoInput } from "./VideoInput";
import { ColabInput } from "./ColabInput";
import { ColabSharingBanner } from "./ColabSharingBanner";
import { PaperInput } from "./PaperInput";
import { cn } from "@/lib/utils";

interface Props {
  /** Pre-filled data when editing an existing course */
  initial?: {
    courseId: string;
    data: CourseFormData;
  };
}

const STEPS = ["Course Info", "Chapters", "Content", "Review & Publish"] as const;

const emptyChapter = (): ChapterFormData => ({
  title: "",
  description: "",
  videos: [],
  notebooks: [],
  papers: [],
});

/** Snapshot the original IDs so we can diff what was deleted */
function snapshotIds(data: CourseFormData) {
  const chapterIds: string[] = [];
  const videoIds = new Map<string, string[]>(); // chapterId -> videoIds
  const notebookIds = new Map<string, string[]>();
  const paperIds = new Map<string, string[]>();
  for (const ch of data.chapters) {
    if (ch.id) {
      chapterIds.push(ch.id);
      videoIds.set(ch.id, ch.videos.filter((v) => v.id).map((v) => v.id!));
      notebookIds.set(ch.id, ch.notebooks.filter((n) => n.id).map((n) => n.id!));
      paperIds.set(ch.id, ch.papers.filter((p) => p.id).map((p) => p.id!));
    }
  }
  return { chapterIds, videoIds, notebookIds, paperIds };
}

export function CourseEditor({ initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");

  // Snapshot original IDs for diff on save
  const [originalIds] = useState(() =>
    initial ? snapshotIds(initial.data) : { chapterIds: [], videoIds: new Map(), notebookIds: new Map(), paperIds: new Map() }
  );

  const [form, setForm] = useState<CourseFormData>(
    initial?.data ?? {
      title: "",
      description: "",
      accent_color: "violet",
      visibility: "public",
      chapters: [emptyChapter()],
    }
  );

  // Active chapter index for step 3
  const [activeChapter, setActiveChapter] = useState(0);

  /* ── Helpers ─────────────────────────────────────────── */

  function updateField<K extends keyof CourseFormData>(key: K, value: CourseFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateChapter(idx: number, patch: Partial<ChapterFormData>) {
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch, i) => (i === idx ? { ...ch, ...patch } : ch)),
    }));
  }

  function addChapter() {
    setForm((prev) => ({ ...prev, chapters: [...prev.chapters, emptyChapter()] }));
  }

  function removeChapter(idx: number) {
    if (form.chapters.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== idx),
    }));
    if (activeChapter >= form.chapters.length - 1) {
      setActiveChapter(Math.max(0, form.chapters.length - 2));
    }
  }

  function moveChapter(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= form.chapters.length) return;
    setForm((prev) => {
      const chapters = [...prev.chapters];
      [chapters[idx], chapters[target]] = [chapters[target], chapters[idx]];
      return { ...prev, chapters };
    });
  }

  /* ── Save logic ──────────────────────────────────────── */

  async function saveCourse() {
    setSaving(true);
    setError(null);
    try {
      // 1. Create or update course
      let id = courseId;
      if (!id) {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            accent_color: form.accent_color,
            visibility: form.visibility,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to create course");
        }
        const course = await res.json();
        id = course.id;
        setCourseId(id);
      } else {
        const res = await fetch(`/api/courses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            accent_color: form.accent_color,
            visibility: form.visibility,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to update course");
        }
      }

      // 2. Delete removed chapters
      const currentChapterIds = form.chapters.filter((ch) => ch.id).map((ch) => ch.id!);
      const removedChapterIds = originalIds.chapterIds.filter((cid) => !currentChapterIds.includes(cid));
      for (const cid of removedChapterIds) {
        await fetch(`/api/courses/${id}/chapters/${cid}`, { method: "DELETE" });
      }

      // 3. Create/update chapters + content
      for (let i = 0; i < form.chapters.length; i++) {
        const chapter = form.chapters[i];
        let chapterId = chapter.id;

        if (!chapterId) {
          // New chapter
          const res = await fetch(`/api/courses/${id}/chapters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: chapter.title, description: chapter.description }),
          });
          if (!res.ok) throw new Error("Failed to create chapter");
          const ch = await res.json();
          chapterId = ch.id;
          chapter.id = chapterId;
        } else {
          // Update existing chapter
          await fetch(`/api/courses/${id}/chapters/${chapterId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: chapter.title, description: chapter.description }),
          });
        }

        // Delete removed videos
        const currentVideoIds = chapter.videos.filter((v) => v.id).map((v) => v.id!);
        const origVideoIds = originalIds.videoIds.get(chapterId!) ?? [];
        const removedVideoIds = origVideoIds.filter((vid: string) => !currentVideoIds.includes(vid));
        for (const vid of removedVideoIds) {
          await fetch(`/api/courses/${id}/chapters/${chapterId}/videos`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoId: vid }),
          });
        }

        // Add new videos (those without id)
        for (const video of chapter.videos) {
          if (!video.id) {
            const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/videos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: video.url, title: video.title }),
            });
            if (res.ok) {
              const v = await res.json();
              video.id = v.id;
            }
          }
        }

        // Delete removed notebooks
        const currentNbIds = chapter.notebooks.filter((n) => n.id).map((n) => n.id!);
        const origNbIds = originalIds.notebookIds.get(chapterId!) ?? [];
        const removedNbIds = origNbIds.filter((nid: string) => !currentNbIds.includes(nid));
        for (const nid of removedNbIds) {
          await fetch(`/api/courses/${id}/chapters/${chapterId}/notebooks`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notebookId: nid }),
          });
        }

        // Add new notebooks (those without id)
        for (const notebook of chapter.notebooks) {
          if (!notebook.id) {
            const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/notebooks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                colab_url: notebook.colab_url,
                title: notebook.title,
                description: notebook.description,
              }),
            });
            if (res.ok) {
              const n = await res.json();
              notebook.id = n.id;
            }
          }
        }

        // Delete removed papers
        const currentPaperIds = chapter.papers.filter((p) => p.id).map((p) => p.id!);
        const origPaperIds = originalIds.paperIds.get(chapterId!) ?? [];
        const removedPaperIds = origPaperIds.filter((pid: string) => !currentPaperIds.includes(pid));
        for (const pid of removedPaperIds) {
          await fetch(`/api/courses/${id}/chapters/${chapterId}/papers`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paperId: pid }),
          });
        }

        // Add new papers (those without id)
        for (const paper of chapter.papers) {
          if (!paper.id) {
            const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/papers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: paper.url,
                title: paper.title,
                description: paper.description,
              }),
            });
            if (res.ok) {
              const p = await res.json();
              paper.id = p.id;
            }
          }
        }
      }

      return id;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCourse() {
    if (!courseId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete course");
      }
      router.push("/my-courses");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete course");
      setDeleting(false);
    }
  }

  async function handlePublish() {
    const id = await saveCourse();
    if (!id) return;

    const res = await fetch(`/api/courses/${id}/publish`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Failed to publish");
      return;
    }

    router.push("/my-courses");
  }

  async function handleSaveDraft() {
    const id = await saveCourse();
    if (id) router.push("/my-courses");
  }

  /* ── Render ──────────────────────────────────────────── */

  const canGoNext =
    step === 0
      ? form.title.trim().length >= 3
      : step === 1
        ? form.chapters.every((ch) => ch.title.trim().length > 0)
        : true;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-wider transition-all",
                i === step
                  ? "text-[#FFFDF5]"
                  : i < step
                    ? "text-[#5C4E35] hover:text-[#1C1610]"
                    : "text-[#C8B882]"
              )}
              style={{
                background: i === step ? "#1C1610" : "transparent",
                border: `1px solid ${i <= step ? "#1C1610" : "#C8B882"}`,
              }}
              disabled={i > step}
            >
              {i + 1}. {label}
            </button>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-px" style={{ background: "#C8B882" }} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div
          className="mb-4 p-3 font-source-serif text-[13px]"
          style={{ background: "#FFF0F0", border: "1px solid #E6A8A8", color: "#C0392B" }}
        >
          {error}
        </div>
      )}

      {/* ── Step 1: Course Info ──────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <label
              className="block font-jetbrains text-[10px] uppercase tracking-wider mb-2"
              style={{ color: "#8B7355" }}
            >
              Course Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Transformers from Scratch"
              className="w-full px-4 py-3 font-playfair text-[18px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
              style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
            />
          </div>
          <div>
            <label
              className="block font-jetbrains text-[10px] uppercase tracking-wider mb-2"
              style={{ color: "#8B7355" }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="What will students learn in this course?"
              rows={4}
              className="w-full px-4 py-3 font-source-serif text-[14px] border outline-none resize-none focus:ring-1 focus:ring-[#C0392B]"
              style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
            />
          </div>
          <div>
            <label
              className="block font-jetbrains text-[10px] uppercase tracking-wider mb-2"
              style={{ color: "#8B7355" }}
            >
              Accent Color
            </label>
            <ColorPicker
              value={form.accent_color}
              onChange={(c) => updateField("accent_color", c)}
            />
          </div>

          {/* Visibility */}
          <div>
            <label
              className="block font-jetbrains text-[10px] uppercase tracking-wider mb-2"
              style={{ color: "#8B7355" }}
            >
              Visibility
            </label>
            <div className="flex gap-2">
              {([
                { value: "public" as const, icon: Globe, label: "Public", desc: "Anyone can view and access" },
                { value: "restricted" as const, icon: Shield, label: "Restricted", desc: "Visible to all, access by approval" },
                { value: "private" as const, icon: Lock, label: "Private", desc: "Only you can see and access" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("visibility", opt.value)}
                  className="flex-1 flex flex-col items-center gap-1.5 p-3 transition-colors"
                  style={{
                    background: form.visibility === opt.value ? "#1C1610" : "#FFFDF5",
                    color: form.visibility === opt.value ? "#F7F2E7" : "#5C4E35",
                    border: `1px solid ${form.visibility === opt.value ? "#1C1610" : "#C8B882"}`,
                  }}
                >
                  <opt.icon className="h-4 w-4" />
                  <span className="font-jetbrains text-[10px] uppercase tracking-wider">
                    {opt.label}
                  </span>
                  <span
                    className="font-source-serif text-[10px] leading-tight text-center"
                    style={{ color: form.visibility === opt.value ? "#C8B882" : "#8B7355" }}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Chapters ─────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="font-source-serif text-[14px]" style={{ color: "#5C4E35" }}>
            Add chapters to organize your course. You can reorder them later.
          </p>

          {form.chapters.map((ch, idx) => (
            <div
              key={idx}
              style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0" style={{ color: "#C8B882" }} />
                <span
                  className="font-jetbrains text-[10px] uppercase tracking-wider shrink-0"
                  style={{ color: "#C0392B" }}
                >
                  Ch {idx + 1}
                </span>
                <input
                  type="text"
                  value={ch.title}
                  onChange={(e) => updateChapter(idx, { title: e.target.value })}
                  placeholder="Chapter title"
                  className="flex-1 px-3 py-2 font-playfair text-[15px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                  style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveChapter(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 disabled:opacity-30"
                    style={{ color: "#8B7355" }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveChapter(idx, 1)}
                    disabled={idx === form.chapters.length - 1}
                    className="p-1 disabled:opacity-30"
                    style={{ color: "#8B7355" }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeChapter(idx)}
                    disabled={form.chapters.length <= 1}
                    className="p-1 disabled:opacity-30"
                    style={{ color: "#C0392B" }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={ch.description}
                onChange={(e) => updateChapter(idx, { description: e.target.value })}
                placeholder="Chapter description (optional)"
                rows={2}
                className="w-full px-3 py-2 font-source-serif text-[13px] border outline-none resize-none focus:ring-1 focus:ring-[#C0392B]"
                style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#5C4E35" }}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addChapter}
            className="flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider border border-dashed transition-colors hover:bg-[#F7F2E7]"
            style={{ borderColor: "#C8B882", color: "#5C4E35" }}
          >
            <Plus className="h-4 w-4" />
            Add Chapter
          </button>
        </div>
      )}

      {/* ── Step 3: Content ──────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Chapter tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {form.chapters.map((ch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveChapter(idx)}
                className={cn(
                  "px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-wider transition-all border",
                  activeChapter === idx
                    ? "text-[#FFFDF5]"
                    : "text-[#5C4E35] hover:bg-[#EDE8D5]"
                )}
                style={{
                  background: activeChapter === idx ? "#1C1610" : "transparent",
                  borderColor: activeChapter === idx ? "#1C1610" : "#C8B882",
                }}
              >
                Ch {idx + 1}: {ch.title || "Untitled"}
              </button>
            ))}
          </div>

          {form.chapters[activeChapter] && (
            <div className="space-y-6">
              {/* Videos section */}
              <div>
                <h3
                  className="flex items-center gap-2 font-playfair font-bold text-[16px] mb-3"
                  style={{ color: "#1C1610" }}
                >
                  <Video className="h-4 w-4" style={{ color: "#C0392B" }} />
                  Videos
                </h3>

                {/* Existing videos */}
                {form.chapters[activeChapter].videos.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.chapters[activeChapter].videos.map((v, vi) => (
                      <div
                        key={vi}
                        className="px-3 py-2 space-y-2"
                        style={{ background: "#F7F2E7", border: "1px solid #C8B882" }}
                      >
                        <div className="flex items-center gap-3">
                          <Video className="h-4 w-4 shrink-0" style={{ color: "#8B7355" }} />
                          <input
                            type="text"
                            value={v.title}
                            onChange={(e) => {
                              const videos = [...form.chapters[activeChapter].videos];
                              videos[vi] = { ...videos[vi], title: e.target.value };
                              updateChapter(activeChapter, { videos });
                            }}
                            className="flex-1 px-2 py-1 font-source-serif text-[13px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
                            placeholder="Video title"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const videos = [...form.chapters[activeChapter].videos];
                              videos.splice(vi, 1);
                              updateChapter(activeChapter, { videos });
                            }}
                            className="p-1"
                            style={{ color: "#C0392B" }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 ml-7">
                          <input
                            type="text"
                            value={v.url}
                            onChange={(e) => {
                              const videos = [...form.chapters[activeChapter].videos];
                              videos[vi] = { ...videos[vi], url: e.target.value, id: undefined };
                              updateChapter(activeChapter, { videos });
                            }}
                            className="flex-1 px-2 py-1 font-jetbrains text-[11px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#5C4E35" }}
                            placeholder="Video URL"
                          />
                          <span className="font-jetbrains text-[9px] uppercase tracking-wider shrink-0" style={{ color: "#8B7355" }}>
                            {v.url.includes("youtube") ? "YouTube" : v.url.includes("peer") ? "PeerTube" : "Video"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <VideoInput
                  onAdd={(data) => {
                    updateChapter(activeChapter, {
                      videos: [...form.chapters[activeChapter].videos, data],
                    });
                  }}
                />
              </div>

              {/* Notebooks section */}
              <div>
                <h3
                  className="flex items-center gap-2 font-playfair font-bold text-[16px] mb-3"
                  style={{ color: "#1C1610" }}
                >
                  <FileCode className="h-4 w-4" style={{ color: "#C0392B" }} />
                  Notebooks
                </h3>

                <ColabSharingBanner />

                {/* Existing notebooks */}
                {form.chapters[activeChapter].notebooks.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.chapters[activeChapter].notebooks.map((n, ni) => (
                      <div
                        key={ni}
                        className="px-3 py-2 space-y-2"
                        style={{ background: "#F7F2E7", border: "1px solid #C8B882" }}
                      >
                        <div className="flex items-center gap-3">
                          <FileCode className="h-4 w-4 shrink-0" style={{ color: "#8B7355" }} />
                          <input
                            type="text"
                            value={n.title}
                            onChange={(e) => {
                              const notebooks = [...form.chapters[activeChapter].notebooks];
                              notebooks[ni] = { ...notebooks[ni], title: e.target.value };
                              updateChapter(activeChapter, { notebooks });
                            }}
                            className="flex-1 px-2 py-1 font-source-serif text-[13px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
                            placeholder="Notebook title"
                          />
                          {n.source === "github" && (
                            <span className="font-jetbrains text-[8px] uppercase tracking-wider px-1.5 py-0.5 shrink-0" style={{ background: "#EDE8D5", border: "1px solid #C8B882", color: "#8B7355" }}>
                              Embedded
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const notebooks = [...form.chapters[activeChapter].notebooks];
                              notebooks.splice(ni, 1);
                              updateChapter(activeChapter, { notebooks });
                            }}
                            className="p-1"
                            style={{ color: "#C0392B" }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {n.source === "github" ? (
                          <div className="flex items-center gap-2 ml-7">
                            <span
                              className="flex-1 px-2 py-1 font-jetbrains text-[11px] truncate"
                              style={{ background: "#FFFDF5", border: "1px solid #C8B882", color: "#8B7355" }}
                              title={n.github_path}
                            >
                              {n.github_path ?? n.filename ?? "Embedded notebook"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 ml-7">
                            <input
                              type="text"
                              value={n.colab_url}
                              onChange={(e) => {
                                const notebooks = [...form.chapters[activeChapter].notebooks];
                                notebooks[ni] = { ...notebooks[ni], colab_url: e.target.value, id: undefined };
                                updateChapter(activeChapter, { notebooks });
                              }}
                              className="flex-1 px-2 py-1 font-jetbrains text-[11px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                              style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#5C4E35" }}
                              placeholder="Colab URL"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 ml-7">
                          <input
                            type="text"
                            value={n.description}
                            onChange={(e) => {
                              const notebooks = [...form.chapters[activeChapter].notebooks];
                              notebooks[ni] = { ...notebooks[ni], description: e.target.value };
                              updateChapter(activeChapter, { notebooks });
                            }}
                            className="flex-1 px-2 py-1 font-source-serif text-[12px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#5C4E35" }}
                            placeholder="Notebook description (optional)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <ColabInput
                  onAdd={(data) => {
                    updateChapter(activeChapter, {
                      notebooks: [...form.chapters[activeChapter].notebooks, data],
                    });
                  }}
                />
              </div>

              {/* Papers section */}
              <div>
                <h3
                  className="flex items-center gap-2 font-playfair font-bold text-[16px] mb-3"
                  style={{ color: "#1C1610" }}
                >
                  <BookOpen className="h-4 w-4" style={{ color: "#C0392B" }} />
                  Papers to Read
                </h3>

                {/* Existing papers */}
                {form.chapters[activeChapter].papers.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.chapters[activeChapter].papers.map((p, pi) => (
                      <div
                        key={pi}
                        className="px-3 py-2 space-y-2"
                        style={{ background: "#F7F2E7", border: "1px solid #C8B882" }}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 shrink-0" style={{ color: "#8B7355" }} />
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => {
                              const papers = [...form.chapters[activeChapter].papers];
                              papers[pi] = { ...papers[pi], title: e.target.value };
                              updateChapter(activeChapter, { papers });
                            }}
                            className="flex-1 px-2 py-1 font-source-serif text-[13px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
                            placeholder="Paper title"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const papers = [...form.chapters[activeChapter].papers];
                              papers.splice(pi, 1);
                              updateChapter(activeChapter, { papers });
                            }}
                            className="p-1"
                            style={{ color: "#C0392B" }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 ml-7">
                          <input
                            type="text"
                            value={p.url}
                            onChange={(e) => {
                              const papers = [...form.chapters[activeChapter].papers];
                              papers[pi] = { ...papers[pi], url: e.target.value, id: undefined };
                              updateChapter(activeChapter, { papers });
                            }}
                            className="flex-1 px-2 py-1 font-jetbrains text-[11px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#5C4E35" }}
                            placeholder="Paper URL"
                          />
                        </div>
                        <div className="flex items-center gap-2 ml-7">
                          <input
                            type="text"
                            value={p.description}
                            onChange={(e) => {
                              const papers = [...form.chapters[activeChapter].papers];
                              papers[pi] = { ...papers[pi], description: e.target.value };
                              updateChapter(activeChapter, { papers });
                            }}
                            className="flex-1 px-2 py-1 font-source-serif text-[12px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
                            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#5C4E35" }}
                            placeholder="Paper description (optional)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <PaperInput
                  onAdd={(data) => {
                    updateChapter(activeChapter, {
                      papers: [...form.chapters[activeChapter].papers, data],
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Review & Publish ─────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Course preview */}
          <div
            style={{ background: "#FFFDF5", border: "1px solid #C8B882", borderLeft: "3px solid #C0392B" }}
            className="p-6"
          >
            <p className="font-jetbrains text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: "#C0392B" }}>
              Course Preview
            </p>
            <h2 className="font-playfair font-bold text-[24px] mb-2" style={{ color: "#1C1610" }}>
              {form.title || "Untitled Course"}
            </h2>
            <p className="font-source-serif text-[14px] leading-relaxed mb-4" style={{ color: "#5C4E35" }}>
              {form.description || "No description"}
            </p>

            {/* Visibility selector */}
            <div className="mb-4">
              <label
                className="block font-jetbrains text-[10px] uppercase tracking-wider mb-2"
                style={{ color: "#8B7355" }}
              >
                Publish As
              </label>
              <div className="flex gap-2">
                {([
                  { value: "public" as const, icon: Globe, label: "Public", desc: "Anyone can view and access" },
                  { value: "restricted" as const, icon: Shield, label: "Restricted", desc: "Visible to all, access by approval" },
                  { value: "private" as const, icon: Lock, label: "Private", desc: "Only you can see and access" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField("visibility", opt.value)}
                    className="flex-1 flex flex-col items-center gap-1.5 p-3 transition-colors"
                    style={{
                      background: form.visibility === opt.value ? "#1C1610" : "#FFFDF5",
                      color: form.visibility === opt.value ? "#F7F2E7" : "#5C4E35",
                      border: `1px solid ${form.visibility === opt.value ? "#1C1610" : "#C8B882"}`,
                    }}
                  >
                    <opt.icon className="h-4 w-4" />
                    <span className="font-jetbrains text-[10px] uppercase tracking-wider">
                      {opt.label}
                    </span>
                    <span
                      className="font-source-serif text-[10px] leading-tight text-center"
                      style={{ color: form.visibility === opt.value ? "#C8B882" : "#8B7355" }}
                    >
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              {[
                { label: "chapters", value: form.chapters.length },
                { label: "videos", value: form.chapters.reduce((s, ch) => s + ch.videos.length, 0) },
                { label: "notebooks", value: form.chapters.reduce((s, ch) => s + ch.notebooks.length, 0) },
                { label: "papers", value: form.chapters.reduce((s, ch) => s + ch.papers.length, 0) },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span className="font-playfair font-bold text-[20px]" style={{ color: "#1C1610" }}>
                    {stat.value}
                  </span>
                  <span className="block font-jetbrains text-[8px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chapter list preview */}
          <div className="space-y-3">
            {form.chapters.map((ch, idx) => (
              <div
                key={idx}
                style={{ background: "#F7F2E7", border: "1px solid #C8B882" }}
                className="p-4"
              >
                <p className="font-jetbrains text-[9px] uppercase tracking-wider mb-1" style={{ color: "#C0392B" }}>
                  Chapter {idx + 1}
                </p>
                <h3 className="font-playfair font-bold text-[16px] mb-1" style={{ color: "#1C1610" }}>
                  {ch.title}
                </h3>
                {ch.description && (
                  <p className="font-source-serif text-[13px] mb-2" style={{ color: "#5C4E35" }}>
                    {ch.description}
                  </p>
                )}
                <div className="flex gap-4 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                  <span>{ch.videos.length} video{ch.videos.length !== 1 ? "s" : ""}</span>
                  <span>{ch.notebooks.length} notebook{ch.notebooks.length !== 1 ? "s" : ""}</span>
                  <span>{ch.papers.length} paper{ch.papers.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid #C8B882" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
            className="flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5]"
            style={{ color: "#5C4E35", border: "1px solid #C8B882" }}
          >
            <ArrowLeft className="h-4 w-4" />
            {step > 0 ? "Back" : "Cancel"}
          </button>

          {/* Delete course button — only show when editing */}
          {courseId && (
            <button
              type="button"
              onClick={handleDeleteCourse}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:bg-[#FFF0F0] disabled:opacity-50"
              style={{ color: "#C0392B", border: "1px solid #C0392B" }}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Course
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {step === 3 && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5] disabled:opacity-50"
              style={{ color: "#5C4E35", border: "1px solid #C8B882" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save as Draft
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext}
              className="flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider disabled:opacity-40 transition-colors"
              style={{ background: "#1C1610", color: "#F7F2E7" }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 font-jetbrains text-[11px] uppercase tracking-wider disabled:opacity-50 transition-colors"
              style={{ background: "#C0392B", color: "#FFFDF5" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
