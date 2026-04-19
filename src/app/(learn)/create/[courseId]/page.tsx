import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { CourseEditor } from "@/components/course/CourseEditor";
import type { CourseFormData, ChapterFormData, VideoFormData, NotebookFormData, PaperFormData, NotebookSource } from "@/types/user-course";

export const metadata = { title: "Edit Course — emrAIo" };

export default async function EditCoursePage({ params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const supabase = createServiceClient();
  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      profiles!courses_author_id_fkey(name),
      course_chapters(
        *,
        chapter_videos(*),
        chapter_notebooks(*),
        chapter_papers(*)
      )
    `)
    .eq("id", params.courseId)
    .single();

  if (!course) notFound();

  // Only the author can edit
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile || course.author_id !== profile.id) notFound();

  // Map to form data
  const chapters: ChapterFormData[] = (course.course_chapters ?? [])
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map((ch: { id: string; title: string; description: string | null; chapter_videos: Array<{ id: string; video_url: string | null; youtube_id: string | null; title: string }>; chapter_notebooks: Array<{ id: string; colab_url: string | null; github_path: string | null; filename: string | null; title: string; description: string | null }>; chapter_papers: Array<{ id: string; url: string; title: string; description: string | null }> }) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description ?? "",
      videos: (ch.chapter_videos ?? []).map((v: { id: string; video_url: string | null; youtube_id: string | null; title: string }): VideoFormData => ({
        id: v.id,
        url: v.video_url || (v.youtube_id ? `https://www.youtube.com/watch?v=${v.youtube_id}` : ""),
        title: v.title,
        youtube_id: v.youtube_id ?? undefined,
      })),
      notebooks: (ch.chapter_notebooks ?? []).map((n: { id: string; colab_url: string | null; github_path: string | null; filename: string | null; title: string; description: string | null }): NotebookFormData => ({
        id: n.id,
        colab_url: n.colab_url ?? "",
        title: n.title,
        description: n.description ?? "",
        source: (n.github_path ? "github" : "colab") as NotebookSource,
        github_path: n.github_path ?? undefined,
        filename: n.filename ?? undefined,
      })),
      papers: (ch.chapter_papers ?? []).map((p: { id: string; url: string; title: string; description: string | null }): PaperFormData => ({
        id: p.id,
        url: p.url,
        title: p.title,
        description: p.description ?? "",
      })),
    }));

  const formData: CourseFormData = {
    title: course.title,
    description: course.description ?? "",
    accent_color: course.accent_color ?? "violet",
    visibility: course.visibility ?? "public",
    chapters: chapters.length > 0 ? chapters : [{ title: "", description: "", videos: [], notebooks: [], papers: [] }],
  };

  return (
    <div>
      <div className="mb-6">
        <p
          className="font-jetbrains text-[10px] tracking-[0.22em] uppercase mb-2"
          style={{ color: "#C0392B" }}
        >
          § Edit Course
        </p>
        <h1
          className="font-playfair font-bold text-[28px]"
          style={{ color: "#1C1610" }}
        >
          {course.title}
        </h1>
      </div>
      <CourseEditor initial={{ courseId: course.id, data: formData }} />
    </div>
  );
}
