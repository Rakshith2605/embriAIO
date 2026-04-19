import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

export interface BrowseCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  accent_color: string;
  status: string;
  visibility: string;
  course_type: string;
  category: string;
  href: string | null;
  chapters_count: number;
  videos_count: number;
  notebooks_count: number;
  published_at: string | null;
  author: { name: string | null; image: string | null };
  subscriber_count: number;
  avg_rating: number;
  rating_count: number;
  is_subscribed: boolean;
  user_rating: number | null;
  is_owner: boolean;
}

// GET /api/courses/browse — all published + platform courses with stats
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  const userId = profile?.id ?? null;

  // Fetch all courses: published community + all platform courses
  const { data: courses, error } = await supabase
    .from("courses")
    .select(`
      id, slug, title, description, accent_color, status, visibility, course_type, category,
      href, chapters_count, videos_count, notebooks_count, published_at, author_id,
      profiles!courses_author_id_fkey ( name, image ),
      course_chapters ( id )
    `)
    .or("course_type.eq.platform,status.eq.published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Batch fetch: subscriber counts, ratings, and user's subscriptions/ratings
  const courseIds = (courses ?? []).map((c: { id: string }) => c.id);

  const [subsRes, ratingsRes, userSubsRes, userRatingsRes] = await Promise.all([
    supabase
      .from("course_subscriptions")
      .select("course_id")
      .in("course_id", courseIds),
    supabase
      .from("course_ratings")
      .select("course_id, rating")
      .in("course_id", courseIds),
    userId
      ? supabase
          .from("course_subscriptions")
          .select("course_id")
          .eq("subscriber_id", userId)
          .in("course_id", courseIds)
      : Promise.resolve({ data: [] }),
    userId
      ? supabase
          .from("course_ratings")
          .select("course_id, rating")
          .eq("user_id", userId)
          .in("course_id", courseIds)
      : Promise.resolve({ data: [] }),
  ]);

  // Build lookup maps
  const subCounts = new Map<string, number>();
  for (const s of subsRes.data ?? []) {
    subCounts.set(s.course_id, (subCounts.get(s.course_id) ?? 0) + 1);
  }

  const ratingData = new Map<string, { sum: number; count: number }>();
  for (const r of ratingsRes.data ?? []) {
    const existing = ratingData.get(r.course_id) ?? { sum: 0, count: 0 };
    existing.sum += r.rating;
    existing.count += 1;
    ratingData.set(r.course_id, existing);
  }

  const userSubscribed = new Set(
    (userSubsRes.data ?? []).map((s: { course_id: string }) => s.course_id)
  );

  const userRatings = new Map<string, number>();
  for (const r of (userRatingsRes.data ?? []) as { course_id: string; rating: number }[]) {
    userRatings.set(r.course_id, r.rating);
  }

  // For community courses, calculate chapter/video/notebook counts dynamically
  // Filter out private courses unless the current user is the owner
  const visibleCourses = (courses ?? []).filter((c: Record<string, unknown>) => {
    const vis = (c.visibility as string) ?? "public";
    if (vis === "private" && (c.author_id as string) !== userId) return false;
    return true;
  });

  const result: BrowseCourse[] = await Promise.all(
    visibleCourses.map(async (c: Record<string, unknown>) => {
      const chapterIds = ((c.course_chapters as { id: string }[]) ?? []).map(ch => ch.id);
      const author = c.profiles as { name: string | null; image: string | null } | null;
      const id = c.id as string;

      let chapCount = (c.chapters_count as number) ?? 0;
      let vidCount = (c.videos_count as number) ?? 0;
      let nbCount = (c.notebooks_count as number) ?? 0;

      // For community courses, count from chapters
      if ((c.course_type as string) === "community" && chapterIds.length > 0) {
        chapCount = chapterIds.length;
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
        vidCount = vRes.count ?? 0;
        nbCount = nRes.count ?? 0;
      }

      const rd = ratingData.get(id);

      return {
        id,
        slug: c.slug as string,
        title: c.title as string,
        description: (c.description as string) ?? "",
        accent_color: (c.accent_color as string) ?? "violet",
        status: c.status as string,
        visibility: (c.visibility as string) ?? "public",
        course_type: (c.course_type as string) ?? "community",
        category: (c.category as string) ?? "general",
        href: (c.href as string) ?? null,
        chapters_count: chapCount,
        videos_count: vidCount,
        notebooks_count: nbCount,
        published_at: (c.published_at as string) ?? null,
        author: {
          name: author?.name ?? null,
          image: author?.image ?? null,
        },
        subscriber_count: subCounts.get(id) ?? 0,
        avg_rating: rd ? Number((rd.sum / rd.count).toFixed(1)) : 0,
        rating_count: rd?.count ?? 0,
        is_subscribed: userSubscribed.has(id),
        user_rating: userRatings.get(id) ?? null,
        is_owner: (c.author_id as string) === userId,
      };
    })
  );

  return NextResponse.json(result);
}
