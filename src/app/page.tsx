import { LandingNav } from "@/components/landing/LandingNav";
import { CourseCard } from "@/components/landing/CourseCard";
import { NeuralNetSVG } from "@/components/landing/NeuralNetSVG";
import { COURSES } from "@/lib/courses";

export const metadata = {
  title: "embriAIO — Learn AI from First Principles",
  description: "Hands-on AI courses with real notebooks and video walkthroughs.",
};

export default function LandingPage() {
  const available = COURSES.filter((c) => c.status !== "coming-soon");
  const comingSoon = COURSES.filter((c) => c.status === "coming-soon");

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.13) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <LandingNav />

        <main className="mx-auto max-w-5xl px-6 pb-24">
          {/* ── Hero ── */}
          <section className="py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: text */}
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3 leading-tight">
                Learn AI from<br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  First Principles
                </span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real code, real notebooks, video walkthroughs — no fluff.
              </p>
            </div>

            {/* Right: neural network animation */}
            <div className="hidden lg:flex items-center justify-center h-56 opacity-80">
              <NeuralNetSVG />
            </div>
          </section>

          {/* ── Available courses ── */}
          <section className="mb-12">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Courses
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {available.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>

          {/* ── Coming soon ── */}
          {comingSoon.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Coming Soon
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {comingSoon.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
