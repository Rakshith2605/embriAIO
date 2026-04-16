"use client";

import { useState } from "react";
import { parseColabUrl } from "@/lib/colab-utils";
import { FileCode, X, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  onAdd: (data: { colab_url: string; title: string; description: string }) => void;
}

export function ColabInput({ onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parsed = url.trim() ? parseColabUrl(url) : null;

  function handleAdd() {
    if (!parsed) {
      setError("Invalid Colab URL");
      return;
    }
    onAdd({
      colab_url: parsed.openUrl,
      title: title.trim() || "Untitled Notebook",
      description: description.trim(),
    });
    setUrl("");
    setTitle("");
    setDescription("");
    setError(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="Paste Google Colab URL"
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
          {parsed ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">
                Valid Colab link ({parsed.type === "drive" ? "Google Drive" : "GitHub"})
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-600">
                Not a valid Colab URL
              </span>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-[12px] font-source-serif" style={{ color: "#C0392B" }}>{error}</p>
      )}

      {parsed && (
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notebook title"
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
                <FileCode className="h-3.5 w-3.5" />
                Add
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
