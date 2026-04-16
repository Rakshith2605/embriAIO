import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

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

// PUT /api/courses/[courseId]/chapters/[chapterId] — update chapter
export async function PUT(req: NextRequest, { params }: Params) {
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
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description.trim();

  const { data, error } = await supabase
    .from("course_chapters")
    .update(updates)
    .eq("id", chapterId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/courses/[courseId]/chapters/[chapterId] — delete chapter
export async function DELETE(_req: NextRequest, { params }: Params) {
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

  const { error } = await supabase
    .from("course_chapters")
    .delete()
    .eq("id", chapterId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
