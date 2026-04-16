import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ColabEmbed } from "@/components/course/ColabEmbed";

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
    title: `${chapter.title} — embriAIo`,
  };
}

export default async function ChapterViewPage({ params }: { params: { slug: string; chapterId: string } }) {
  const supabase = createServiceClient();

  // Get the chapter with its course, videos, and notebooks
  const { data: chapter } = await supabase
    .from("course_chapters")
    .select(`
      *,
      courses!inner(id, slug, title, status),
      chapter_videos(id, title, embed_url, platform, "order"),
      chapter_notebooks(id, title, description, colab_url, "order")
    `)
    .eq("id", params.chapterId)
    .single();

  if (!chapter || (chapter as unknown as { courses: { slug: string; status: string } }).courses?.status !== "published") {
    notFound();
  }

  const courseData = (chapter as unknown as { courses: { id: string; slug: string; title: string } }).courses;

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

  return (
    <div>
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
          <div className="space-y-4">
            {videos.map((v: { id: string; title: string; platform: string; embed_url: string | null }) => (
              <div key={v.id}>
                <p className="font-playfair font-bold text-[15px] mb-2" style={{ color: "#1C1610" }}>
                  {v.title}
                </p>
                {v.embed_url && (
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ border: "1px solid #C8B882", aspectRatio: "16/9" }}
                  >
                    <iframe
                      src={v.embed_url}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sandbox="allow-same-origin allow-scripts allow-popups"
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                )}
              </div>
            ))}
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
            {notebooks.map((n: { id: string; title: string; colab_url: string | null; description?: string }) => (
              <ColabEmbed
                key={n.id}
                title={n.title}
                colabUrl={n.colab_url ?? ""}
                description={n.description}
              />
            ))}
          </div>
        </section>
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
