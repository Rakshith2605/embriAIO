import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";
import { deriveChapterStatus } from "@/lib/progress";

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
    return NextResponse.json({ error: "Not subscribed to this course" }, { status: 403 });
  }

  const body = await req.json();
  const { videoId, percentWatched, chapterId, maxPositionSeconds, durationSeconds } = body;

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

  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id")
    .eq("id", chapterId)
    .eq("course_id", courseId)
    .single();

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found in this course" }, { status: 404 });
  }

  const { data: videos } = await supabase
    .from("chapter_videos")
    .select("id, youtube_id, duration_seconds")
    .eq("chapter_id", chapterId);

  const videoList = videos ?? [];
  const matchedVideo = videoList.find(
    (v) => v.id === videoId || v.youtube_id === videoId
  );

  if (!matchedVideo) {
    return NextResponse.json({ error: "Video not found in this chapter" }, { status: 404 });
  }

  const resolvedVideoId = matchedVideo.id;
  const maxPos = Math.max(0, Math.round(maxPositionSeconds ?? 0));

  // ── Persist video duration when provided (Fix B) ──
  if (
    typeof durationSeconds === "number" &&
    durationSeconds > 0 &&
    (!matchedVideo.duration_seconds || matchedVideo.duration_seconds === 0)
  ) {
    await supabase
      .from("chapter_videos")
      .update({ duration_seconds: Math.round(durationSeconds) })
      .eq("id", resolvedVideoId);
  }

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

  await deriveChapterStatus(supabase, subscription.id, chapterId);

  return NextResponse.json({ ok: true });
}