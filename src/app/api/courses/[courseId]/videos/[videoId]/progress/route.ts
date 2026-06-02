import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; videoId: string } }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId, videoId } = params;

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
  const { maxPositionSeconds, percentWatched, chapterId } = body;

  if (maxPositionSeconds === undefined || percentWatched === undefined || !chapterId) {
    return NextResponse.json(
      { error: "maxPositionSeconds, percentWatched, and chapterId are required" },
      { status: 400 }
    );
  }

  if (typeof percentWatched !== "number" || percentWatched < 0 || percentWatched > 100) {
    return NextResponse.json(
      { error: "percentWatched must be a number between 0 and 100" },
      { status: 400 }
    );
  }

  // Verify video belongs to this course
  const { data: video } = await supabase
    .from("chapter_videos")
    .select("id, chapter_id, duration_seconds")
    .eq("id", videoId)
    .single();

  if (!video || video.chapter_id !== chapterId) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id")
    .eq("id", chapterId)
    .eq("course_id", courseId)
    .single();

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found in this course" }, { status: 404 });
  }

  // Upsert video progress
  const { error: videoUpsertError } = await supabase
    .from("subscriber_video_progress")
    .upsert(
      {
        subscription_id: subscription.id,
        video_id: videoId,
        max_position_seconds: Math.max(0, Math.round(maxPositionSeconds)),
        percent_watched: Math.min(100, Math.max(0, Math.round(percentWatched))),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "subscription_id,video_id" }
    );

  if (videoUpsertError) {
    return NextResponse.json({ error: videoUpsertError.message }, { status: 500 });
  }

  // Auto-derive chapter status from resource progress
  await deriveChapterStatus(supabase, subscription.id, chapterId, courseId);

  return NextResponse.json({ ok: true });
}

async function deriveChapterStatus(
  supabase: ReturnType<typeof createServiceClient>,
  subscriptionId: string,
  chapterId: string,
  courseId: string
) {
  // Get all videos for this chapter
  const { data: videos } = await supabase
    .from("chapter_videos")
    .select("id, duration_seconds")
    .eq("chapter_id", chapterId);
  const videoIds = (videos ?? []).map((v) => v.id);

  // Get all notebooks for this chapter
  const { data: notebooks } = await supabase
    .from("chapter_notebooks")
    .select("id")
    .eq("chapter_id", chapterId);
  const notebookIds = (notebooks ?? []).map((n) => n.id);

  // Get all papers for this chapter
  const { data: papers } = await supabase
    .from("chapter_papers")
    .select("id")
    .eq("chapter_id", chapterId);
  const paperIds = (papers ?? []).map((p) => p.id);

  const totalResources = videoIds.length + notebookIds.length + paperIds.length;

  // If chapter has no resources, don't auto-update
  if (totalResources === 0) return;

  let completedResources = 0;
  let startedResources = 0;

  // Check video progress
  if (videoIds.length > 0) {
    const { data: videoProgress } = await supabase
      .from("subscriber_video_progress")
      .select("video_id, percent_watched")
      .eq("subscription_id", subscriptionId)
      .in("video_id", videoIds);

    const progressMap = new Map(
      (videoProgress ?? []).map((vp) => [vp.video_id, vp.percent_watched])
    );
    for (const vid of videoIds) {
      const pct = progressMap.get(vid) ?? 0;
      if (pct >= 90) completedResources++;
      if (pct > 0) startedResources++;
    }
  }

  // Check notebook progress
  if (notebookIds.length > 0) {
    const { data: nbProgress } = await supabase
      .from("subscriber_notebook_progress")
      .select("notebook_id, status")
      .eq("subscription_id", subscriptionId)
      .in("notebook_id", notebookIds);

    const nbMap = new Map(
      (nbProgress ?? []).map((np) => [np.notebook_id, np.status])
    );
    for (const nid of notebookIds) {
      if (nbMap.get(nid) === "completed") completedResources++;
      if (nbMap.has(nid)) startedResources++;
    }
  }

  // Check paper progress
  if (paperIds.length > 0) {
    const { data: paperProgress } = await supabase
      .from("subscriber_paper_progress")
      .select("paper_id, status")
      .eq("subscription_id", subscriptionId)
      .in("paper_id", paperIds);

    const pMap = new Map(
      (paperProgress ?? []).map((pp) => [pp.paper_id, pp.status])
    );
    for (const pid of paperIds) {
      if (pMap.get(pid) === "completed") completedResources++;
      if (pMap.has(pid)) startedResources++;
    }
  }

  const now = new Date().toISOString();
  let newStatus: string;

  if (completedResources >= totalResources) {
    newStatus = "completed";
  } else if (startedResources > 0) {
    newStatus = "in_progress";
  } else {
    newStatus = "not_started";
  }

  const updates: Record<string, unknown> = {
    subscription_id: subscriptionId,
    chapter_id: chapterId,
    status: newStatus,
    updated_at: now,
  };

  if (newStatus === "in_progress") {
    updates.started_at = now;
  }
  if (newStatus === "completed") {
    updates.completed_at = now;
  }

  await supabase
    .from("subscriber_progress")
    .upsert(updates, { onConflict: "subscription_id,chapter_id" });
}