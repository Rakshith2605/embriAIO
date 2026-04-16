import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

// GET /api/courses/[courseId]/stats — owner-only stats for a course
export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  // Verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, status, published_at, author_id")
    .eq("id", courseId)
    .eq("author_id", profile.id)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 1. Total subscriber count
  const { count: subscriberCount } = await supabase
    .from("course_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  // 2. Subscribers with profile info and their join dates
  const { data: subscribers } = await supabase
    .from("course_subscriptions")
    .select(`
      id,
      subscribed_at,
      profiles!course_subscriptions_subscriber_id_fkey (
        id, name, image, email
      )
    `)
    .eq("course_id", courseId)
    .order("subscribed_at", { ascending: false });

  // 3. Chapter list
  const { data: chapters } = await supabase
    .from("course_chapters")
    .select("id, title, order")
    .eq("course_id", courseId)
    .order("order", { ascending: true });

  // 4. All subscriber progress for this course
  const { data: allProgress } = await supabase
    .from("subscriber_progress")
    .select(`
      id,
      chapter_id,
      status,
      started_at,
      completed_at,
      subscription_id,
      course_subscriptions!inner (
        subscriber_id,
        course_id
      )
    `)
    .eq("course_subscriptions.course_id", courseId);

  // 5. Calculate per-subscriber progress
  const chapterIds = (chapters ?? []).map((ch) => ch.id);
  const totalChapters = chapterIds.length;

  const subscriberStats = (subscribers ?? []).map((sub) => {
    const subProfile = sub.profiles as unknown as {
      id: string;
      name: string | null;
      image: string | null;
      email: string;
    };
    const subProgress = (allProgress ?? []).filter(
      (p) => {
        const subRef = p.course_subscriptions as unknown as {
          subscriber_id: string;
          course_id: string;
        };
        return subRef?.subscriber_id === subProfile?.id;
      }
    );

    const completedChapters = subProgress.filter((p) => p.status === "completed").length;
    const inProgressChapters = subProgress.filter((p) => p.status === "in_progress").length;
    const notStartedChapters = totalChapters - completedChapters - inProgressChapters;

    return {
      subscriber: {
        name: subProfile?.name,
        image: subProfile?.image,
        email: subProfile?.email,
      },
      subscribed_at: sub.subscribed_at,
      progress: {
        completed: completedChapters,
        in_progress: inProgressChapters,
        not_started: notStartedChapters,
        total: totalChapters,
        percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
      },
    };
  });

  // 6. Aggregated stats
  const totalCompleted = subscriberStats.filter(
    (s) => s.progress.completed === totalChapters && totalChapters > 0
  ).length;
  const totalInProgress = subscriberStats.filter(
    (s) => s.progress.in_progress > 0 || (s.progress.completed > 0 && s.progress.completed < totalChapters)
  ).length;
  const totalNotStarted = (subscriberCount ?? 0) - totalCompleted - totalInProgress;

  // 7. Subscription growth (last 30 days, grouped by day)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentSubs } = await supabase
    .from("course_subscriptions")
    .select("subscribed_at")
    .eq("course_id", courseId)
    .gte("subscribed_at", thirtyDaysAgo.toISOString())
    .order("subscribed_at", { ascending: true });

  const growthByDay: Record<string, number> = {};
  (recentSubs ?? []).forEach((s) => {
    const day = new Date(s.subscribed_at).toISOString().split("T")[0];
    growthByDay[day] = (growthByDay[day] ?? 0) + 1;
  });

  // 8. Per-chapter completion rates
  const chapterStats = (chapters ?? []).map((ch) => {
    const chapterProgress = (allProgress ?? []).filter((p) => p.chapter_id === ch.id);
    const completed = chapterProgress.filter((p) => p.status === "completed").length;
    const inProgress = chapterProgress.filter((p) => p.status === "in_progress").length;
    return {
      id: ch.id,
      title: ch.title,
      order: ch.order,
      completed,
      in_progress: inProgress,
      not_started: (subscriberCount ?? 0) - completed - inProgress,
      completion_rate: (subscriberCount ?? 0) > 0 ? Math.round((completed / (subscriberCount ?? 1)) * 100) : 0,
    };
  });

  return NextResponse.json({
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      published_at: course.published_at,
    },
    overview: {
      total_subscribers: subscriberCount ?? 0,
      completed_course: totalCompleted,
      in_progress: totalInProgress,
      not_started: totalNotStarted,
      total_chapters: totalChapters,
    },
    subscribers: subscriberStats,
    chapter_stats: chapterStats,
    growth: growthByDay,
  });
}
