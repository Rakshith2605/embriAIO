import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

interface Params {
  params: { courseId: string };
}

// GET /api/courses/[courseId]/access — get current user's access status
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ status: "none" });
  }

  // Check if user is the course owner
  const { data: course } = await supabase
    .from("courses")
    .select("author_id, visibility")
    .eq("id", courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.author_id === profile.id) {
    return NextResponse.json({ status: "owner" });
  }

  if (course.visibility === "public") {
    return NextResponse.json({ status: "granted" });
  }

  if (course.visibility === "private") {
    return NextResponse.json({ status: "private" });
  }

  // Restricted — check for access request
  const { data: request } = await supabase
    .from("course_access_requests")
    .select("id, status")
    .eq("course_id", courseId)
    .eq("requester_id", profile.id)
    .single();

  if (!request) {
    return NextResponse.json({ status: "none" });
  }

  return NextResponse.json({ status: request.status, requestId: request.id });
}

// POST /api/courses/[courseId]/access — request access to a restricted course
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Verify course exists and is restricted
  const { data: course } = await supabase
    .from("courses")
    .select("id, visibility, author_id")
    .eq("id", courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.author_id === profile.id) {
    return NextResponse.json({ error: "You own this course" }, { status: 400 });
  }

  if (course.visibility !== "restricted") {
    return NextResponse.json({ error: "Course is not restricted" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";

  // Upsert — if denied before, allow re-requesting
  const { data: existing } = await supabase
    .from("course_access_requests")
    .select("id, status")
    .eq("course_id", courseId)
    .eq("requester_id", profile.id)
    .single();

  if (existing) {
    if (existing.status === "pending") {
      return NextResponse.json({ error: "Request already pending" }, { status: 409 });
    }
    if (existing.status === "approved") {
      return NextResponse.json({ error: "Access already granted" }, { status: 409 });
    }
    // Was denied — update to pending
    const { data, error } = await supabase
      .from("course_access_requests")
      .update({ status: "pending", message, reviewed_at: null })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("course_access_requests")
    .insert({
      course_id: courseId,
      requester_id: profile.id,
      message,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
