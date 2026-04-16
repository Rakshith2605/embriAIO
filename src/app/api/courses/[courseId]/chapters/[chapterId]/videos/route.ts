import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";
import { parseVideoUrl } from "@/lib/video-utils";

interface Params {
  params: { courseId: string; chapterId: string };
}

async function verifyChapterOwnership(
  supabase: ReturnType<typeof createServiceClient>,
  courseId: string,
  chapterId: string,
  email: string
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  if (!profile) return false;

  const { data } = await supabase
    .from("course_chapters")
    .select("id, courses!inner(author_id)")
    .eq("id", chapterId)
    .eq("course_id", courseId)
    .single();

  if (!data) return false;
  const course = (data as Record<string, unknown>).courses as { author_id: string };
  return course?.author_id === profile.id;
}

// POST /api/courses/[courseId]/chapters/[chapterId]/videos — add video
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId, chapterId } = params;

  const isOwner = await verifyChapterOwnership(supabase, courseId, chapterId, session.user.email);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { url, title } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
  }

  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { error: "Unsupported video URL. Supported: YouTube, PeerTube (known instances)" },
      { status: 400 }
    );
  }

  // Get next order
  const { count } = await supabase
    .from("chapter_videos")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId);

  const { data, error } = await supabase
    .from("chapter_videos")
    .insert({
      chapter_id: chapterId,
      platform: parsed.platform,
      video_url: url.trim(),
      embed_url: parsed.embedUrl,
      title: (title ?? `Video ${(count ?? 0) + 1}`).trim(),
      order: count ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/courses/[courseId]/chapters/[chapterId]/videos — remove video
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId, chapterId } = params;

  const isOwner = await verifyChapterOwnership(supabase, courseId, chapterId, session.user.email);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { videoId } = await req.json();
  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("chapter_videos")
    .delete()
    .eq("id", videoId)
    .eq("chapter_id", chapterId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
