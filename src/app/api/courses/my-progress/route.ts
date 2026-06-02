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
      totalChapters: 0,
      completedChapters: 0,
      inProgressChapters: 0,
      percentComplete: 0,
      courseCount: 0,
      totalVideoSeconds: 0,
      watchedVideoSeconds: 0,
      totalNotebooks: 0,
      completedNotebooks: 0,
      totalPapers: 0,
      completedPapers: 0,
    });
  }

  const { data: subscriptions } = await supabase
    .from("course_subscriptions")
    .select("id, course_id")
    .eq("subscriber_id", profile.id);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({
      totalChapters: 0,
      completedChapters: 0,
      inProgressChapters: 0,
      percentComplete: 0,
      courseCount: 0,
      totalVideoSeconds: 0,
      watchedVideoSeconds: 0,
      totalNotebooks: 0,
      completedNotebooks: 0,
      totalPapers: 0,
      completedPapers: 0,
    });
  }

  const subIds = subscriptions.map((s) => s.id);
  const courseIds = subscriptions.map((s) => s.course_id);

  // Get total chapter count across all subscribed courses
  const { count: totalChapters } = await supabase
    .from("course_chapters")
    .select("id", { count: "exact", head: true })
    .in("course_id", courseIds);

  // Get progress records for all subscriptions
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

  // Aggregate video progress
  const { data: videoProgress } = await supabase
    .from("subscriber_video_progress")
    .select("video_id, max_position_seconds, percent_watched")
    .in("subscription_id", subIds);

  // Aggregate notebook progress
  const { data: nbProgress } = await supabase
    .from("subscriber_notebook_progress")
    .select("notebook_id, status")
    .in("subscription_id", subIds);

  // Aggregate paper progress
  const { data: paperProgress } = await supabase
    .from("subscriber_paper_progress")
    .select("paper_id, status")
    .in("subscription_id", subIds);

  // Get total_video_seconds for all subscribed courses
  const { data: courses } = await supabase
    .from("courses")
    .select("id, total_video_seconds")
    .in("id", courseIds);

  // Get total video/notebook/paper counts for all subscribed courses
  const totalVideoSeconds = (courses ?? []).reduce(
    (sum, c) => sum + (c.total_video_seconds ?? 0), 0
  );

  // Get total notebook and paper counts
  const { count: totalNotebooks } = await supabase
    .from("chapter_notebooks")
    .select("id", { count: "exact", head: true })
    .in("chapter_id", courseIds.length > 0
      ? (await supabase.from("course_chapters").select("id").in("course_id", courseIds)).data?.map((c) => c.id) ?? []
      : ["00000000-0000-0000-0000-000000000000"]
    );

  const allChapterIds = courseIds.length > 0
    ? ((await supabase.from("course_chapters").select("id").in("course_id", courseIds)).data ?? []).map((c) => c.id)
    : [];

  const [nbCountResult, paperCountResult] = await Promise.all([
    allChapterIds.length > 0
      ? supabase.from("chapter_notebooks").select("id", { count: "exact", head: true }).in("chapter_id", allChapterIds)
      : { count: 0 },
    allChapterIds.length > 0
      ? supabase.from("chapter_papers").select("id", { count: "exact", head: true }).in("chapter_id", allChapterIds)
      : { count: 0 },
  ]);

  // Calculate watched seconds from video progress
  // Need video durations to cap max_position_seconds
  const videoIds = (videoProgress ?? []).map((v) => v.video_id);
  const { data: videoData } = videoIds.length > 0
    ? await supabase.from("chapter_videos").select("id, duration_seconds").in("id", videoIds)
    : { data: [] };

  const videoDurationMap = new Map(
    ((videoData ?? []) as { id: string; duration_seconds: number | null }[]).map((v) => [v.id, v.duration_seconds])
  );

  const watchedVideoSeconds = (videoProgress ?? []).reduce((sum, v) => {
    const dur = videoDurationMap.get(v.video_id);
    if (dur && dur > 0) {
      return sum + Math.min(v.max_position_seconds, dur);
    }
    return sum + v.max_position_seconds;
  }, 0);

  const completedNotebooks = (nbProgress ?? []).filter((n) => n.status === "completed").length;
  const completedPapers = (paperProgress ?? []).filter((p) => p.status === "completed").length;

  // Weighted progress calculation with redistribution
  const totalNb = nbCountResult?.count ?? 0;
  const totalPpr = paperCountResult?.count ?? 0;
  const hasVideos = totalVideoSeconds > 0;
  const hasNotebooks = totalNb > 0;
  const hasPapers = totalPpr > 0;

  let wVideo = 0.80, wColab = 0.10, wPaper = 0.10;
  if (!hasNotebooks) { wVideo += wColab; wColab = 0; }
  if (!hasPapers) { wVideo += wPaper; wPaper = 0; }

  const videoPct = hasVideos ? Math.round((watchedVideoSeconds / totalVideoSeconds) * 100) : 100;
  const colabPct = hasNotebooks ? Math.round((completedNotebooks / totalNb) * 100) : 100;
  const paperPct = hasPapers ? Math.round((completedPapers / totalPpr) * 100) : 100;
  const overallPercent = Math.round(videoPct * wVideo + colabPct * wColab + paperPct * wPaper);

  const total = totalChapters ?? 0;
  const weightedProgress = completedChapters + inProgressChapters * 0.5;
  const chapterPercentComplete = total > 0 ? Math.round((weightedProgress / total) * 100) : 0;

  return NextResponse.json({
    totalChapters: total,
    completedChapters,
    inProgressChapters,
    percentComplete: overallPercent,
    chapterPercentComplete,
    courseCount: subscriptions.length,
    totalVideoSeconds,
    watchedVideoSeconds,
    totalNotebooks: totalNb,
    completedNotebooks,
    totalPapers: totalPpr,
    completedPapers,
    videoPercent: videoPct,
    colabPercent: colabPct,
    paperPercent: paperPct,
    weights: { video: wVideo, colab: wColab, paper: wPaper },
  });
}