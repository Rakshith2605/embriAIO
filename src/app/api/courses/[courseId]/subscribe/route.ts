import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

// POST /api/courses/[courseId]/subscribe — subscribe to a course
export async function POST(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  // Get subscriber profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Verify course is published
  const { data: course } = await supabase
    .from("courses")
    .select("id, author_id, status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published") {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Prevent self-subscription
  if (course.author_id === profile.id) {
    return NextResponse.json({ error: "Cannot subscribe to your own course" }, { status: 400 });
  }

  // Insert subscription (upsert to handle duplicates gracefully)
  const { data, error } = await supabase
    .from("course_subscriptions")
    .upsert(
      { course_id: courseId, subscriber_id: profile.id },
      { onConflict: "course_id,subscriber_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/courses/[courseId]/subscribe — unsubscribe from a course
export async function DELETE(_req: NextRequest, { params }: { params: { courseId: string } }) {
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

  const { error } = await supabase
    .from("course_subscriptions")
    .delete()
    .eq("course_id", courseId)
    .eq("subscriber_id", profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// GET /api/courses/[courseId]/subscribe — check if user is subscribed
export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ subscribed: false });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ subscribed: false });
  }

  const { data } = await supabase
    .from("course_subscriptions")
    .select("id")
    .eq("course_id", courseId)
    .eq("subscriber_id", profile.id)
    .single();

  return NextResponse.json({ subscribed: !!data });
}
