import { LandingNav } from "@/components/landing/LandingNav";
import { CourseCard } from "@/components/landing/CourseCard";
import { NotebookDiagramSVG } from "@/components/landing/NotebookDiagramSVG";
import { COURSES } from "@/lib/courses";

export const metadata = {
  title: "embriAIO — Learn AI from First Principles",
  description: "Hands-on AI courses with real notebooks and video walkthroughs.",
};

const GRAPH_PAPER_BG = {
  background: '#F7F2E7',
  backgroundImage:
    'linear-gradient(rgba(180,160,100,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.12) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
} as React.CSSProperties;

export default function LandingPage() {
  const available = COURSES.filter((c) => c.status !== "coming-soon");
  const comingSoon = COURSES.filter((c) => c.status === "coming-soon");

  return (
    <div style={GRAPH_PAPER_BG} className="min-h-screen">
      <LandingNav />

      <main className="mx-auto max-w-5xl px-6 pb-24">

        {/* Hero: 2-column */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          <div>
            {/* Eyebrow */}
            <p className="font-jetbrains text-[11px] tracking-[0.12em] uppercase text-pg-faint mb-6">
              § 1.0 — Introduction
            </p>

            {/* H1 */}
            <h1 className="font-playfair text-5xl font-bold text-pg-ink leading-tight mb-4">
              Learn AI from<br />
              <em
                className="font-normal not-italic text-pg-rust"
                style={{ fontStyle: 'italic' }}
              >
                First Principles
              </em>
            </h1>

            {/* Body */}
            <p className="font-source-serif font-light text-pg-muted text-base leading-relaxed max-w-[420px] mb-8">
              Hands-on courses built around open-source research. Real code,
              real mathematics, video walkthroughs — no abstraction without understanding.
            </p>

            {/* CTA */}
            <a
              href="/chapter/ch01"
              className="inline-block font-jetbrains text-[12px] tracking-[0.12em] uppercase bg-pg-ink text-pg-parchment px-6 py-3 hover:bg-pg-rust transition-colors"
            >
              Start Learning →
            </a>
          </div>

          <div className="hidden lg:block">
            <NotebookDiagramSVG />
          </div>
        </section>

        {/* Courses section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <p className="font-jetbrains text-[11px] tracking-[0.12em] uppercase text-pg-faint whitespace-nowrap">
              § 2.0 — Courses
            </p>
            <div className="flex-1 h-px bg-pg-gold/60" />
          </div>
          <div className="space-y-3">
            {available.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>

        {/* In Development section */}
        {comingSoon.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <p className="font-jetbrains text-[11px] tracking-[0.12em] uppercase text-pg-faint whitespace-nowrap">
                § 3.0 — In Development
              </p>
              <div className="flex-1 h-px bg-pg-gold/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {comingSoon.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #C8B882' }} className="py-5">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
          <p className="font-jetbrains text-[10px] tracking-[0.1em] text-pg-faint uppercase">
            embriAIo — open-source AI education
          </p>
          <p className="font-jetbrains text-[10px] tracking-[0.1em] text-pg-faint">
            no black boxes. no purple gradients.
          </p>
        </div>
      </footer>
    </div>
  );
}
