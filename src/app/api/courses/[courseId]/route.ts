import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

interface Params {
  params: { courseId: string };
}

async function getAuthorProfile(supabase: ReturnType<typeof createServiceClient>, email: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  return data;
}

async function verifyCourseOwnership(
  supabase: ReturnType<typeof createServiceClient>,
  courseId: string,
  authorId: string
) {
  const { data } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("author_id", authorId)
    .single();
  return !!data;
}

// GET /api/courses/[courseId] — fetch full course with chapters, videos, notebooks
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      profiles!courses_author_id_fkey ( name, image, email ),
      course_chapters (
        *,
        chapter_videos ( * ),
        chapter_notebooks ( * ),
        chapter_papers ( * )
      )
    `)
    .eq("id", courseId)
    .single();

  if (error || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // If not published, only author can view
  if (course.status !== "published") {
    const profile = await getAuthorProfile(supabase, session.user.email);
    if (!profile || course.author_id !== profile.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  // Sort chapters and their content by order
  const chapters = (course.course_chapters ?? [])
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map((ch: Record<string, unknown>) => ({
      ...ch,
      videos: ((ch.chapter_videos as { order: number }[]) ?? []).sort(
        (a, b) => a.order - b.order
      ),
      notebooks: ((ch.chapter_notebooks as { order: number }[]) ?? []).sort(
        (a, b) => a.order - b.order
      ),
    }));

  return NextResponse.json({
    ...course,
    author: course.profiles,
    chapters,
    course_chapters: undefined,
    profiles: undefined,
  });
}

// PUT /api/courses/[courseId] — update course metadata
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const profile = await getAuthorProfile(supabase, session.user.email);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { courseId } = params;
  const isOwner = await verifyCourseOwnership(supabase, courseId, profile.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description.trim();
  if (body.accent_color !== undefined) updates.accent_color = body.accent_color;

  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/courses/[courseId] — delete course
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const profile = await getAuthorProfile(supabase, session.user.email);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { courseId } = params;
  const isOwner = await verifyCourseOwnership(supabase, courseId, profile.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
