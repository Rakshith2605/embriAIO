import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

// POST /api/courses/[courseId]/progress — update chapter progress for subscriber
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

  // Verify subscription exists
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

  // Verify chapter belongs to this course
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

// GET /api/courses/[courseId]/progress — get subscriber's progress for this course
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
    return NextResponse.json({ progress: [] });
  }

  const { data: progress } = await supabase
    .from("subscriber_progress")
    .select("chapter_id, status, started_at, completed_at")
    .eq("subscription_id", subscription.id);

  return NextResponse.json({ progress: progress ?? [] });
}
