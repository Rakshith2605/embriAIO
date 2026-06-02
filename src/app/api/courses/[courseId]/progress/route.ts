import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from("course_subscriptions")
    .select("id")
    .eq("course_id", courseId)
    .eq("subscriber_id", profile.id)
    .single();

  if (!subscription) {
    return NextResponse.json({ error: "Not subscribed to this course" }, { status: 403 });
  }

  const body = await req.json();
  const { chapter_id, status } = body;

  if (!chapter_id || !status) {
    return NextResponse.json({ error: "chapter_id and status are required" }, { status: 400 });
  }

  if (!["not_started", "in_progress", "completed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id")
    .eq("id", chapter_id)
    .eq("course_id", courseId)
    .single();

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found in this course" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    subscription_id: subscription.id,
    chapter_id,
    status,
    updated_at: now,
  };

  if (status === "in_progress") updates.started_at = now;
  if (status === "completed") updates.completed_at = now;

  const { data, error } = await supabase
    .from("subscriber_progress")
    .upsert(updates, { onConflict: "subscription_id,chapter_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from("course_subscriptions")
    .select("id")
    .eq("course_id", courseId)
    .eq("subscriber_id", profile.id)
    .single();

  if (!subscription) {
    return NextResponse.json({ progress: [], weightedProgress: null });
  }

  // Get all chapters for the course
  const { data: chapters } = await supabase
    .from("course_chapters")
    .select("id")
    .eq("course_id", courseId)
    .order("order");

  const chapterIds = (chapters ?? []).map((c) => c.id);

  // Get chapter-level progress
  const { data: chapterProgress } = await supabase
    .from("subscriber_progress")
    .select("chapter_id, status, started_at, completed_at")
    .eq("subscription_id", subscription.id)
    .in("chapter_id", chapterIds.length > 0 ? chapterIds : ["00000000-0000-0000-0000-000000000000"]);

  // Get all video IDs for chapters
  const { data: videos } = chapterIds.length > 0
    ? await supabase
        .from("chapter_videos")
        .select("id, chapter_id, duration_seconds")
        .in("chapter_id", chapterIds)
    : { data: [] };

  // Get all notebook IDs for chapters
  const { data: notebooks } = chapterIds.length > 0
    ? await supabase
        .from("chapter_notebooks")
        .select("id, chapter_id")
        .in("chapter_id", chapterIds)
    : { data: [] };

  // Get all paper IDs for chapters
  const { data: papers } = chapterIds.length > 0
    ? await supabase
        .from("chapter_papers")
        .select("id, chapter_id")
        .in("chapter_id", chapterIds)
    : { data: [] };

  const allVideoIds = (videos ?? []).map((v) => v.id);
  const allNotebookIds = (notebooks ?? []).map((n) => n.id);
  const allPaperIds = (papers ?? []).map((p) => p.id);

  // Get per-resource progress
  const [videoProg, nbProg, paperProg] = await Promise.all([
    allVideoIds.length > 0
      ? supabase.from("subscriber_video_progress").select("video_id, max_position_seconds, percent_watched").eq("subscription_id", subscription.id).in("video_id", allVideoIds)
      : { data: [] },
    allNotebookIds.length > 0
      ? supabase.from("subscriber_notebook_progress").select("notebook_id, status").eq("subscription_id", subscription.id).in("notebook_id", allNotebookIds)
      : { data: [] },
    allPaperIds.length > 0
      ? supabase.from("subscriber_paper_progress").select("paper_id, status").eq("subscription_id", subscription.id).in("paper_id", allPaperIds)
      : { data: [] },
  ]);

  // Get total_video_seconds for course
  const { data: course } = await supabase
    .from("courses")
    .select("total_video_seconds")
    .eq("id", courseId)
    .single();

  const totalVideoSeconds = course?.total_video_seconds ?? 0;

  // Build per-chapter resource progress
  const videoByChapter = new Map<string, { videoId: string; durationSeconds: number | null; maxPositionSeconds: number; percentWatched: number }[]>();
  const nbByChapter = new Map<string, { notebookId: string; completed: boolean }[]>();
  const paperByChapter = new Map<string, { paperId: string; completed: boolean }[]>();

  const videoProgressMap = new Map((videoProg.data ?? []).map((v: { video_id: string; max_position_seconds: number; percent_watched: number }) => [v.video_id, v]));
  const nbProgressMap = new Map((nbProg.data ?? []).map((n: { notebook_id: string; status: string }) => [n.notebook_id, n.status]));
  const paperProgressMap = new Map((paperProg.data ?? []).map((p: { paper_id: string; status: string }) => [p.paper_id, p.status]));

  for (const v of (videos ?? []) as { id: string; chapter_id: string; duration_seconds: number | null }[]) {
    if (!videoByChapter.has(v.chapter_id)) videoByChapter.set(v.chapter_id, []);
    const vp = videoProgressMap.get(v.id);
    videoByChapter.get(v.chapter_id)!.push({
      videoId: v.id,
      durationSeconds: v.duration_seconds,
      maxPositionSeconds: vp?.max_position_seconds ?? 0,
      percentWatched: vp?.percent_watched ?? 0,
    });
  }

  for (const n of (notebooks ?? []) as { id: string; chapter_id: string }[]) {
    if (!nbByChapter.has(n.chapter_id)) nbByChapter.set(n.chapter_id, []);
    nbByChapter.get(n.chapter_id)!.push({
      notebookId: n.id,
      completed: nbProgressMap.get(n.id) === "completed",
    });
  }

  for (const p of (papers ?? []) as { id: string; chapter_id: string }[]) {
    if (!paperByChapter.has(p.chapter_id)) paperByChapter.set(p.chapter_id, []);
    paperByChapter.get(p.chapter_id)!.push({
      paperId: p.id,
      completed: paperProgressMap.get(p.id) === "completed",
    });
  }

  // Calculate weighted progress — equal weight per active category
  const watchedVideoSeconds = (videoProg.data ?? []).reduce(
    (sum: number, v: { video_id: string; max_position_seconds: number }) => {
      const vData = (videos ?? []).find((vd: { id: string }) => vd.id === v.video_id);
      return sum + Math.min(v.max_position_seconds, vData?.duration_seconds ?? v.max_position_seconds);
    },
    0
  );
  const completedNotebooks = (nbProg.data ?? []).filter((n: { status: string }) => n.status === "completed").length;
  const completedPapers = (paperProg.data ?? []).filter((p: { status: string }) => p.status === "completed").length;

  const hasVideos = totalVideoSeconds > 0;
  const hasNotebooks = allNotebookIds.length > 0;
  const hasPapers = allPaperIds.length > 0;

  const activeCount = (hasVideos ? 1 : 0) + (hasNotebooks ? 1 : 0) + (hasPapers ? 1 : 0);
  const catWeight = activeCount > 0 ? 1 / activeCount : 0;

  const videoPercent = hasVideos
    ? Math.round((Math.min(watchedVideoSeconds, totalVideoSeconds) / totalVideoSeconds) * 100)
    : 0;
  const colabPercent = hasNotebooks
    ? Math.round((completedNotebooks / allNotebookIds.length) * 100)
    : 0;
  const paperPercent = hasPapers
    ? Math.round((completedPapers / allPaperIds.length) * 100)
    : 0;

  const overallPercent = Math.round(
    videoPercent * (hasVideos ? catWeight : 0) +
    colabPercent * (hasNotebooks ? catWeight : 0) +
    paperPercent * (hasPapers ? catWeight : 0)
  );

  const wVideo = hasVideos ? catWeight : 0;
  const wColab = hasNotebooks ? catWeight : 0;
  const wPaper = hasPapers ? catWeight : 0;

  const chaptersResourceProgress = (chapters ?? []).map((ch: { id: string }) => ({
    chapterId: ch.id,
    chapterStatus: (chapterProgress ?? []).find((cp: { chapter_id: string }) => cp.chapter_id === ch.id)?.status ?? "not_started",
    videos: videoByChapter.get(ch.id) ?? [],
    notebooks: nbByChapter.get(ch.id) ?? [],
    papers: paperByChapter.get(ch.id) ?? [],
  }));

  return NextResponse.json({
    progress: chapterProgress ?? [],
    weightedProgress: {
      totalVideoSeconds,
      watchedVideoSeconds,
      totalNotebooks: allNotebookIds.length,
      completedNotebooks,
      totalPapers: allPaperIds.length,
      completedPapers,
      videoPercent,
      colabPercent,
      paperPercent,
      overallPercent,
      weights: { video: wVideo, colab: wColab, paper: wPaper },
    },
    chapters: chaptersResourceProgress,
  });
}