"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CourseDefinition } from "@/lib/courses";

function readProgress(key: string, total: number): { pct: number; done: number } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { pct: 0, done: 0 };
    const state = JSON.parse(raw) as { notebooks?: Record<string, string> };
    const done = Object.values(state.notebooks ?? {}).filter((s) => s === "completed").length;
    return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done };
  } catch {
    return { pct: 0, done: 0 };
  }
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
      <circle cx="28" cy="28" r={r} fill="none" stroke="#C8B882" strokeWidth="3" opacity="0.35" />
      <circle
        cx="28" cy="28" r={r} fill="none"
        stroke={pct === 100 ? "#1C8A4A" : "#C0392B"}
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="28" y="33" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="11" fill={pct === 100 ? "#1C8A4A" : "#1C1610"}>
        {pct}%
      </text>
    </svg>
  );
}

export function CourseCard({ course }: { course: CourseDefinition }) {
  const [prog, setProg] = useState<{ pct: number; done: number } | null>(null);

  useEffect(() => {
    if (course.progressLocalStorageKey && course.totalNotebooks) {
      setProg(readProgress(course.progressLocalStorageKey, course.totalNotebooks));
    }
  }, [course.progressLocalStorageKey, course.totalNotebooks]);

  const available = course.status === "available" || course.status === "beta";

  /* ── Coming-soon card ────────────────────────────────── */
  if (!available) {
    return (
      <div
        style={{ border: "1px dashed #C8B882", background: "rgba(255,253,245,0.55)" }}
        className="flex flex-col gap-2 p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-playfair font-bold text-[17px] text-pg-ink leading-snug">
            {course.title}
          </h3>
          <span className="shrink-0 font-jetbrains text-[9px] tracking-widest uppercase text-pg-faint border border-dashed border-[#C8B882] px-1.5 py-0.5 mt-0.5">
            Soon
          </span>
        </div>
        <p className="font-source-serif font-light text-[13px] text-pg-muted leading-relaxed line-clamp-2">
          {course.description}
        </p>
        <p className="font-jetbrains text-[10px] text-pg-faint tracking-wide mt-1">
          {[
            course.chapters ? `${course.chapters} chapters` : null,
            course.videos   ? `${course.videos} videos`   : null,
            course.notebooks ? `${course.notebooks} notebooks` : null,
          ].filter(Boolean).join("  ·  ")}
        </p>
      </div>
    );
  }

  /* ── Available / featured card ───────────────────────── */
  const ctaLabel =
    !prog || prog.pct === 0 ? "Start course →"
    : prog.pct === 100      ? "Review course →"
    :                          "Continue →";

  return (
    <Link href={course.href} className="group block">
      <div
        style={{
          border: "1px solid #C8B882",
          borderLeft: "3px solid #C0392B",
          background: "#FFFDF5",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        className="group-hover:shadow-[0_4px_20px_rgba(28,22,16,0.08)]"
      >
        {/* Top strip */}
        <div className="flex items-start gap-6 p-6 pb-4">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <p className="font-jetbrains text-[9px] tracking-[0.18em] uppercase text-pg-rust mb-2">
              § available now
            </p>
            <h3 className="font-playfair font-bold text-[26px] text-pg-ink leading-snug mb-2">
              {course.title}
            </h3>
            <p className="font-source-serif font-light text-[14px] text-pg-muted leading-relaxed max-w-xl">
              {course.description}
            </p>
          </div>

          {/* Right: progress ring */}
          {prog !== null && (
            <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
              <ProgressRing pct={prog.pct} />
              <p className="font-jetbrains text-[9px] text-pg-faint text-center whitespace-nowrap">
                {prog.done}/{course.totalNotebooks ?? course.notebooks ?? 0}
                <br />notebooks
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-2">
          <div className="h-[3px] bg-[#C8B882]/30 overflow-hidden w-full">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${prog?.pct ?? 0}%`,
                background: prog?.pct === 100 ? "#1C8A4A" : "#C0392B",
              }}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderTop: "1px solid #C8B882", background: "rgba(199,184,130,0.06)" }}
        >
          <p className="font-jetbrains text-[10px] text-pg-faint tracking-wide">
            {[
              course.chapters  ? `${course.chapters} chapters`  : null,
              course.videos    ? `${course.videos} videos`      : null,
              course.notebooks ? `${course.notebooks} notebooks` : null,
            ].filter(Boolean).join("  ·  ")}
          </p>
          <span className="font-jetbrains text-[11px] text-pg-rust group-hover:translate-x-0.5 transition-transform inline-block">
            {ctaLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
