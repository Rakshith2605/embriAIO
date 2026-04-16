"use client";

import { useEffect, useState } from "react";
import { UserCourseCard } from "./UserCourseCard";
import { Loader2 } from "lucide-react";
import type { CourseSummary } from "@/types/user-course";

export function CommunityCourses() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#C8B882" }} />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div
        className="text-center py-8"
        style={{ background: "#FFFDF5", border: "1px dashed #C8B882" }}
      >
        <p className="font-source-serif text-[14px]" style={{ color: "#8B7355" }}>
          No community courses published yet. Be the first to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {courses.map((c) => (
        <UserCourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}
