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

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/");

  const available = COURSES.filter((c) => c.status !== "coming-soon");
  const comingSoon = COURSES.filter((c) => c.status === "coming-soon");

  return (
    <div style={GRAPH_PAPER_BG} className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 pb-24">

        {/* Welcome eyebrow */}
        <div className="pt-12 pb-8">
          <p
            className="font-jetbrains text-[10px] tracking-[0.2em] uppercase mb-2"
            style={{ color: "#A08E6B" }}
          >
            § 1.0 — Welcome back, {session.user?.name?.split(" ")[0]}
          </p>
          <h1
            className="font-playfair font-bold text-[32px] leading-tight"
            style={{ color: "#1C1610" }}
          >
            Your Courses
          </h1>
          <p
            className="font-source-serif font-light text-[15px] leading-relaxed mt-2 max-w-xl"
            style={{ color: "#5C4E35" }}
          >
            Hands-on courses built around open-source research. Real code, real mathematics,
            video walkthroughs — no abstraction without understanding.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <p
            className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap"
            style={{ color: "#A08E6B" }}
          >
            § 2.0 — Available
          </p>
          <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
        </div>

        <div className="space-y-3 mb-12">
          {available.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-6">
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
          <p className="font-jetbrains text-[10px]" style={{ color: "#A08E6B" }}>
            no black boxes. no purple gradients.
          </p>
        </div>
      </footer>
    </div>
  );
}
