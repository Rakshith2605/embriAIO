"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { BrowseCourseCard } from "./BrowseCourseCard";
import type { BrowseCourse } from "@/app/api/courses/browse/route";

const CATEGORY_LABELS: Record<string, string> = {
  nlp: "Natural Language Processing",
  "computer-vision": "Computer Vision & Multimodal",
  optimization: "Optimization & Efficiency",
  general: "General",
};

function categoryOrder(cat: string): number {
  const order: Record<string, number> = { nlp: 0, "computer-vision": 1, optimization: 2, general: 3 };
  return order[cat] ?? 99;
}

function GenreRow({ label, courses, onSubscriptionChange }: {
  label: string;
  courses: BrowseCourse[];
  onSubscriptionChange: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, courses]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-4 mb-3 px-6">
        <h2
          className="font-playfair font-bold text-[18px]"
          style={{ color: "#1C1610" }}
        >
          {label}
        </h2>
        <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.4 }} />
        <span className="font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#A08E6B" }}>
          {courses.length} course{courses.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: "rgba(28,22,16,0.8)", color: "#F7F2E7" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: "rgba(28,22,16,0.8)", color: "#F7F2E7" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-6 pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {courses.map((c) => (
            <BrowseCourseCard key={c.id} course={c} onSubscriptionChange={onSubscriptionChange} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CourseGenreRows() {
  const [courses, setCourses] = useState<BrowseCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses/browse");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#C8B882" }} />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12" style={{ background: "#FFFDF5", border: "1px dashed #C8B882" }}>
        <p className="font-source-serif text-[14px]" style={{ color: "#8B7355" }}>
          No courses available yet.
        </p>
      </div>
    );
  }

  // Group by category
  const grouped = new Map<string, BrowseCourse[]>();
  for (const c of courses) {
    const cat = c.category || "general";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(c);
  }

  // Sort categories by predefined order
  const sortedCategories = [...grouped.entries()].sort(
    ([a], [b]) => categoryOrder(a) - categoryOrder(b)
  );

  return (
    <div>
      {sortedCategories.map(([cat, items]) => (
        <GenreRow
          key={cat}
          label={CATEGORY_LABELS[cat] ?? cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          courses={items}
          onSubscriptionChange={fetchCourses}
        />
      ))}
    </div>
  );
}
