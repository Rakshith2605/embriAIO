"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Circle,
  BarChart3,
  ArrowLeft,
  Shield,
  Check,
  X,
} from "lucide-react";

interface SubscriberProgress {
  completed: number;
  in_progress: number;
  not_started: number;
  total: number;
  percentage: number;
}

interface SubscriberStat {
  subscriber: {
    name: string | null;
    image: string | null;
    email: string;
  };
  subscribed_at: string;
  progress: SubscriberProgress;
}

interface ChapterStat {
  id: string;
  title: string;
  order: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
}

interface StatsData {
  course: {
    id: string;
    title: string;
    slug: string;
    status: string;
    published_at: string | null;
  };
  overview: {
    total_subscribers: number;
    completed_course: number;
    in_progress: number;
    not_started: number;
    total_chapters: number;
  };
  subscribers: SubscriberStat[];
  chapter_stats: ChapterStat[];
  growth: Record<string, number>;
}

interface AccessRequestItem {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  requester: { name: string | null; image: string | null; email: string } | null;
}

export default function CourseStatsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessRequests, setAccessRequests] = useState<AccessRequestItem[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAccessRequests = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/access/requests`);
      if (res.ok) {
        const data = await res.json();
        setAccessRequests(data);
      }
    } catch {
      // ignore
    }
  }, [courseId]);

  const handleAccessAction = async (requestId: string, action: "approve" | "deny") => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/courses/${courseId}/access/requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        await fetchAccessRequests();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/stats`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to load stats");
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStats();
    fetchAccessRequests();
  }, [fetchStats, fetchAccessRequests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-jetbrains text-[11px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
          Loading stats...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-20">
        <p className="font-source-serif text-[15px]" style={{ color: "#C0392B" }}>
          {error ?? "Stats not available"}
        </p>
        <Link href="/my-courses" className="font-jetbrains text-[11px] uppercase tracking-wider mt-4 inline-block hover:underline" style={{ color: "#C0392B" }}>
          ← Back to My Courses
        </Link>
      </div>
    );
  }

  const { course, overview, subscribers, chapter_stats, growth } = stats;

  // Growth chart data (last 30 days)
  const growthDays = Object.entries(growth).sort(([a], [b]) => a.localeCompare(b));
  const maxGrowth = Math.max(...Object.values(growth), 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/my-courses"
          className="flex items-center gap-1 font-jetbrains text-[10px] uppercase tracking-wider mb-4 hover:underline"
          style={{ color: "#C0392B" }}
        >
          <ArrowLeft className="h-3 w-3" />
          My Courses
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-5 w-5" style={{ color: "#C0392B" }} />
          <p className="font-jetbrains text-[10px] tracking-[0.22em] uppercase" style={{ color: "#C0392B" }}>
            § Course Stats
          </p>
        </div>
        <h1 className="font-playfair font-bold text-[28px]" style={{ color: "#1C1610" }}>
          {course.title}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span
            className="font-jetbrains text-[8px] uppercase tracking-wider px-2 py-0.5"
            style={{
              background: course.status === "published" ? "#E8F5E9" : "#FFF8E7",
              color: course.status === "published" ? "#2E7D32" : "#B8860B",
              border: `1px solid ${course.status === "published" ? "#C8E6C9" : "#E6D9A8"}`,
            }}
          >
            {course.status}
          </span>
          {course.published_at && (
            <span className="font-jetbrains text-[9px] tracking-wider" style={{ color: "#8B7355" }}>
              Published {new Date(course.published_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Subscribers"
          value={overview.total_subscribers}
          color="#2563EB"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed Course"
          value={overview.completed_course}
          color="#059669"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="In Progress"
          value={overview.in_progress}
          color="#CA8A04"
        />
        <StatCard
          icon={<Circle className="h-5 w-5" />}
          label="Not Started"
          value={overview.not_started}
          color="#8B7355"
        />
      </div>

      {/* Subscription Growth (last 30 days) */}
      {growthDays.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Subscription Growth" subtitle="Last 30 days" />
          <div className="p-4" style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}>
            <div className="flex items-end gap-1 h-32">
              {growthDays.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full min-h-[4px] transition-all"
                    style={{
                      background: "#C0392B",
                      height: `${(count / maxGrowth) * 100}%`,
                      opacity: 0.8,
                    }}
                    title={`${day}: ${count} new subscriber${count !== 1 ? "s" : ""}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-jetbrains text-[8px]" style={{ color: "#8B7355" }}>
                {growthDays[0]?.[0]}
              </span>
              <span className="font-jetbrains text-[8px]" style={{ color: "#8B7355" }}>
                {growthDays[growthDays.length - 1]?.[0]}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Chapter Completion Rates */}
      {chapter_stats.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Chapter Completion" subtitle={`${overview.total_chapters} chapters`} />
          <div className="space-y-2">
            {chapter_stats.map((ch, idx) => (
              <div
                key={ch.id}
                className="flex items-center gap-4 p-3"
                style={{ background: "#FFFDF5", border: "1px solid #E6DCC8" }}
              >
                <span className="font-jetbrains text-[10px] shrink-0 w-6 text-center" style={{ color: "#C0392B" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair font-bold text-[14px] truncate" style={{ color: "#1C1610" }}>
                    {ch.title}
                  </p>
                  <div className="flex gap-3 mt-1 font-jetbrains text-[8px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                    <span style={{ color: "#059669" }}>{ch.completed} completed</span>
                    <span style={{ color: "#CA8A04" }}>{ch.in_progress} in progress</span>
                    <span>{ch.not_started} not started</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <div className="w-24 h-2 bg-[#EDE8D5] overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${ch.completion_rate}%`, background: "#059669" }}
                    />
                  </div>
                  <span className="font-jetbrains text-[10px] font-bold w-8 text-right" style={{ color: "#1C1610" }}>
                    {ch.completion_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Subscribers Table */}
      <section className="mb-8">
        <SectionHeader
          title="Subscribers"
          subtitle={`${overview.total_subscribers} total`}
        />
        {subscribers.length === 0 ? (
          <div className="text-center py-12" style={{ background: "#FFFDF5", border: "1px dashed #C8B882" }}>
            <Users className="h-8 w-8 mx-auto mb-3" style={{ color: "#C8B882" }} />
            <p className="font-source-serif text-[14px]" style={{ color: "#5C4E35" }}>
              No subscribers yet. Share your course to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {subscribers.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3"
                style={{ background: "#FFFDF5", border: "1px solid #E6DCC8" }}
              >
                <div className="shrink-0">
                  {sub.subscriber.image ? (
                    <Image
                      src={sub.subscriber.image}
                      alt={sub.subscriber.name ?? ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-jetbrains text-[11px]"
                      style={{ background: "#C0392B", color: "#FFFDF5" }}
                    >
                      {(sub.subscriber.name ?? sub.subscriber.email)[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair font-bold text-[14px] truncate" style={{ color: "#1C1610" }}>
                    {sub.subscriber.name ?? sub.subscriber.email}
                  </p>
                  <p className="font-jetbrains text-[8px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                    Joined {new Date(sub.subscribed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-jetbrains text-[10px] font-bold" style={{ color: "#1C1610" }}>
                      {sub.progress.percentage}%
                    </p>
                    <p className="font-jetbrains text-[7px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                      {sub.progress.completed}/{sub.progress.total} ch
                    </p>
                  </div>
                  <div className="w-16 h-2 bg-[#EDE8D5] overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${sub.progress.percentage}%`,
                        background: sub.progress.percentage === 100 ? "#059669" : "#CA8A04",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Access Requests */}
      {accessRequests.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            title="Access Requests"
            subtitle={`${accessRequests.filter(r => r.status === "pending").length} pending`}
          />
          <div className="space-y-2">
            {accessRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-4 p-3"
                style={{ background: "#FFFDF5", border: "1px solid #E6DCC8" }}
              >
                <div className="shrink-0">
                  {req.requester?.image ? (
                    <Image
                      src={req.requester.image}
                      alt={req.requester.name ?? ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-jetbrains text-[11px]"
                      style={{ background: "#F59E0B", color: "#FFFDF5" }}
                    >
                      {(req.requester?.name ?? req.requester?.email ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair font-bold text-[14px] truncate" style={{ color: "#1C1610" }}>
                    {req.requester?.name ?? req.requester?.email ?? "Unknown"}
                  </p>
                  <p className="font-jetbrains text-[8px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                    Requested {new Date(req.created_at).toLocaleDateString()}
                    {req.message && ` — "${req.message}"`}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {req.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleAccessAction(req.id, "approve")}
                        disabled={actionLoading === req.id}
                        className="p-2 transition-colors hover:bg-[#E8F5E9] disabled:opacity-50"
                        style={{ border: "1px solid #059669", color: "#059669" }}
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAccessAction(req.id, "deny")}
                        disabled={actionLoading === req.id}
                        className="p-2 transition-colors hover:bg-[#FEE2E2] disabled:opacity-50"
                        style={{ border: "1px solid #DC2626", color: "#DC2626" }}
                        title="Deny"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <span
                      className="font-jetbrains text-[9px] uppercase tracking-wider px-2 py-1"
                      style={{
                        background: req.status === "approved" ? "#E8F5E9" : "#FEE2E2",
                        color: req.status === "approved" ? "#059669" : "#DC2626",
                        border: `1px solid ${req.status === "approved" ? "#059669" : "#DC2626"}`,
                      }}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="p-4" style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}>
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
      </div>
      <p className="font-playfair font-bold text-[24px]" style={{ color: "#1C1610" }}>
        {value}
      </p>
      <p className="font-jetbrains text-[8px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
        {label}
      </p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <div className="flex items-center gap-2">
        <p className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: "#A08E6B" }}>
          § {title}
        </p>
        {subtitle && (
          <span className="font-jetbrains text-[8px] tracking-wider" style={{ color: "#8B7355" }}>
            ({subtitle})
          </span>
        )}
      </div>
      <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
    </div>
  );
}
