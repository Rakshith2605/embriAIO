import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit3, FileEdit, Eye, BarChart3, BookOpen } from "lucide-react";
import { CourseQuickActions } from "@/components/course/CourseQuickActions";

export const metadata = { title: "My Courses — emrAIo" };

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const supabase = createServiceClient();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) redirect("/home");

  // Get user's created courses with chapter counts
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      id, title, slug, description, status, visibility, accent_color, created_at, updated_at,
      course_chapters(id, chapter_videos(id), chapter_notebooks(id))
    `)
    .eq("author_id", profile.id)
    .order("updated_at", { ascending: false });

  const myCourses = courses ?? [];

  // Get user's subscribed courses
  const { data: subscriptions } = await supabase
    .from("course_subscriptions")
    .select(`
      id, subscribed_at,
      courses(id, title, slug, description, accent_color, profiles(name, image))
    `)
    .eq("subscriber_id", profile.id)
    .order("subscribed_at", { ascending: false });

  const subscribedCourses = subscriptions ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="font-jetbrains text-[10px] tracking-[0.22em] uppercase mb-2"
            style={{ color: "#C0392B" }}
          >
            § My Courses
          </p>
          <h1
            className="font-playfair font-bold text-[28px]"
            style={{ color: "#1C1610" }}
          >
            Course Dashboard
          </h1>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider transition-colors"
          style={{ background: "#1C1610", color: "#F7F2E7" }}
        >
          <Plus className="h-4 w-4" />
          New Course
        </Link>
      </div>

      {myCourses.length === 0 ? (
        <div
          className="text-center py-16"
          style={{ background: "#FFFDF5", border: "1px dashed #C8B882" }}
        >
          <FileEdit className="h-10 w-10 mx-auto mb-4" style={{ color: "#C8B882" }} />
          <p className="font-playfair font-bold text-[18px] mb-2" style={{ color: "#1C1610" }}>
            No courses yet
          </p>
          <p className="font-source-serif text-[14px] mb-4" style={{ color: "#5C4E35" }}>
            Create your first course and share knowledge with the community.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2 font-jetbrains text-[11px] uppercase tracking-wider"
            style={{ background: "#C0392B", color: "#FFFDF5" }}
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myCourses.map((course) => {
            const chapters = course.course_chapters ?? [];
            const videoCount = chapters.reduce(
              (s: number, ch: { chapter_videos: unknown[] }) => s + (ch.chapter_videos?.length ?? 0),
              0
            );
            const notebookCount = chapters.reduce(
              (s: number, ch: { chapter_notebooks: unknown[] }) => s + (ch.chapter_notebooks?.length ?? 0),
              0
            );

            return (
              <div
                key={course.id}
                className="flex items-start gap-4 p-4"
                style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
              >
                {/* Status indicator */}
                <div
                  className="w-2 h-2 rounded-full mt-2 shrink-0"
                  style={{
                    background: course.status === "published" ? "#27AE60" : "#C8B882",
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-playfair font-bold text-[16px] truncate" style={{ color: "#1C1610" }}>
                      {course.title}
                    </h3>
                    <CourseQuickActions
                      courseId={course.id}
                      status={course.status}
                      visibility={course.visibility ?? "public"}
                    />
                  </div>

                  {course.description && (
                    <p className="font-source-serif text-[13px] line-clamp-1 mb-2" style={{ color: "#5C4E35" }}>
                      {course.description}
                    </p>
                  )}

                  <div className="flex gap-4 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                    <span>{chapters.length} ch</span>
                    <span>{videoCount} vid</span>
                    <span>{notebookCount} nb</span>
                    <span>
                      Updated {new Date(course.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {course.status === "published" && (
                    <>
                      <Link
                        href={`/course/${course.slug}`}
                        className="p-2 transition-colors hover:bg-[#EDE8D5]"
                        style={{ border: "1px solid #C8B882", color: "#5C4E35" }}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/my-courses/${course.id}/stats`}
                        className="p-2 transition-colors hover:bg-[#EDE8D5]"
                        style={{ border: "1px solid #C8B882", color: "#C0392B" }}
                        title="Stats"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                  <Link
                    href={`/create/${course.id}`}
                    className="p-2 transition-colors hover:bg-[#EDE8D5]"
                    style={{ border: "1px solid #C8B882", color: "#5C4E35" }}
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscribed Courses */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-4">
          <p className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: "#A08E6B" }}>
            § Subscribed Courses
          </p>
          <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
        </div>

        {subscribedCourses.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ background: "#FFFDF5", border: "1px dashed #C8B882" }}
          >
            <BookOpen className="h-8 w-8 mx-auto mb-3" style={{ color: "#C8B882" }} />
            <p className="font-source-serif text-[14px]" style={{ color: "#5C4E35" }}>
              You haven&apos;t subscribed to any courses yet.
            </p>
            <Link
              href="/home"
              className="inline-block mt-3 font-jetbrains text-[11px] uppercase tracking-wider hover:underline"
              style={{ color: "#C0392B" }}
            >
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {subscribedCourses.map((sub) => {
              const course = sub.courses as unknown as {
                id: string; title: string; slug: string; description: string | null; accent_color: string | null;
                profiles: { name: string | null; image: string | null };
              };
              if (!course) return null;
              return (
                <Link
                  key={sub.id}
                  href={`/course/${course.slug}`}
                  className="flex items-start gap-4 p-4 transition-colors hover:bg-[#FFFDF5]"
                  style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
                >
                  <div
                    className="w-2 h-2 rounded-full mt-2 shrink-0"
                    style={{ background: course.accent_color ?? "#C0392B" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-playfair font-bold text-[16px] truncate" style={{ color: "#1C1610" }}>
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="font-source-serif text-[13px] line-clamp-1 mb-1" style={{ color: "#5C4E35" }}>
                        {course.description}
                      </p>
                    )}
                    <div className="flex gap-4 font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                      {course.profiles?.name && <span>By {course.profiles.name}</span>}
                      <span>Subscribed {new Date(sub.subscribed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
