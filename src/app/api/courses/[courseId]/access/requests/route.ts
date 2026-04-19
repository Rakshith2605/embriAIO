import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

interface Params {
  params: { courseId: string };
}

// GET /api/courses/[courseId]/access/requests — list access requests (owner only)
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  // Verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, author_id")
    .eq("id", courseId)
    .single();

  if (!course || course.author_id !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: requests, error } = await supabase
    .from("course_access_requests")
    .select(`
      id, status, message, created_at, reviewed_at,
      profiles!course_access_requests_requester_id_fkey ( name, image, email )
    `)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = (requests ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    status: r.status,
    message: r.message,
    created_at: r.created_at,
    reviewed_at: r.reviewed_at,
    requester: r.profiles as { name: string | null; image: string | null; email: string } | null,
  }));

  return NextResponse.json(result);
}

// PATCH /api/courses/[courseId]/access/requests — approve or deny a request
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  // Verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, author_id")
    .eq("id", courseId)
    .single();

  if (!course || course.author_id !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { requestId, action } = body;

  if (!requestId || !["approve", "deny"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "approved" : "denied";

  const { data, error } = await supabase
    .from("course_access_requests")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("course_id", courseId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
