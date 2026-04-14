import { LandingNav } from "@/components/landing/LandingNav";
import { CourseCard } from "@/components/landing/CourseCard";
import { COURSES } from "@/lib/courses";

export const metadata = {
  title: "embriAIO — Learn AI from First Principles",
  description: "Hands-on AI courses with real notebooks and video walkthroughs.",
};

export default function LandingPage() {
  const available = COURSES.filter((c) => c.status !== "coming-soon");
  const comingSoon = COURSES.filter((c) => c.status === "coming-soon");

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Learn AI from First Principles
          </h1>
          <p className="text-sm text-muted-foreground">
            Real code, real notebooks, video walkthroughs — no fluff.
          </p>
        </div>

        {/* Available */}
        <section className="mb-10">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Courses</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {available.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Coming Soon</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {comingSoon.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
