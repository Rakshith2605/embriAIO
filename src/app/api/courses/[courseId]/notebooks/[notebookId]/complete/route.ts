import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; notebookId: string } }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId, notebookId } = params;

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
  const { completed } = body;

  if (typeof completed !== "boolean") {
    return NextResponse.json({ error: "completed (boolean) is required" }, { status: 400 });
  }

  // Verify notebook belongs to this course
  const { data: notebook } = await supabase
    .from("chapter_notebooks")
    .select("id, chapter_id")
    .eq("id", notebookId)
    .single();

  if (!notebook) {
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
  }

  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id")
    .eq("id", notebook.chapter_id)
    .eq("course_id", courseId)
    .single();

  if (!chapter) {
    return NextResponse.json({ error: "Notebook not found in this course" }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (completed) {
    await supabase
      .from("subscriber_notebook_progress")
      .upsert(
        {
          subscription_id: subscription.id,
          notebook_id: notebookId,
          status: "completed",
          completed_at: now,
          updated_at: now,
        },
        { onConflict: "subscription_id,notebook_id" }
      );
  } else {
    await supabase
      .from("subscriber_notebook_progress")
      .delete()
      .eq("subscription_id", subscription.id)
      .eq("notebook_id", notebookId);
  }

  // Auto-derive chapter status
  await deriveChapterStatus(supabase, subscription.id, notebook.chapter_id, courseId);

  return NextResponse.json({ ok: true, completed });
}

async function deriveChapterStatus(
  supabase: ReturnType<typeof createServiceClient>,
  subscriptionId: string,
  chapterId: string,
  courseId: string
) {
  const { data: videos } = await supabase
    .from("chapter_videos")
    .select("id")
    .eq("chapter_id", chapterId);
  const { data: notebooks } = await supabase
    .from("chapter_notebooks")
    .select("id")
    .eq("chapter_id", chapterId);
  const { data: papers } = await supabase
    .from("chapter_papers")
    .select("id")
    .eq("chapter_id", chapterId);

  const videoIds = (videos ?? []).map((v) => v.id);
  const notebookIds = (notebooks ?? []).map((n) => n.id);
  const paperIds = (papers ?? []).map((p) => p.id);
  const totalResources = videoIds.length + notebookIds.length + paperIds.length;
  if (totalResources === 0) return;

  let completedResources = 0;
  let startedResources = 0;

  if (videoIds.length > 0) {
    const { data: vp } = await supabase
      .from("subscriber_video_progress")
      .select("video_id, percent_watched")
      .eq("subscription_id", subscriptionId)
      .in("video_id", videoIds);
    const m = new Map((vp ?? []).map((x) => [x.video_id, x.percent_watched]));
    for (const vid of videoIds) {
      const pct = m.get(vid) ?? 0;
      if (pct >= 90) completedResources++;
      if (pct > 0) startedResources++;
    }
  }

  if (notebookIds.length > 0) {
    const { data: np } = await supabase
      .from("subscriber_notebook_progress")
      .select("notebook_id, status")
      .eq("subscription_id", subscriptionId)
      .in("notebook_id", notebookIds);
    const m = new Map((np ?? []).map((x) => [x.notebook_id, x.status]));
    for (const nid of notebookIds) {
      if (m.get(nid) === "completed") completedResources++;
      if (m.has(nid)) startedResources++;
    }
  }

  if (paperIds.length > 0) {
    const { data: pp } = await supabase
      .from("subscriber_paper_progress")
      .select("paper_id, status")
      .eq("subscription_id", subscriptionId)
      .in("paper_id", paperIds);
    const m = new Map((pp ?? []).map((x) => [x.paper_id, x.status]));
    for (const pid of paperIds) {
      if (m.get(pid) === "completed") completedResources++;
      if (m.has(pid)) startedResources++;
    }
  }

  let newStatus: string;
  if (completedResources >= totalResources) newStatus = "completed";
  else if (startedResources > 0) newStatus = "in_progress";
  else newStatus = "not_started";

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    subscription_id: subscriptionId,
    chapter_id: chapterId,
    status: newStatus,
    updated_at: now,
  };
  if (newStatus === "in_progress") updates.started_at = now;
  if (newStatus === "completed") { updates.completed_at = now; }
  if (newStatus !== "completed") { updates.completed_at = null; }

  await supabase
    .from("subscriber_progress")
    .upsert(updates, { onConflict: "subscription_id,chapter_id" });
}