"use client";

import { useState } from "react";
import { parseVideoUrl, getVideoThumbnail } from "@/lib/video-utils";
import { Video, X, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  onAdd: (data: { url: string; title: string }) => void;
}

export function VideoInput({ onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parsed = url.trim() ? parseVideoUrl(url) : null;
  const thumbnail = parsed ? getVideoThumbnail(parsed) : null;

  function handleAdd() {
    if (!parsed) {
      setError("Invalid video URL. Supported: YouTube, PeerTube");
      return;
    }
    onAdd({ url: url.trim(), title: title.trim() || `${parsed.platform} video` });
    setUrl("");
    setTitle("");
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
            placeholder="Paste video URL (YouTube, PeerTube)"
            className="w-full px-3 py-2 font-source-serif text-[14px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
          />
        </div>
        {url && (
          <button
            type="button"
            onClick={() => { setUrl(""); setTitle(""); setError(null); }}
            className="px-2 py-2"
            style={{ color: "#8B7355" }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Validation status */}
      {url.trim() && (
        <div className="flex items-center gap-2 text-[12px] font-jetbrains">
          {parsed ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">
                Detected: {parsed.platform} video
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-600">
                Not a recognized video URL
              </span>
            </>
          )}
        </div>
      )}

      {/* Thumbnail preview */}
      {thumbnail && (
        <div className="relative w-48 aspect-video overflow-hidden border border-[#C8B882]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Video className="h-8 w-8 text-white/80" />
          </div>
        </div>
      )}

      {error && (
        <p className="text-[12px] font-source-serif" style={{ color: "#C0392B" }}>{error}</p>
      )}

      {parsed && (
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title (optional)"
            className="flex-1 px-3 py-2 font-source-serif text-[14px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
            style={{ background: "#FFFDF5", borderColor: "#C8B882", color: "#1C1610" }}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider"
            style={{ background: "#1C1610", color: "#F7F2E7" }}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
