import { notFound } from "next/navigation";
import { CURRICULUM } from "@/lib/curriculum";
import { ChapterHero } from "@/components/chapter/ChapterHero";
import { NotebookList } from "@/components/chapter/NotebookList";
import { BonusSection } from "@/components/chapter/BonusSection";

export function generateStaticParams() {
  return CURRICULUM.appendices.map((a) => ({ appendixId: a.id }));
}

export function generateMetadata({ params }: { params: { appendixId: string } }) {
  const appendix = CURRICULUM.appendices.find((a) => a.id === params.appendixId);
  if (!appendix) return {};
  return {
    title: `${appendix.title}: ${appendix.subtitle} — LLMs from Scratch`,
    description: appendix.description,
  };
}

export default function AppendixPage({ params }: { params: { appendixId: string } }) {
  const appendix = CURRICULUM.appendices.find((a) => a.id === params.appendixId);
  if (!appendix) notFound();

  return (
    <div className="space-y-6">
      <ChapterHero chapter={appendix} />
      <NotebookList chapter={appendix} />
      <BonusSection chapter={appendix} />
    </div>
  );
}
