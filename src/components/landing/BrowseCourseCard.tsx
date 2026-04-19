"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, User, Video, FileCode, BookOpen, Shield } from "lucide-react";
import type { BrowseCourse } from "@/app/api/courses/browse/route";

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

function StarRating({
  rating,
  interactive,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <Star
          key={v}
          className="h-3.5 w-3.5 transition-colors"
          style={{
            color: v <= (hover || rating) ? "#EAB308" : "#C8B882",
            fill: v <= (hover || rating) ? "#EAB308" : "none",
            cursor: interactive ? "pointer" : "default",
          }}
          onMouseEnter={interactive ? () => setHover(v) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          onClick={interactive && onRate ? () => onRate(v) : undefined}
        />
      ))}
    </span>
  );
}

export function BrowseCourseCard({ course, onSubscriptionChange }: {
  course: BrowseCourse;
  onSubscriptionChange?: () => void;
}) {
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(course.is_subscribed);
  const [rating, setRating] = useState(course.user_rating ?? 0);
  const [avgRating, setAvgRating] = useState(course.avg_rating);
  const [ratingCount, setRatingCount] = useState(course.rating_count);

  const accent = ACCENT_MAP[course.accent_color] ?? "#C0392B";
  const isPlatform = course.course_type === "platform";
  const isAvailable = course.status === "published" || (isPlatform && course.href && course.href !== "#");
  const courseHref = isPlatform ? (course.href ?? "#") : `/course/${course.slug}`;

  async function handleSubscribe(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSubscribing(true);
    try {
      const method = isSubscribed ? "DELETE" : "POST";
      const res = await fetch(`/api/courses/${course.id}/subscribe`, { method });
      if (res.ok) {
        setIsSubscribed(!isSubscribed);
        onSubscriptionChange?.();
      }
    } finally {
      setSubscribing(false);
    }
  }

  async function handleRate(value: number) {
    const prev = rating;
    setRating(value);
    try {
      const res = await fetch(`/api/courses/${course.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      if (res.ok) {
        const data = await res.json();
        // Recalculate: if no prev rating, add; otherwise replace
        const newCount = prev === 0 ? ratingCount + 1 : ratingCount;
        const newSum = (avgRating * ratingCount) - prev + value;
        setAvgRating(Number((newSum / newCount).toFixed(1)));
        setRatingCount(newCount);
        // Also use server data if available
        if (data.rating) setRating(data.rating);
      } else {
        setRating(prev);
      }
    } catch {
      setRating(prev);
    }
  }

  const comingSoon = !isAvailable;

  return (
    <div
      className="flex-shrink-0 w-[280px] group relative"
      style={{
        background: "#FFFDF5",
        border: "1px solid #C8B882",
        borderTop: `3px solid ${accent}`,
        opacity: comingSoon ? 0.7 : 1,
      }}
    >
      <Link href={comingSoon ? "#" : courseHref} className="block p-4 pb-2">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-2">
          {comingSoon ? (
            <span className="font-jetbrains text-[8px] tracking-widest uppercase px-1.5 py-0.5" style={{ color: "#8B7355", border: "1px dashed #C8B882" }}>
              Coming Soon
            </span>
          ) : (
            <span className="font-jetbrains text-[8px] tracking-widest uppercase px-1.5 py-0.5" style={{ color: "#C0392B", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.15)" }}>
              Available
            </span>
          )}
          {/* Subscriber count */}
          {course.subscriber_count > 0 && (
            <span className="font-jetbrains text-[9px]" style={{ color: "#8B7355" }}>
              {course.subscriber_count} subscriber{course.subscriber_count !== 1 ? "s" : ""}
            </span>
          )}
          {course.visibility === "restricted" && (
            <span className="flex items-center gap-1 font-jetbrains text-[8px] tracking-widest uppercase px-1.5 py-0.5" style={{ color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B" }}>
              <Shield className="h-3 w-3" /> Restricted
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-playfair font-bold text-[16px] leading-snug mb-1 group-hover:underline"
          style={{ color: "#1C1610" }}
        >
          {course.title}
        </h3>

        {/* Description */}
        <p
          className="font-source-serif text-[12px] leading-relaxed line-clamp-2 mb-3"
          style={{ color: "#5C4E35" }}
        >
          {course.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-2">
          {course.chapters_count > 0 && (
            <span className="flex items-center gap-1 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
              <BookOpen className="h-3 w-3" /> {course.chapters_count}
            </span>
          )}
          {course.videos_count > 0 && (
            <span className="flex items-center gap-1 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
              <Video className="h-3 w-3" /> {course.videos_count}
            </span>
          )}
          {course.notebooks_count > 0 && (
            <span className="flex items-center gap-1 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
              <FileCode className="h-3 w-3" /> {course.notebooks_count}
            </span>
          )}
        </div>

        {/* Author */}
        <Link
          href={`/profile/${course.author?.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-2 hover:underline"
        >
          {course.author?.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={course.author.image} alt="" className="w-4 h-4 rounded-full" />
          ) : (
            <User className="w-3.5 h-3.5" style={{ color: "#8B7355" }} />
          )}
          <span className="font-source-serif text-[11px]" style={{ color: "#8B7355" }}>
            {course.author?.name ?? "emrAIo"}
          </span>
        </Link>

        {/* Rating display */}
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(avgRating)} />
          {ratingCount > 0 && (
            <span className="font-jetbrains text-[9px]" style={{ color: "#8B7355" }}>
              {avgRating} ({ratingCount})
            </span>
          )}
        </div>
      </Link>

      {/* Bottom actions bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderTop: "1px solid #C8B882", background: "rgba(199,184,130,0.06)" }}
      >
        {/* Rate (interactive) */}
        {!course.is_owner && isAvailable && (
          <StarRating rating={rating} interactive onRate={handleRate} />
        )}
        {(course.is_owner || comingSoon) && <span />}

        {/* Subscribe button */}
        {!course.is_owner && isAvailable && (
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="font-jetbrains text-[10px] tracking-wider uppercase px-3 py-1 transition-colors"
            style={{
              background: isSubscribed ? "#1C1610" : "transparent",
              color: isSubscribed ? "#F7F2E7" : "#C0392B",
              border: `1px solid ${isSubscribed ? "#1C1610" : "#C0392B"}`,
            }}
          >
            {subscribing ? "..." : isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
        {course.is_owner && (
          <span className="font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
            Your course
          </span>
        )}
      </div>
    </div>
  );
}
