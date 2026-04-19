"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

export function AccessRequestButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to send request");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <span
        className="inline-flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider"
        style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #F59E0B" }}
      >
        ⏳ Request Sent
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:opacity-90 disabled:opacity-50"
        style={{ background: "#C0392B", color: "#FFFDF5", border: "1px solid #C0392B" }}
      >
        <Shield className="h-4 w-4" />
        {loading ? "Sending..." : "Request Access"}
      </button>
      {error && (
        <p className="mt-2 font-source-serif text-[12px]" style={{ color: "#DC2626" }}>{error}</p>
      )}
    </div>
  );
}
