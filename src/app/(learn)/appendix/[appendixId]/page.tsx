import { notFound } from "next/navigation";
import { fetchCurriculum, fetchChapterById } from "@/lib/db-curriculum";
import { ChapterHero } from "@/components/chapter/ChapterHero";
import { NotebookList } from "@/components/chapter/NotebookList";
import { BonusSection } from "@/components/chapter/BonusSection";

export async function generateStaticParams() {
  try {
    const curriculum = await fetchCurriculum();
    return curriculum.appendices.map((a) => ({ appendixId: a.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { appendixId: string } }) {
  const appendix = await fetchChapterById(params.appendixId);
  if (!appendix) return {};
  return {
    title: `${appendix.title}: ${appendix.subtitle} — LLMs from Scratch`,
    description: appendix.description,
  };
}

export default async function AppendixPage({ params }: { params: { appendixId: string } }) {
  const appendix = await fetchChapterById(params.appendixId);
  if (!appendix) notFound();

  return (
    <div className="space-y-6">
      <ChapterHero chapter={appendix} />
      <NotebookList chapter={appendix} />
      <BonusSection chapter={appendix} />
    </div>
  );
}
