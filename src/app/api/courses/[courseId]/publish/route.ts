import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

interface Params {
  params: { courseId: string };
}

// POST /api/courses/[courseId]/publish — publish course
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { courseId } = params;

  // Verify ownership
  const { data: course } = await supabase
    .from("courses")
    .select("id, author_id")
    .eq("id", courseId)
    .eq("author_id", profile.id)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate: must have at least 1 chapter with content
  const { data: chapters } = await supabase
    .from("course_chapters")
    .select(`
      id,
      chapter_videos ( id ),
      chapter_notebooks ( id )
    `)
    .eq("course_id", courseId);

  if (!chapters || chapters.length === 0) {
    return NextResponse.json(
      { error: "Course must have at least one chapter to publish" },
      { status: 400 }
    );
  }

  const hasContent = chapters.some(
    (ch: Record<string, unknown>) =>
      ((ch.chapter_videos as unknown[]) ?? []).length > 0 ||
      ((ch.chapter_notebooks as unknown[]) ?? []).length > 0
  );

  if (!hasContent) {
    return NextResponse.json(
      { error: "At least one chapter must have a video or notebook" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("courses")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/courses/[courseId]/publish — unpublish (set back to draft)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { courseId } = params;

  const { data, error } = await supabase
    .from("courses")
    .update({ status: "draft", published_at: null })
    .eq("id", courseId)
    .eq("author_id", profile.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to unpublish" }, { status: 500 });
  }

  return NextResponse.json(data);
}
