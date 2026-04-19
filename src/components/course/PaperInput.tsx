"use client";

import { useState } from "react";
import { BookOpen, X, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Props {
  onAdd: (data: { url: string; title: string; description: string }) => void;
}

export function PaperInput({ onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (() => {
    if (!url.trim()) return null;
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  })();

  function handleAdd() {
    if (!isValidUrl) {
      setError("Please enter a valid URL (https://...)");
      return;
    }
    onAdd({
      url: url.trim(),
      title: title.trim() || "Untitled Paper",
      description: description.trim(),
    });
    setUrl("");
    setTitle("");
    setDescription("");
    setError(null);
  }

  return (
    <div className="space-y-3">
      {/* Google Docs tip banner */}
      <div
        className="flex items-start gap-2.5 px-3 py-2.5 text-[12px] font-source-serif leading-relaxed"
        style={{ background: "#F4E8C1", border: "1px solid #C8B882", color: "#5C4E35" }}
      >
        <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#C0392B" }} />
        <span>
          Paste a link to the paper (arXiv, Google Scholar, etc.).
          For offline papers, save to{" "}
          <a
            href="https://docs.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
            style={{ color: "#C0392B" }}
          >
            Google Docs
          </a>{" "}
          and share the link — this lets NotebookLM access the content.
        </span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="Paste paper URL (arXiv, Google Docs, etc.)"
            className="w-full px-3 py-2 font-source-serif text-[14px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
          />
        </div>
        {url && (
          <button
            type="button"
            onClick={() => { setUrl(""); setTitle(""); setDescription(""); setError(null); }}
            className="px-2 py-2"
            style={{ color: "#8B7355" }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Validation */}
      {url.trim() && (
        <div className="flex items-center gap-2 text-[12px] font-jetbrains">
          {isValidUrl ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">Valid URL</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-600">Not a valid URL</span>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-[12px] font-source-serif" style={{ color: "#C0392B" }}>{error}</p>
      )}

      {isValidUrl && (
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paper title"
            className="w-full px-3 py-2 font-source-serif text-[14px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              className="flex-1 px-3 py-2 font-source-serif text-[14px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
              style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
            />
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider shrink-0"
              style={{ background: "#1C1610", color: "#F7F2E7" }}
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Add
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
