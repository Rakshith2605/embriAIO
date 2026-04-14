import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LandingNav } from "@/components/landing/LandingNav";
import { CourseCard } from "@/components/landing/CourseCard";
import { COURSES } from "@/lib/courses";

export const metadata = {
  title: "embriAIo — Courses",
  description: "Hands-on AI courses built around open-source research.",
};

const GRAPH_PAPER_BG = {
  background: "#F7F2E7",
  backgroundImage:
    "linear-gradient(rgba(180,160,100,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.12) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
} as React.CSSProperties;

const available = COURSES.filter((c) => c.status !== "coming-soon");
const comingSoon = COURSES.filter((c) => c.status === "coming-soon");
const totalChapters  = available.reduce((s, c) => s + (c.chapters  ?? 0), 0);
const totalVideos    = available.reduce((s, c) => s + (c.videos    ?? 0), 0);
const totalNotebooks = available.reduce((s, c) => s + (c.notebooks ?? 0), 0);

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/");

  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  return (
    <div style={GRAPH_PAPER_BG} className="min-h-screen flex flex-col">
      <LandingNav />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        style={{ borderBottom: "1px solid #C8B882", background: "#F0EAD8" }}
        className="w-full"
      >
        <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          {/* Left */}
          <div>
            <p
              className="font-jetbrains text-[10px] tracking-[0.22em] uppercase mb-3"
              style={{ color: "#C0392B" }}
            >
              § embriAIo — welcome back, {firstName}
            </p>
            <h1
              className="font-playfair font-bold leading-tight mb-3"
              style={{ color: "#1C1610", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
            >
              Learn AI from<br />First Principles
            </h1>
            <p
              className="font-source-serif font-light text-[15px] leading-relaxed max-w-lg"
              style={{ color: "#5C4E35" }}
            >
              Real code, real mathematics, video walkthroughs —<br className="hidden sm:block" />
              no abstraction without understanding.
            </p>
          </div>

          {/* Right: stat pills */}
          <div className="flex flex-wrap gap-3 sm:justify-end">
            {[
              { value: available.length, label: "course" + (available.length !== 1 ? "s" : "") + " live" },
              { value: comingSoon.length, label: "in development" },
              { value: totalChapters,  label: "chapters"  },
              { value: totalVideos,    label: "videos"    },
              { value: totalNotebooks, label: "notebooks" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center px-4 py-2.5 min-w-[68px]"
                style={{ border: "1px solid #C8B882", background: "#FFFDF5" }}
              >
                <span
                  className="font-playfair font-bold text-[22px] leading-none"
                  style={{ color: "#1C1610" }}
                >
                  {s.value}
                </span>
                <span
                  className="font-jetbrains text-[9px] tracking-[0.1em] uppercase mt-1 text-center"
                  style={{ color: "#8B7355" }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 pb-24">

        {/* Available */}
        <div className="flex items-center gap-4 mt-8 mb-5">
          <p
            className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap"
            style={{ color: "#A08E6B" }}
          >
            § 2.0 — Available
          </p>
          <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
        </div>

        <div className="space-y-4 mb-12">
          {available.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-5">
              <p
                className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap"
                style={{ color: "#A08E6B" }}
              >
                § 3.0 — In Development
              </p>
              <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {comingSoon.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </>
        )}

      </main>

      <footer className="py-5 px-6" style={{ borderTop: "1px solid #C8B882" }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <p
            className="font-jetbrains text-[10px] uppercase tracking-[0.1em]"
            style={{ color: "#A08E6B" }}
          >
            embriAIo — open-source AI education
          </p>
        </div>
      </footer>
    </div>
  );
}
