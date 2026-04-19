import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { auth } from "@/auth";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Video, FileCode, BookOpen } from "lucide-react";
import { ColabEmbed } from "@/components/course/ColabEmbed";
import { PaperCard } from "@/components/course/PaperCard";
import { ChapterProgressTracker } from "@/components/course/ChapterProgressTracker";
import { ChapterCompleteButton } from "@/components/course/ChapterCompleteButton";

export async function generateMetadata({ params }: { params: { slug: string; chapterId: string } }) {
  const supabase = createServiceClient();
  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("title, courses!inner(slug, title, status)")
    .eq("id", params.chapterId)
    .single();

  if (!chapter || (chapter as unknown as { courses: { slug: string; status: string } }).courses?.status !== "published") {
    return { title: "Chapter Not Found" };
  }

  return {
    title: `${chapter.title} — emrAIo`,
  };
}

export default async function ChapterViewPage({ params }: { params: { slug: string; chapterId: string } }) {
  const supabase = createServiceClient();
  const session = await auth();

  // Get the chapter with its course, videos, and notebooks
  const { data: chapter } = await supabase
    .from("course_chapters")
    .select(`
      *,
      courses!inner(id, slug, title, status, visibility, author_id),
      chapter_videos(id, title, embed_url, video_url, youtube_id, platform, "order"),
      chapter_notebooks(id, title, description, colab_url, github_path, filename, slug, notebook_type, "order"),
      chapter_papers(id, title, description, url, "order")
    `)
    .eq("id", params.chapterId)
    .single();

  if (!chapter || (chapter as unknown as { courses: { slug: string; status: string } }).courses?.status !== "published") {
    notFound();
  }

  const courseData = (chapter as unknown as { courses: { id: string; slug: string; title: string; visibility: string; author_id: string } }).courses;

  // Visibility access check
  const visibility = courseData.visibility ?? "public";
  let isOwner = false;
  let userId: string | null = null;

  if (session?.user?.email) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", session.user.email)
      .single();
    if (profile) {
      userId = profile.id;
      isOwner = courseData.author_id === profile.id;
    }
  }

  if (visibility === "private" && !isOwner) notFound();

  if (visibility === "restricted" && !isOwner) {
    let hasAccess = false;
    if (userId) {
      const { data: accessReq } = await supabase
        .from("course_access_requests")
        .select("status")
        .eq("course_id", courseData.id)
        .eq("requester_id", userId)
        .single();
      if (accessReq?.status === "approved") hasAccess = true;
    }
    if (!hasAccess) notFound();
  }

  // Check if user is subscribed and get chapter progress
  let isSubscribed = false;
  let chapterStatus = "not_started";
  if (userId) {
    const { data: subscription } = await supabase
      .from("course_subscriptions")
      .select("id")
      .eq("course_id", courseData.id)
      .eq("subscriber_id", userId)
      .single();
    if (subscription) {
      isSubscribed = true;
      const { data: progress } = await supabase
        .from("subscriber_progress")
        .select("status")
        .eq("subscription_id", subscription.id)
        .eq("chapter_id", params.chapterId)
        .single();
      if (progress) chapterStatus = progress.status;
    }
  }

  // Get all chapters for navigation
  const { data: allChapters } = await supabase
    .from("course_chapters")
    .select("id, title, \"order\"")
    .eq("course_id", courseData.id)
    .order("order");

  const chapters = allChapters ?? [];
  const currentIdx = chapters.findIndex((ch) => ch.id === params.chapterId);
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  const videos = (chapter.chapter_videos ?? []).sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order
  );
  const notebooks = (chapter.chapter_notebooks ?? []).sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order
  );
  const papers = (chapter.chapter_papers ?? []).sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order
  );

  return (
    <div>
      {/* Auto-track chapter as in_progress */}
      <ChapterProgressTracker
        courseId={courseData.id}
        chapterId={params.chapterId}
        isSubscribed={isSubscribed}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 font-jetbrains text-[10px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
        <Link href={`/course/${params.slug}`} className="hover:underline" style={{ color: "#C0392B" }}>
          {courseData.title}
        </Link>
        <span>/</span>
        <span>Chapter {currentIdx + 1}</span>
      </div>

      {/* Chapter hero */}
      <div
        style={{ borderLeft: "3px solid #C0392B", background: "#FFFDF5" }}
        className="p-6 mb-8"
      >
        <p className="font-jetbrains text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: "#C0392B" }}>
          § Chapter {currentIdx + 1}
        </p>
        <h1 className="font-playfair font-bold text-[28px] leading-tight mb-2" style={{ color: "#1C1610" }}>
          {chapter.title}
        </h1>
        {chapter.description && (
          <p className="font-source-serif text-[15px] leading-relaxed" style={{ color: "#5C4E35" }}>
            {chapter.description}
          </p>
        )}
        {(videos.length > 0 || notebooks.length > 0 || papers.length > 0) && (
          <div className="flex gap-4 font-jetbrains text-[9px] uppercase tracking-wider mt-4 pt-3" style={{ color: "#8B7355", borderTop: "1px solid #E6DCC8" }}>
            {videos.length > 0 && (
              <span className="flex items-center gap-1">
                <Video className="h-3 w-3" /> {videos.length} video{videos.length !== 1 ? "s" : ""}
              </span>
            )}
            {notebooks.length > 0 && (
              <span className="flex items-center gap-1">
                <FileCode className="h-3 w-3" /> {notebooks.length} notebook{notebooks.length !== 1 ? "s" : ""}
              </span>
            )}
            {papers.length > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {papers.length} paper{papers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <p className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: "#A08E6B" }}>
              § Videos
            </p>
            <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
          </div>
          <div className="space-y-6">
            {videos.map((v: { id: string; title: string; platform: string; embed_url: string | null; video_url: string | null; youtube_id: string | null }) => {
              const embedSrc = v.embed_url
                ?? (v.youtube_id ? `https://www.youtube.com/embed/${v.youtube_id}` : null);
              return (
                <div key={v.id}>
                  <p className="font-playfair font-bold text-[15px] mb-2" style={{ color: "#1C1610" }}>
                    {v.title}
                  </p>
                  {embedSrc ? (
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ border: "1px solid #C8B882", aspectRatio: "16/9" }}
                    >
                      <iframe
                        src={embedSrc}
                        title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-popups"
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : v.video_url ? (
                    <a
                      href={v.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 font-jetbrains text-[11px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5]"
                      style={{ border: "1px solid #C8B882", color: "#C0392B" }}
                    >
                      Watch on {v.platform === "youtube" ? "YouTube" : v.platform} →
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Notebooks */}
      {notebooks.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <p className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: "#A08E6B" }}>
              § Notebooks
            </p>
            <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
          </div>
          <div className="space-y-3">
            {notebooks.map((n: { id: string; title: string; colab_url: string | null; github_path?: string | null; filename?: string | null; slug?: string | null; notebook_type?: string | null; description?: string }) => {
              // JupyterLite / embedded notebooks (via github_path)
              if (n.github_path && !n.colab_url) {
                const nbSlug = n.slug ?? n.filename?.replace(/\.ipynb$/, "") ?? "notebook";
                const chapterSlug = (chapter as unknown as { slug?: string }).slug;
                const notebookHref = chapterSlug
                  ? `/chapter/${chapterSlug}/notebook/${nbSlug}`
                  : `/chapter/${chapter.id}/notebook/${nbSlug}`;
                return (
                  <div
                    key={n.id}
                    style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
                    className="p-4 flex items-start gap-4 group hover:shadow-sm transition-shadow"
                  >
                    <div
                      className="shrink-0 flex items-center justify-center w-10 h-10"
                      style={{ background: "#F4E8C1", border: "1px solid #C8B882" }}
                    >
                      <FileCode className="h-5 w-5" style={{ color: "#C0392B" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-playfair font-bold text-[15px] leading-snug mb-0.5" style={{ color: "#1C1610" }}>
                        {n.title}
                      </p>
                      {n.description && (
                        <p className="font-source-serif text-[13px] leading-relaxed mb-2 line-clamp-2" style={{ color: "#5C4E35" }}>
                          {n.description}
                        </p>
                      )}
                      <a
                        href={notebookHref}
                        className="inline-flex items-center gap-1.5 font-jetbrains text-[11px] tracking-wide uppercase"
                        style={{ color: "#C0392B" }}
                      >
                        Open Notebook →
                      </a>
                    </div>
                  </div>
                );
              }
              // Colab notebooks
              return (
                <ColabEmbed
                  key={n.id}
                  title={n.title}
                  colabUrl={n.colab_url ?? ""}
                  description={n.description}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Papers */}
      {papers.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <p className="font-jetbrains text-[10px] tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: "#A08E6B" }}>
              § Papers
            </p>
            <div className="flex-1 h-px" style={{ background: "#C8B882", opacity: 0.5 }} />
          </div>
          <div className="space-y-3">
            {papers.map((p: { id: string; title: string; url: string; description?: string }) => (
              <PaperCard
                key={p.id}
                title={p.title}
                url={p.url}
                description={p.description}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mark Complete */}
      {isSubscribed && (
        <div className="flex justify-end mb-4">
          <ChapterCompleteButton
            courseId={courseData.id}
            chapterId={params.chapterId}
            isSubscribed={isSubscribed}
            initialStatus={chapterStatus}
          />
        </div>
      )}

      {/* Chapter navigation */}
      <div className="flex items-center justify-between pt-6 mt-8" style={{ borderTop: "1px solid #C8B882" }}>
        {prevChapter ? (
          <Link
            href={`/course/${params.slug}/${prevChapter.id}`}
            className="flex items-center gap-2 font-jetbrains text-[11px] uppercase tracking-wider hover:underline"
            style={{ color: "#5C4E35" }}
          >
            <ChevronLeft className="h-4 w-4" />
            {prevChapter.title}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/course/${params.slug}/${nextChapter.id}`}
            className="flex items-center gap-2 font-jetbrains text-[11px] uppercase tracking-wider hover:underline"
            style={{ color: "#C0392B" }}
          >
            {nextChapter.title}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href={`/course/${params.slug}`}
            className="font-jetbrains text-[11px] uppercase tracking-wider hover:underline"
            style={{ color: "#C0392B" }}
          >
            Back to course →
          </Link>
        )}
      </div>
    </div>
  );
}
