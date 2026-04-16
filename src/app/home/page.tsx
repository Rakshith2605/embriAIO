import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LandingNav } from "@/components/landing/LandingNav";
import { CourseGenreRows } from "@/components/landing/CourseGenreRows";

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
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
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
        </div>
      </section>

      {/* ── Course Genre Rows (Netflix-style) ──────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto pt-8 pb-24">
        <CourseGenreRows />
      </main>

      <footer className="py-5 px-6" style={{ borderTop: "1px solid #C8B882" }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between">
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
