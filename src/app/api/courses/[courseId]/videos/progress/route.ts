import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
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
    return NextResponse.json(
      { error: "Not subscribed to this course" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { videoId, percentWatched, chapterId, maxPositionSeconds } = body;

  if (!videoId || percentWatched === undefined || !chapterId) {
    return NextResponse.json(
      { error: "videoId, percentWatched, and chapterId are required" },
      { status: 400 }
    );
  }

  if (typeof percentWatched !== "number" || percentWatched < 0 || percentWatched > 100) {
    return NextResponse.json(
      { error: "percentWatched must be a number between 0 and 100" },
      { status: 400 }
    );
  }

  // Verify chapter belongs to this course
  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id")
    .eq("id", chapterId)
    .eq("course_id", courseId)
    .single();

  if (!chapter) {
    return NextResponse.json(
      { error: "Chapter not found in this course" },
      { status: 404 }
    );
  }

  // Verify video belongs to this chapter (supports both UUID and youtube ID)
  const { data: videos } = await supabase
    .from("chapter_videos")
    .select("id, youtube_id, duration_seconds")
    .eq("chapter_id", chapterId);

  const videoList = videos ?? [];
  const matchedVideo = videoList.find(
    (v) => v.id === videoId || v.youtube_id === videoId
  );

  if (!matchedVideo) {
    return NextResponse.json(
      { error: "Video not found in this chapter" },
      { status: 404 }
    );
  }

  const resolvedVideoId = matchedVideo.id;
  const maxPos = Math.max(0, Math.round(maxPositionSeconds ?? 0));

  // Upsert per-video progress
  await supabase
    .from("subscriber_video_progress")
    .upsert(
      {
        subscription_id: subscription.id,
        video_id: resolvedVideoId,
        max_position_seconds: maxPos,
        percent_watched: Math.min(100, Math.max(0, Math.round(percentWatched))),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "subscription_id,video_id" }
    );

  // Auto-derive chapter status from resource progress
  const allVideoIds = videoList.map((v) => v.id);
  const { data: chapterNotebooks } = await supabase
    .from("chapter_notebooks")
    .select("id")
    .eq("chapter_id", chapterId);
  const notebookIds = (chapterNotebooks ?? []).map((n) => n.id);

  const { data: chapterPapers } = await supabase
    .from("chapter_papers")
    .select("id")
    .eq("chapter_id", chapterId);
  const paperIds = (chapterPapers ?? []).map((p) => p.id);

  const totalResources = allVideoIds.length + notebookIds.length + paperIds.length;
  let completedResources = 0;
  let startedResources = 0;

  // Check all video progress for this chapter
  if (allVideoIds.length > 0) {
    const { data: vp } = await supabase
      .from("subscriber_video_progress")
      .select("video_id, percent_watched")
      .eq("subscription_id", subscription.id)
      .in("video_id", allVideoIds);
    const vMap = new Map((vp ?? []).map((x) => [x.video_id, x.percent_watched]));
    for (const vid of allVideoIds) {
      const pct = vMap.get(vid) ?? 0;
      if (pct >= 90) completedResources++;
      if (pct > 0) startedResources++;
    }
  }

  if (notebookIds.length > 0) {
    const { data: np } = await supabase
      .from("subscriber_notebook_progress")
      .select("notebook_id, status")
      .eq("subscription_id", subscription.id)
      .in("notebook_id", notebookIds);
    const nbMap = new Map((np ?? []).map((x) => [x.notebook_id, x.status]));
    for (const nid of notebookIds) {
      if (nbMap.get(nid) === "completed") completedResources++;
      if (nbMap.has(nid)) startedResources++;
    }
  }

  if (paperIds.length > 0) {
    const { data: pp } = await supabase
      .from("subscriber_paper_progress")
      .select("paper_id, status")
      .eq("subscription_id", subscription.id)
      .in("paper_id", paperIds);
    const pMap = new Map((pp ?? []).map((x) => [x.paper_id, x.status]));
    for (const pid of paperIds) {
      if (pMap.get(pid) === "completed") completedResources++;
      if (pMap.has(pid)) startedResources++;
    }
  }

  let newStatus: string;
  if (totalResources > 0 && completedResources >= totalResources) {
    newStatus = "completed";
  } else if (startedResources > 0) {
    newStatus = "in_progress";
  } else {
    newStatus = "not_started";
  }

  const now = new Date().toISOString();
  const progressUpdates: Record<string, unknown> = {
    subscription_id: subscription.id,
    chapter_id: chapterId,
    status: newStatus,
    updated_at: now,
  };

  if (newStatus === "in_progress") {
    progressUpdates.started_at = now;
  }
  if (newStatus === "completed") {
    progressUpdates.completed_at = now;
  }

  await supabase
    .from("subscriber_progress")
    .upsert(progressUpdates, { onConflict: "subscription_id,chapter_id" });

  return NextResponse.json({ ok: true });
}