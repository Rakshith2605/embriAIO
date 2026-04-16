import { notFound } from "next/navigation";
import { fetchCurriculum, fetchChapterById } from "@/lib/db-curriculum";
import { ChapterHero } from "@/components/chapter/ChapterHero";
import { VideoList } from "@/components/chapter/VideoList";
import { NotebookList } from "@/components/chapter/NotebookList";
import { BonusSection } from "@/components/chapter/BonusSection";
import Link from "next/link";

export async function generateStaticParams() {
  const curriculum = await fetchCurriculum();
  return curriculum.chapters.map((c) => ({ chapterId: c.id }));
}

export async function generateMetadata({ params }: { params: { chapterId: string } }) {
  const chapter = await fetchChapterById(params.chapterId);
  if (!chapter) return {};
  return {
    title: `${chapter.title}: ${chapter.subtitle} — LLMs from Scratch`,
    description: chapter.description,
  };
}

export default async function ChapterPage({ params }: { params: { chapterId: string } }) {
  const chapter = await fetchChapterById(params.chapterId);
  if (!chapter) notFound();

  const isConceptual = !chapter.hasCode;

  return (
    <div className="space-y-6">
      <ChapterHero chapter={chapter} />

      {/* Videos — always listed with titles */}
      <VideoList video={chapter.video} extraVideos={chapter.extraVideos} />

      {isConceptual ? (
        <section
          style={{ border: '1px solid #C8B882', borderLeft: '3px solid #C0392B', background: '#FFFDF5' }}
          className="p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="font-playfair text-[20px]" style={{ color: '#C0392B' }}>§</span>
            <h2 className="font-playfair font-bold text-[16px]" style={{ color: '#1C1610' }}>Reading Chapter</h2>
          </div>
          <p className="font-source-serif font-light text-[13px] leading-relaxed" style={{ color: '#5C4E35' }}>
            This chapter is conceptual and introduces the foundational ideas behind large language models.
            There is no code in this chapter — watch the video overview above and read the book chapter,
            then continue to Chapter 2 to start coding.
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.manning.com/books/build-a-large-language-model-from-scratch"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary inline-block font-jetbrains text-[11px] tracking-[0.08em] uppercase px-4 py-2 transition-colors"
              style={{ background: '#1C1610', color: '#F7F2E7' }}
            >
              Get the Book
            </a>
            <Link
              href="/chapter/ch02"
              className="cta-secondary inline-block font-jetbrains text-[11px] tracking-[0.08em] uppercase px-4 py-2 transition-colors"
              style={{ border: '1px solid #C8B882', color: '#5C4E35' }}
            >
              Start Coding → Chapter 2
            </Link>
          </div>
        </section>
      ) : (
        <>
          <NotebookList chapter={chapter} />
          <BonusSection chapter={chapter} />
        </>
      )}
    </div>
  );
}
