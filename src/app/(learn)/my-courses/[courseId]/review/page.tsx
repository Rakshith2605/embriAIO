import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { Edit3, Video, FileCode, BookOpen, FileText, Sparkles, ArrowLeft, ExternalLink } from "lucide-react";
import { ReviewActions } from "@/components/course/ReviewActions";

export const metadata = { title: "Review Course — emrAIo" };

export default async function ReviewCoursePage({ params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!profile) redirect("/home");

  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      course_chapters(
        *,
        chapter_videos(*),
        chapter_notebooks(*),
        chapter_papers(*)
      )
    `)
    .eq("id", params.courseId)
    .single();

  if (!course || course.author_id !== profile.id) notFound();

  const chapters = (course.course_chapters ?? []).sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order
  );

  const totalVideos = chapters.reduce(
    (s: number, ch: { chapter_videos: unknown[] }) => s + (ch.chapter_videos?.length ?? 0), 0
  );
  const totalNotebooks = chapters.reduce(
    (s: number, ch: { chapter_notebooks: unknown[] }) => s + (ch.chapter_notebooks?.length ?? 0), 0
  );
  const totalPapers = chapters.reduce(
    (s: number, ch: { chapter_papers: unknown[] }) => s + (ch.chapter_papers?.length ?? 0), 0
  );

  const isClaudeCreated = (course.created_via as string) === "claude";
  const isDraft = course.status === "draft";

  const accentColors: Record<string, string> = {
    violet: "#7C3AED", blue: "#2563EB", orange: "#EA580C", emerald: "#059669",
    cyan: "#0891B2", pink: "#DB2777", yellow: "#CA8A04", red: "#DC2626",
    indigo: "#4F46E5", teal: "#0D9488",
  };
  const accent = accentColors[course.accent_color] ?? "#C0392B";

  return (
    <div>
      {/* Back link */}
      <Link
        href="/my-courses"
        className="inline-flex items-center gap-1 mb-6 font-jetbrains text-[11px] uppercase tracking-wider hover:underline"
        style={{ color: "#8B7355" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        My Courses
      </Link>

      {/* Header with Claude badge */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <p className="font-jetbrains text-[10px] tracking-[0.22em] uppercase" style={{ color: "#C0392B" }}>
            § Review Course
          </p>
          {isClaudeCreated && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 font-jetbrains text-[9px] uppercase tracking-wider"
              style={{ background: "#F0E6FF", color: "#7C3AED", border: "1px solid #D4BFFF" }}
            >
              <Sparkles className="h-3 w-3" />
              Created with Claude
            </span>
          )}
          {isDraft && (
            <span
              className="font-jetbrains text-[9px] uppercase tracking-wider px-2 py-0.5"
              style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #F59E0B" }}
            >
              Draft
            </span>
          )}
        </div>
        <h1 className="font-playfair font-bold text-[28px]" style={{ color: "#1C1610" }}>
          {course.title}
        </h1>
        {course.description && (
          <p className="font-source-serif text-[15px] mt-2 max-w-2xl" style={{ color: "#5C4E35" }}>
            {course.description}
          </p>
        )}
      </div>

      {/* Stats summary */}
      <div
        className="flex items-center gap-6 p-4 mb-6"
        style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
      >
        <div className="flex gap-4 font-jetbrains text-[10px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {chapters.length} chapters</span>
          <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {totalVideos} videos</span>
          <span className="flex items-center gap-1"><FileCode className="h-3.5 w-3.5" /> {totalNotebooks} notebooks</span>
          {totalPapers > 0 && <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {totalPapers} papers</span>}
        </div>
        <div className="flex-1" />
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: accent }}
          title={`Accent: ${course.accent_color}`}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`/create/${course.id}`}
          className="flex items-center gap-2 px-5 py-2.5 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:opacity-90"
          style={{ background: "#1C1610", color: "#F7F2E7" }}
        >
          <Edit3 className="h-4 w-4" />
          Edit Course
        </Link>
        <ReviewActions courseId={course.id} status={course.status} />
      </div>

      {/* Chapter-by-chapter preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <p className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: "#A08E6B" }}>
            § Course Content Preview
          </p>
          <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
        </div>

        {chapters.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ background: "#FFFDF5", border: "1px dashed #C8B882" }}
          >
            <BookOpen className="h-8 w-8 mx-auto mb-3" style={{ color: "#C8B882" }} />
            <p className="font-source-serif text-[14px]" style={{ color: "#5C4E35" }}>
              No chapters yet. Edit the course to add content.
            </p>
          </div>
        ) : (
          chapters.map((ch: {
            id: string; title: string; description: string; order: number;
            chapter_videos: { id: string; title: string; video_url: string | null; embed_url: string | null }[];
            chapter_notebooks: { id: string; title: string; colab_url: string | null }[];
            chapter_papers: { id: string; title: string; url: string }[];
          }, i: number) => (
            <div
              key={ch.id}
              className="p-4"
              style={{ background: "#FFFDF5", border: "1px solid #C8B882", borderLeft: `3px solid ${accent}` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="font-jetbrains text-[10px] tracking-wider mt-1 px-1.5 py-0.5"
                  style={{ background: accent, color: "#FFFDF5" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="font-playfair font-bold text-[16px]" style={{ color: "#1C1610" }}>
                    {ch.title}
                  </h3>
                  {ch.description && (
                    <p className="font-source-serif text-[13px] mt-1" style={{ color: "#5C4E35" }}>
                      {ch.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Videos */}
              {(ch.chapter_videos ?? []).length > 0 && (
                <div className="ml-9 mb-2">
                  {ch.chapter_videos.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 py-1">
                      <Video className="h-3.5 w-3.5 shrink-0" style={{ color: "#C0392B" }} />
                      <span className="font-source-serif text-[12px]" style={{ color: "#5C4E35" }}>
                        {v.title}
                      </span>
                      {v.video_url && (
                        <a href={v.video_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="h-3 w-3" style={{ color: "#8B7355" }} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Notebooks */}
              {(ch.chapter_notebooks ?? []).length > 0 && (
                <div className="ml-9 mb-2">
                  {ch.chapter_notebooks.map((n) => (
                    <div key={n.id} className="flex items-center gap-2 py-1">
                      <FileCode className="h-3.5 w-3.5 shrink-0" style={{ color: "#059669" }} />
                      <span className="font-source-serif text-[12px]" style={{ color: "#5C4E35" }}>
                        {n.title}
                      </span>
                      {n.colab_url && (
                        <a href={n.colab_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="h-3 w-3" style={{ color: "#8B7355" }} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Papers */}
              {(ch.chapter_papers ?? []).length > 0 && (
                <div className="ml-9">
                  {ch.chapter_papers.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 py-1">
                      <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "#2563EB" }} />
                      <span className="font-source-serif text-[12px]" style={{ color: "#5C4E35" }}>
                        {p.title}
                      </span>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="h-3 w-3" style={{ color: "#8B7355" }} />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {(ch.chapter_videos ?? []).length === 0 && (ch.chapter_notebooks ?? []).length === 0 && (ch.chapter_papers ?? []).length === 0 && (
                <p className="ml-9 font-source-serif text-[12px] italic" style={{ color: "#C8B882" }}>
                  No content yet
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
