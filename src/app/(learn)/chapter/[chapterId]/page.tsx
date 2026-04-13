import { notFound } from "next/navigation";
import { CURRICULUM } from "@/lib/curriculum";
import { ChapterHero } from "@/components/chapter/ChapterHero";
import { VideoList } from "@/components/chapter/VideoList";
import { NotebookList } from "@/components/chapter/NotebookList";
import { BonusSection } from "@/components/chapter/BonusSection";
import { BookOpenCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function generateStaticParams() {
  return CURRICULUM.chapters.map((c) => ({ chapterId: c.id }));
}

export function generateMetadata({ params }: { params: { chapterId: string } }) {
  const chapter = CURRICULUM.chapters.find((c) => c.id === params.chapterId);
  if (!chapter) return {};
  return {
    title: `${chapter.title}: ${chapter.subtitle} — LLMs from Scratch`,
    description: chapter.description,
  };
}

export default function ChapterPage({ params }: { params: { chapterId: string } }) {
  const chapter = CURRICULUM.chapters.find((c) => c.id === params.chapterId);
  if (!chapter) notFound();

  const isConceptual = !chapter.hasCode;

  return (
    <div className="space-y-6">
      <ChapterHero chapter={chapter} />

      {/* Videos — always listed with titles */}
      <VideoList video={chapter.video} extraVideos={chapter.extraVideos} />

      {isConceptual ? (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Reading Chapter</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This chapter is conceptual and introduces the foundational ideas behind large language models.
            There is no code in this chapter — watch the video overview above and read the book chapter,
            then continue to Chapter 2 to start coding.
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.manning.com/books/build-a-large-language-model-from-scratch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get the Book
            </a>
            <Link
              href="/chapter/ch02"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Start Coding → Chapter 2
              <ArrowRight className="h-4 w-4" />
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
