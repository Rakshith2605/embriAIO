import Link from "next/link";
import { User, Video, FileCode } from "lucide-react";
import type { CourseSummary } from "@/types/user-course";

const ACCENT_MAP: Record<string, string> = {
  violet:  "#8B5CF6",
  blue:    "#3B82F6",
  orange:  "#F97316",
  emerald: "#10B981",
  cyan:    "#06B6D4",
  pink:    "#EC4899",
  yellow:  "#EAB308",
  red:     "#EF4444",
  indigo:  "#6366F1",
  teal:    "#14B8A6",
};

export function UserCourseCard({ course }: { course: CourseSummary }) {
  const accent = ACCENT_MAP[course.accent_color as string] ?? "#C0392B";

  return (
    <Link
      href={`/course/${course.slug}`}
      className="block p-4 group transition-colors hover:bg-[#F0EAD8]"
      style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
    >
      {/* Accent bar */}
      <div className="w-10 h-1 mb-3" style={{ background: accent }} />

      <h3
        className="font-playfair font-bold text-[16px] leading-snug mb-1 group-hover:underline"
        style={{ color: "#1C1610" }}
      >
        {course.title}
      </h3>

      {course.description && (
        <p
          className="font-source-serif text-[13px] leading-relaxed line-clamp-2 mb-3"
          style={{ color: "#5C4E35" }}
        >
          {course.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center gap-1 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
          {course.chapter_count} ch
        </span>
        {course.video_count > 0 && (
          <span className="flex items-center gap-1 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
            <Video className="h-3 w-3" />
            {course.video_count}
          </span>
        )}
        {course.notebook_count > 0 && (
          <span className="flex items-center gap-1 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
            <FileCode className="h-3 w-3" />
            {course.notebook_count}
          </span>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-2">
        {course.author?.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={course.author.image} alt="" className="w-4 h-4 rounded-full" />
        ) : (
          <User className="w-3.5 h-3.5" style={{ color: "#8B7355" }} />
        )}
        <span className="font-source-serif text-[11px]" style={{ color: "#8B7355" }}>
          {course.author?.name ?? "Unknown"}
        </span>
      </div>
    </Link>
  );
}
