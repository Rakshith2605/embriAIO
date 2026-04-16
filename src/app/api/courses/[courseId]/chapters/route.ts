import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

interface Params {
  params: { courseId: string };
}

async function verifyOwnership(
  supabase: ReturnType<typeof createServiceClient>,
  courseId: string,
  email: string
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  if (!profile) return false;

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("author_id", profile.id)
    .single();

  return !!course;
}

// GET /api/courses/[courseId]/chapters — list chapters
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  const { data, error } = await supabase
    .from("course_chapters")
    .select(`
      *,
      chapter_videos ( * ),
      chapter_notebooks ( * )
    `)
    .eq("course_id", courseId)
    .order("order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/courses/[courseId]/chapters — add a chapter
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  const isOwner = await verifyOwnership(supabase, courseId, session.user.email);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description } = body;

  if (!title || typeof title !== "string" || title.trim().length < 1) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Get next order
  const { count } = await supabase
    .from("course_chapters")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { data, error } = await supabase
    .from("course_chapters")
    .insert({
      course_id: courseId,
      title: title.trim(),
      description: (description ?? "").trim(),
      order: (count ?? 0),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PUT /api/courses/[courseId]/chapters — reorder chapters (batch)
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  const isOwner = await verifyOwnership(supabase, courseId, session.user.email);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { order } = body; // Array of { id, order }

  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "Expected order array" }, { status: 400 });
  }

  // Update each chapter's order
  const updates = order.map((item: { id: string; order: number }) =>
    supabase
      .from("course_chapters")
      .update({ order: item.order })
      .eq("id", item.id)
      .eq("course_id", courseId)
  );

  await Promise.all(updates);

  return NextResponse.json({ ok: true });
}
