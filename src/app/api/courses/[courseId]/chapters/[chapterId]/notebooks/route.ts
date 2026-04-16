import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";
import { parseColabUrl } from "@/lib/colab-utils";

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

// POST /api/courses/[courseId]/chapters/[chapterId]/notebooks — add notebook
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
  const { colab_url, title, description } = body;

  if (!colab_url || typeof colab_url !== "string") {
    return NextResponse.json({ error: "Colab URL is required" }, { status: 400 });
  }

  const parsed = parseColabUrl(colab_url);
  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid Colab URL. Must be a colab.research.google.com link" },
      { status: 400 }
    );
  }

  // Get next order
  const { count } = await supabase
    .from("chapter_notebooks")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId);

  const { data, error } = await supabase
    .from("chapter_notebooks")
    .insert({
      chapter_id: chapterId,
      colab_url: parsed.openUrl,
      title: (title ?? `Notebook ${(count ?? 0) + 1}`).trim(),
      description: (description ?? "").trim(),
      order: count ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/courses/[courseId]/chapters/[chapterId]/notebooks — remove notebook
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

  const { notebookId } = await req.json();
  if (!notebookId) {
    return NextResponse.json({ error: "notebookId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("chapter_notebooks")
    .delete()
    .eq("id", notebookId)
    .eq("chapter_id", chapterId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
