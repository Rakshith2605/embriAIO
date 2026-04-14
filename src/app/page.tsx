import { LandingNav } from "@/components/landing/LandingNav";
import { CourseCard } from "@/components/landing/CourseCard";
import { COURSES } from "@/lib/courses";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "embriAIO — Learn AI from First Principles",
  description:
    "Hands-on AI courses with real code, real notebooks, and video walkthroughs. Start with LLMs from Scratch and grow through quantization, fine-tuning, RAG, diffusion models, and more.",
};

export default function LandingPage() {
  const available = COURSES.filter((c) => c.status === "available" || c.status === "beta");
  const comingSoon = COURSES.filter((c) => c.status === "coming-soon");

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* ── Hero ── */}
        <section className="pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-primary" />
            Open-source · Free · Code-first
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4 leading-tight">
            Learn AI from
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> First Principles</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hands-on courses built around the best open-source books and researchers.
            Real code, real notebooks, video walkthroughs — no fluff.
          </p>
        </section>

        {/* ── Available courses ── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-foreground">Courses</h2>
            <span className="text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-0.5 font-medium">
              {available.length} available
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {available.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* ── Coming soon ── */}
        {comingSoon.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-foreground">Coming Soon</h2>
              <span className="text-xs rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-0.5 font-medium">
                {comingSoon.length} in development
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {comingSoon.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>embriAIO — AI learning platform built on open-source research</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Rakshith2605/embriAIO"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/rasbt/LLMs-from-scratch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LLMs-from-Scratch ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
