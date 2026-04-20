"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function AuthorizeForm() {
  const searchParams = useSearchParams();

  const clientId = searchParams.get("client_id") ?? "";
  const redirectUri = searchParams.get("redirect_uri") ?? "";
  const state = searchParams.get("state") ?? "";
  const codeChallenge = searchParams.get("code_challenge") ?? "";

  const [pat, setPat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  async function handleAuthorize() {
    const token = generatedToken ?? pat.trim();
    if (!token) {
      setError("Please enter or generate a token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mcp/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pat: token,
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          code_challenge: codeChallenge,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Authorization failed");
        return;
      }

      window.location.href = data.redirect_url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Claude Connector (${new Date().toLocaleDateString()})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ?? "Failed to generate token. Are you signed in?"
        );
        return;
      }

      setGeneratedToken(data.token);
      setPat(data.token);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      style={{ background: "#F7F2E7", minHeight: "100vh" }}
      className="flex items-center justify-center px-4"
    >
      <div
        style={{
          background: "#FFFDF5",
          border: "1px solid #C8B882",
          maxWidth: "480px",
        }}
        className="w-full p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <h1
            className="font-playfair font-bold text-[24px]"
            style={{ color: "#1C1610" }}
          >
            Authorize emrAIo
          </h1>
          <p
            className="font-source-serif text-[14px]"
            style={{ color: "#5C4E35" }}
          >
            Connect your emrAIo account to use with Claude
          </p>
        </div>

        <div
          style={{ background: "#F7F2E7", border: "1px solid #C8B882" }}
          className="p-4"
        >
          <p
            className="font-jetbrains text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "#A08E6B" }}
          >
            This will allow Claude to:
          </p>
          <ul
            className="space-y-1 font-source-serif text-[13px]"
            style={{ color: "#5C4E35" }}
          >
            <li>• Create and manage learning courses</li>
            <li>• Search YouTube and academic papers</li>
            <li>• Track your learning progress</li>
          </ul>
        </div>

        {error && (
          <div
            style={{
              background: "#FFF0F0",
              border: "1px solid #E6A8A8",
              color: "#C0392B",
            }}
            className="p-3 font-source-serif text-[13px]"
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <label
            className="block font-jetbrains text-[10px] uppercase tracking-wider"
            style={{ color: "#8B7355" }}
          >
            Personal Access Token
          </label>
          <input
            type="password"
            value={pat}
            onChange={(e) => {
              setPat(e.target.value);
              setGeneratedToken(null);
            }}
            placeholder="pat_..."
            className="w-full px-4 py-3 font-jetbrains text-[13px] border outline-none focus:ring-1 focus:ring-[#C0392B]"
            style={{
              background: "#FFFDF5",
              borderColor: "#C8B882",
              color: "#1C1610",
            }}
            disabled={!!generatedToken}
          />
          <p
            className="font-source-serif text-[11px]"
            style={{ color: "#A08E6B" }}
          >
            Don&apos;t have a token?{" "}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="underline"
              style={{ color: "#C0392B" }}
            >
              {generating ? "Generating..." : "Generate one now"}
            </button>{" "}
            (requires sign-in)
          </p>
        </div>

        {generatedToken && (
          <div
            style={{
              background: "#F0FFF0",
              border: "1px solid #A8E6A8",
            }}
            className="p-3"
          >
            <p
              className="font-jetbrains text-[10px] uppercase tracking-wider mb-1"
              style={{ color: "#2D7D2D" }}
            >
              Token Generated &mdash; save it now!
            </p>
            <code
              className="font-jetbrains text-[11px] break-all"
              style={{ color: "#1C1610" }}
            >
              {generatedToken}
            </code>
          </div>
        )}

        <button
          onClick={handleAuthorize}
          disabled={loading || (!pat.trim() && !generatedToken)}
          className="w-full py-3 font-jetbrains text-[12px] uppercase tracking-wider transition-colors disabled:opacity-50"
          style={{
            background: "#1C1610",
            color: "#F7F2E7",
            border: "1px solid #1C1610",
          }}
        >
          {loading ? "Authorizing..." : "Authorize"}
        </button>

        <p
          className="text-center font-source-serif text-[11px]"
          style={{ color: "#A08E6B" }}
        >
          You can revoke this token at any time from your settings.
        </p>
      </div>
    </div>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ background: "#F7F2E7", minHeight: "100vh" }}
          className="flex items-center justify-center"
        >
          <p
            className="font-source-serif text-[14px]"
            style={{ color: "#5C4E35" }}
          >
            Loading...
          </p>
        </div>
      }
    >
      <AuthorizeForm />
    </Suspense>
  );
}
