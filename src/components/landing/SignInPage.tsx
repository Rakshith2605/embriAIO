"use client";

import { signIn } from "next-auth/react";
import { NotebookDiagramSVG } from "@/components/landing/NotebookDiagramSVG";
import { COURSES } from "@/lib/courses";

const GRAPH_PAPER_BG = {
  background: "#F7F2E7",
  backgroundImage:
    "linear-gradient(rgba(180,160,100,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.12) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
} as React.CSSProperties;

// Compute stats dynamically from course catalog
const available = COURSES.filter((c) => c.status !== "coming-soon");
const comingSoon = COURSES.filter((c) => c.status === "coming-soon");
const totalChapters = available.reduce((s, c) => s + (c.chapters ?? 0), 0);
const totalNotebooks = available.reduce((s, c) => s + (c.notebooks ?? 0), 0);
const totalVideos = available.reduce((s, c) => s + (c.videos ?? 0), 0);

const FEATURES = [
  {
    symbol: "§",
    label: `${available.length} course${available.length !== 1 ? "s" : ""} live · ${comingSoon.length} in development — library growing`,
  },
  {
    symbol: "▶",
    label: `${totalChapters} chapters · ${totalVideos} videos · ${totalNotebooks} notebooks with pre-computed outputs`,
  },
  {
    symbol: "●",
    label: "Progress synced to your account across all devices via the cloud",
  },
];

interface Props {
  callbackUrl?: string;
}

export function SignInPage({ callbackUrl }: Props) {
  const destination = callbackUrl ?? "/home";
  const isContinuing = !!callbackUrl;

  return (
    <div style={GRAPH_PAPER_BG} className="min-h-screen flex flex-col">

      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center h-14 px-6"
        style={{ background: "#F7F2E7", borderBottom: "1px solid #C8B882" }}
      >
        <span className="font-playfair font-bold text-[18px]" style={{ color: "#1C1610" }}>
          embri<span className="font-bold uppercase">AI</span>o
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — sign-in card */}
          <div>
            {/* Eyebrow */}
            <p
              className="font-jetbrains text-[10px] tracking-[0.2em] uppercase mb-4"
              style={{ color: "#C0392B" }}
            >
              § embriaio
            </p>

            {/* Logo */}
            <h1
              className="font-playfair font-bold leading-tight mb-3"
              style={{ color: "#1C1610", fontSize: "clamp(2.4rem, 5vw, 3.2rem)" }}
            >
              embri<span className="uppercase">AI</span>o
            </h1>

            {/* Tagline */}
            <p
              className="font-playfair text-[22px] leading-snug mb-5"
              style={{ color: "#C0392B", fontStyle: "italic" }}
            >
              Learn AI from First Principles
            </p>

            {/* Description */}
            <p
              className="font-source-serif font-light text-[15px] leading-relaxed mb-8 max-w-[400px]"
              style={{ color: "#5C4E35" }}
            >
              Hands-on courses built around open-source research. Real code, real
              mathematics, video walkthroughs — no abstraction without understanding.
            </p>

            {/* Features */}
            <ul className="space-y-2.5 mb-10">
              {FEATURES.map((f) => (
                <li key={f.label} className="flex items-start gap-3">
                  <span
                    className="font-jetbrains text-[11px] mt-0.5 shrink-0 w-4"
                    style={{ color: "#C0392B" }}
                  >
                    {f.symbol}
                  </span>
                  <span
                    className="font-jetbrains text-[11px] leading-relaxed"
                    style={{ color: "#5C4E35" }}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Sign-in box */}
            <div
              className="p-6 space-y-4"
              style={{
                border: "1px solid #C8B882",
                borderLeft: "3px solid #C0392B",
                background: "#FFFDF5",
              }}
            >
              {/* Context-aware prompt */}
              <p
                className="font-jetbrains text-[10px] tracking-[0.15em] uppercase"
                style={{ color: isContinuing ? "#C0392B" : "#A08E6B" }}
              >
                {isContinuing
                  ? "Sign in to continue learning"
                  : "Sign in to sync your progress"}
              </p>

              {/* Google button */}
              <button
                onClick={() => signIn("google", { callbackUrl: destination })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 font-jetbrains text-[11px] tracking-[0.08em] uppercase transition-colors"
                style={{ background: "#1C1610", color: "#F7F2E7" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#C0392B";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1C1610";
                }}
              >
                {/* Google G mark */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Fine print */}
            <p className="font-jetbrains text-[9px] mt-4" style={{ color: "#A08E6B" }}>
              Your progress is saved to your account and synced across all devices.
            </p>
          </div>

          {/* Right — diagram (desktop only) */}
          <div className="hidden lg:block">
            <NotebookDiagramSVG />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-6" style={{ borderTop: "1px solid #C8B882" }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.1em]" style={{ color: "#A08E6B" }}>
            embriAIo — open-source AI education
          </p>
        </div>
      </footer>
    </div>
  );
}
