import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

interface Params {
  params: { profileId: string };
}

// GET /api/profile/[profileId] — public profile with courses, subscriptions, completions
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServiceClient();
  const { profileId } = params;

  // 1. Profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, image, created_at")
    .eq("id", profileId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 2. Check if viewer is the profile owner
  const session = await auth();
  let isOwner = false;
  if (session?.user?.email) {
    const { data: viewer } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", session.user.email)
      .single();
    isOwner = viewer?.id === profileId;
  }

  // 3. Created courses (published only for non-owners, all for owner)
  const createdQuery = supabase
    .from("courses")
    .select("id, slug, title, description, accent_color, status, visibility, published_at")
    .eq("author_id", profileId)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (!isOwner) {
    createdQuery.eq("status", "published").in("visibility", ["public", "restricted"]);
  }

  const { data: createdCourses } = await createdQuery;

  // Get subscriber counts for created courses
  const createdIds = (createdCourses ?? []).map((c) => c.id);
  const subscriberCounts: Record<string, number> = {};
  if (createdIds.length > 0) {
    const { data: subCounts } = await supabase
      .from("course_subscriptions")
      .select("course_id")
      .in("course_id", createdIds);
    for (const s of subCounts ?? []) {
      subscriberCounts[s.course_id] = (subscriberCounts[s.course_id] ?? 0) + 1;
    }
  }

  // 4. Subscribed courses
  const { data: subscriptions } = await supabase
    .from("course_subscriptions")
    .select(`
      id, subscribed_at, course_id,
      courses!inner (
        id, slug, title, description, accent_color, status, visibility,
        profiles!courses_author_id_fkey ( id, name, image )
      )
    `)
    .eq("subscriber_id", profileId)
    .eq("courses.status", "published");

  // 5. Completed courses — subscriptions where all chapters are completed
  const completedCourses: Array<{
    courseId: string;
    slug: string;
    title: string;
    accent_color: string;
    completed_at: string;
    author: { id: string; name: string | null; image: string | null };
  }> = [];

  for (const sub of subscriptions ?? []) {
    const course = sub.courses as unknown as {
      id: string; slug: string; title: string; accent_color: string;
      profiles: { id: string; name: string | null; image: string | null };
    };
    if (!course) continue;

    // Get total chapter count
    const { count: totalChapters } = await supabase
      .from("course_chapters")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id);

    if (!totalChapters || totalChapters === 0) continue;

    // Get completed chapter count for this subscription
    const { count: completedCount } = await supabase
      .from("subscriber_progress")
      .select("id", { count: "exact", head: true })
      .eq("subscription_id", sub.id)
      .eq("status", "completed");

    if (completedCount === totalChapters) {
      // Get the latest completed_at date
      const { data: latestProgress } = await supabase
        .from("subscriber_progress")
        .select("completed_at")
        .eq("subscription_id", sub.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);

      completedCourses.push({
        courseId: course.id,
        slug: course.slug,
        title: course.title,
        accent_color: course.accent_color,
        completed_at: latestProgress?.[0]?.completed_at ?? sub.subscribed_at,
        author: {
          id: course.profiles?.id,
          name: course.profiles?.name,
          image: course.profiles?.image,
        },
      });
    }
  }

  // 6. Stats
  const subscribedVisible = (subscriptions ?? []).filter((s) => {
    const c = s.courses as unknown as { visibility: string };
    return c?.visibility !== "private";
  });

  return NextResponse.json({
    profile: {
      id: profile.id,
      name: profile.name,
      image: profile.image,
      joined: profile.created_at,
    },
    isOwner,
    stats: {
      coursesCreated: (createdCourses ?? []).length,
      coursesSubscribed: subscribedVisible.length,
      coursesCompleted: completedCourses.length,
    },
    createdCourses: (createdCourses ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      accent_color: c.accent_color,
      status: c.status,
      visibility: c.visibility,
      published_at: c.published_at,
      subscribers: subscriberCounts[c.id] ?? 0,
    })),
    subscribedCourses: subscribedVisible.map((s) => {
      const c = s.courses as unknown as {
        id: string; slug: string; title: string; description: string;
        accent_color: string; profiles: { id: string; name: string | null; image: string | null };
      };
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        accent_color: c.accent_color,
        author: c.profiles,
        subscribed_at: s.subscribed_at,
      };
    }),
    completedCourses,
  });
}
