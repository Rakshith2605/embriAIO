"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Shield, Lock, ToggleLeft, ToggleRight, Loader2, ChevronDown } from "lucide-react";
import type { CourseVisibility } from "@/types/user-course";

interface Props {
  courseId: string;
  status: "draft" | "published";
  visibility: CourseVisibility;
}

const VISIBILITY_OPTIONS = [
  { value: "public" as const, icon: Globe, label: "Public", color: "#059669" },
  { value: "restricted" as const, icon: Shield, label: "Restricted", color: "#CA8A04" },
  { value: "private" as const, icon: Lock, label: "Private", color: "#C0392B" },
] as const;

export function CourseQuickActions({ courseId, status: initialStatus, visibility: initialVisibility }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [visibility, setVisibility] = useState<CourseVisibility>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentVis = VISIBILITY_OPTIONS.find((o) => o.value === visibility)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function updateCourse(updates: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    const newStatus = status === "published" ? "draft" : "published";
    const ok = await updateCourse({ status: newStatus });
    if (ok) {
      setStatus(newStatus);
      router.refresh();
    }
  }

  async function changeVisibility(value: CourseVisibility) {
    setOpen(false);
    if (value === visibility) return;
    const ok = await updateCourse({ visibility: value });
    if (ok) {
      setVisibility(value);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
      {/* Status toggle */}
      <button
        type="button"
        onClick={toggleStatus}
        disabled={saving}
        title={status === "published" ? "Unpublish" : "Publish"}
        className="flex items-center gap-1.5 px-2 py-1 font-jetbrains text-[9px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5] disabled:opacity-50"
        style={{
          border: "1px solid #C8B882",
          color: status === "published" ? "#2E7D32" : "#B8860B",
        }}
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : status === "published" ? (
          <ToggleRight className="h-3.5 w-3.5" />
        ) : (
          <ToggleLeft className="h-3.5 w-3.5" />
        )}
        {status === "published" ? "Live" : "Draft"}
      </button>

      {/* Visibility dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={saving}
          className="flex items-center gap-1.5 px-2 py-1 font-jetbrains text-[9px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5] disabled:opacity-50"
          style={{ border: "1px solid #C8B882", color: currentVis.color }}
        >
          <currentVis.icon className="h-3.5 w-3.5" />
          {currentVis.label}
          <ChevronDown className="h-3 w-3" style={{ color: "#8B7355" }} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-1 z-50 min-w-[160px] py-1 shadow-lg"
            style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => changeVisibility(opt.value)}
                className="flex items-center gap-2 w-full px-3 py-2 text-left font-jetbrains text-[10px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5]"
                style={{
                  color: opt.color,
                  background: visibility === opt.value ? "#F7F2E7" : "transparent",
                }}
              >
                <opt.icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
