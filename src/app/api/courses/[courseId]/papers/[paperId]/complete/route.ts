import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";
import { deriveChapterStatus } from "@/lib/progress";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; paperId: string } }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId, paperId } = params;

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

  const { data: paper } = await supabase
    .from("chapter_papers")
    .select("id, chapter_id")
    .eq("id", paperId)
    .single();

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id")
    .eq("id", paper.chapter_id)
    .eq("course_id", courseId)
    .single();

  if (!chapter) {
    return NextResponse.json({ error: "Paper not found in this course" }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (completed) {
    await supabase
      .from("subscriber_paper_progress")
      .upsert(
        {
          subscription_id: subscription.id,
          paper_id: paperId,
          status: "completed",
          completed_at: now,
          updated_at: now,
        },
        { onConflict: "subscription_id,paper_id" }
      );
  } else {
    await supabase
      .from("subscriber_paper_progress")
      .delete()
      .eq("subscription_id", subscription.id)
      .eq("paper_id", paperId);
  }

  await deriveChapterStatus(supabase, subscription.id, paper.chapter_id);

  return NextResponse.json({ ok: true, completed });
}