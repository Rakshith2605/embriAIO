import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import type { CourseSummary } from "@/types/user-course";

const MAX_COURSES_PER_USER = 10;

// GET /api/courses — list published courses, or author's own with ?mine=true
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const mine = req.nextUrl.searchParams.get("mine") === "true";

  if (mine) {
    // Fetch author's own courses
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!profile) {
      return NextResponse.json([]);
    }

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(courses ?? []);
  }

  // Fetch all published courses with author info and counts
  const { data: courses, error } = await supabase
    .from("courses")
    .select(`
      id, slug, title, description, accent_color, status, published_at,
      profiles!courses_author_id_fkey ( name, image ),
      course_chapters ( id )
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get video/notebook counts per course
  const summaries: CourseSummary[] = await Promise.all(
    (courses ?? []).map(async (c: Record<string, unknown>) => {
      const chapterIds = ((c.course_chapters as { id: string }[]) ?? []).map(
        (ch) => ch.id
      );

      let videoCount = 0;
      let notebookCount = 0;

      if (chapterIds.length > 0) {
        const [vRes, nRes] = await Promise.all([
          supabase
            .from("chapter_videos")
            .select("id", { count: "exact", head: true })
            .in("chapter_id", chapterIds),
          supabase
            .from("chapter_notebooks")
            .select("id", { count: "exact", head: true })
            .in("chapter_id", chapterIds),
        ]);
        videoCount = vRes.count ?? 0;
        notebookCount = nRes.count ?? 0;
      }

      const author = c.profiles as { name: string | null; image: string | null } | null;

      return {
        id: c.id as string,
        slug: c.slug as string,
        title: c.title as string,
        description: c.description as string,
        accent_color: c.accent_color,
        status: c.status,
        published_at: c.published_at,
        author: {
          name: author?.name ?? null,
          image: author?.image ?? null,
        },
        chapter_count: chapterIds.length,
        video_count: videoCount,
        notebook_count: notebookCount,
      } as CourseSummary;
    })
  );

  return NextResponse.json(summaries);
}

// POST /api/courses — create a new course
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get author profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Rate limit: max courses per user
  const { count } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id);

  if ((count ?? 0) >= MAX_COURSES_PER_USER) {
    return NextResponse.json(
      { error: `Maximum ${MAX_COURSES_PER_USER} courses per user` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { title, description, accent_color } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return NextResponse.json(
      { error: "Title must be at least 3 characters" },
      { status: 400 }
    );
  }

  // Generate unique slug
  let slug = slugify(title);
  const { data: existing } = await supabase
    .from("courses")
    .select("slug")
    .like("slug", `${slug}%`);

  if (existing && existing.length > 0) {
    slug = `${slug}-${existing.length + 1}`;
  }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      author_id: profile.id,
      slug,
      title: title.trim(),
      description: (description ?? "").trim(),
      accent_color: accent_color ?? "violet",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(course, { status: 201 });
}
