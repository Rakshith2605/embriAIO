import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({
      totalChapters: 0, completedChapters: 0, inProgressChapters: 0,
      percentComplete: 0, courseCount: 0,
      totalVideoSeconds: 0, watchedVideoSeconds: 0,
      totalNotebooks: 0, completedNotebooks: 0,
      totalPapers: 0, completedPapers: 0,
    });
  }

  const { data: subscriptions } = await supabase
    .from("course_subscriptions")
    .select("id, course_id")
    .eq("subscriber_id", profile.id);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({
      totalChapters: 0, completedChapters: 0, inProgressChapters: 0,
      percentComplete: 0, courseCount: 0,
      totalVideoSeconds: 0, watchedVideoSeconds: 0,
      totalNotebooks: 0, completedNotebooks: 0,
      totalPapers: 0, completedPapers: 0,
    });
  }

  const subIds = subscriptions.map((s) => s.id);
  const courseIds = subscriptions.map((s) => s.course_id);

  // Fetch chapter IDs once (Fix E / Bug 7)
  const allChapterIds = courseIds.length > 0
    ? ((await supabase.from("course_chapters").select("id").in("course_id", courseIds)).data ?? []).map((c) => c.id)
    : [];

  const { data: chapterList } = await supabase
    .from("course_chapters")
    .select("id")
    .in("course_id", courseIds);
  const totalChapters = (chapterList ?? []).length;

  const { data: progress } = await supabase
    .from("subscriber_progress")
    .select("status")
    .in("subscription_id", subIds);

  let completedChapters = 0;
  let inProgressChapters = 0;
  for (const p of progress ?? []) {
    if (p.status === "completed") completedChapters++;
    else if (p.status === "in_progress") inProgressChapters++;
  }

  // Aggregate resource progress
  const { data: videoProgress } = await supabase
    .from("subscriber_video_progress")
    .select("video_id, max_position_seconds, percent_watched")
    .in("subscription_id", subIds);
  const { data: nbProgress } = await supabase
    .from("subscriber_notebook_progress")
    .select("notebook_id, status")
    .in("subscription_id", subIds);
  const { data: paperProgress } = await supabase
    .from("subscriber_paper_progress")
    .select("paper_id, status")
    .in("subscription_id", subIds);

  const { data: courses } = await supabase
    .from("courses")
    .select("id, total_video_seconds")
    .in("id", courseIds);
  const totalVideoSeconds = (courses ?? []).reduce((sum, c) => sum + (c.total_video_seconds ?? 0), 0);

  // Reuse allChapterIds for counts (Fix E / Bug 7)
  const [videoCountRes, nbCountRes, paperCountRes] = await Promise.all([
    allChapterIds.length > 0
      ? supabase.from("chapter_videos").select("id, duration_seconds").in("chapter_id", allChapterIds)
      : { data: [] },
    allChapterIds.length > 0
      ? supabase.from("chapter_notebooks").select("id").in("chapter_id", allChapterIds)
      : { data: [] },
    allChapterIds.length > 0
      ? supabase.from("chapter_papers").select("id").in("chapter_id", allChapterIds)
      : { data: [] },
  ]);

  const totalVideoCount = (videoCountRes.data ?? []).length;
  const totalNotebooks = (nbCountRes.data ?? []).length;
  const totalPapers = (paperCountRes.data ?? []).length;

  // Watched seconds (for label only)
  const durationMap = new Map(
    ((videoCountRes.data ?? []) as { id: string; duration_seconds: number | null }[]).map((v) => [v.id, v.duration_seconds])
  );
  const watchedVideoSeconds = (videoProgress ?? []).reduce((sum, v) => {
    const dur = durationMap.get(v.video_id);
    return sum + Math.min(v.max_position_seconds, dur ?? v.max_position_seconds);
  }, 0);

  // Count-based % (Fix A)
  const completedVideos = (videoProgress ?? []).filter((v) => v.percent_watched >= 90).length;
  const completedNotebooks = (nbProgress ?? []).filter((n) => n.status === "completed").length;
  const completedPapers = (paperProgress ?? []).filter((p) => p.status === "completed").length;

  const hasVideos = totalVideoCount > 0;
  const hasNotebooks = totalNotebooks > 0;
  const hasPapers = totalPapers > 0;

  const activeCount = (hasVideos ? 1 : 0) + (hasNotebooks ? 1 : 0) + (hasPapers ? 1 : 0);
  const catWeight = activeCount > 0 ? 1 / activeCount : 0;

  const videoPct = hasVideos ? Math.round((completedVideos / totalVideoCount) * 100) : 0;
  const colabPct = hasNotebooks ? Math.round((completedNotebooks / totalNotebooks) * 100) : 0;
  const paperPct = hasPapers ? Math.round((completedPapers / totalPapers) * 100) : 0;
  const overallPercent = Math.round(
    videoPct * (hasVideos ? catWeight : 0) +
    colabPct * (hasNotebooks ? catWeight : 0) +
    paperPct * (hasPapers ? catWeight : 0)
  );

  const weightedProgress = completedChapters + inProgressChapters * 0.5;
  const chapterPercentComplete = totalChapters > 0 ? Math.round((weightedProgress / totalChapters) * 100) : 0;

  return NextResponse.json({
    totalChapters,
    completedChapters,
    inProgressChapters,
    percentComplete: overallPercent,
    chapterPercentComplete,
    courseCount: subscriptions.length,
    totalVideoSeconds,
    watchedVideoSeconds,
    totalVideoCount,
    completedVideos,
    totalNotebooks,
    completedNotebooks,
    totalPapers,
    completedPapers,
    videoPercent: videoPct,
    colabPercent: colabPct,
    paperPercent: paperPct,
    weights: { video: hasVideos ? catWeight : 0, colab: hasNotebooks ? catWeight : 0, paper: hasPapers ? catWeight : 0 },
  });
}