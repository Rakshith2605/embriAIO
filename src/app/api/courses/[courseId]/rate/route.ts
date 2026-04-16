import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase";

// POST /api/courses/[courseId]/rate — rate a course (1-5)
export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
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

  // Verify course exists and is published
  const { data: course } = await supabase
    .from("courses")
    .select("id, author_id, status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published") {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Prevent self-rating
  if (course.author_id === profile.id) {
    return NextResponse.json({ error: "Cannot rate your own course" }, { status: 400 });
  }

  // Upsert rating
  const { data, error } = await supabase
    .from("course_ratings")
    .upsert(
      { course_id: courseId, user_id: profile.id, rating, updated_at: new Date().toISOString() },
      { onConflict: "course_id,user_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET /api/courses/[courseId]/rate — get average rating & user's rating
export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { courseId } = params;

  // Get average rating and count
  const { data: ratings } = await supabase
    .from("course_ratings")
    .select("rating")
    .eq("course_id", courseId);

  const count = ratings?.length ?? 0;
  const average = count > 0
    ? Number((ratings!.reduce((s, r) => s + r.rating, 0) / count).toFixed(1))
    : 0;

  // Get user's own rating
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  let userRating: number | null = null;
  if (profile) {
    const { data: myRating } = await supabase
      .from("course_ratings")
      .select("rating")
      .eq("course_id", courseId)
      .eq("user_id", profile.id)
      .single();
    userRating = myRating?.rating ?? null;
  }

  return NextResponse.json({ average, count, userRating });
}
