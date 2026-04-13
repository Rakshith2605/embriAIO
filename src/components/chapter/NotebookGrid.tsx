import { Chapter } from "@/types/curriculum";
import { NotebookCard } from "./NotebookCard";

interface Props {
  chapter: Chapter;
}

export function NotebookGrid({ chapter }: Props) {
  if (!chapter.hasCode || chapter.mainNotebooks.length === 0) return null;

  const baseHref = chapter.id.startsWith("appendix")
    ? `/appendix/${chapter.id}`
    : `/chapter/${chapter.id}`;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">Notebooks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {chapter.mainNotebooks.map((nb) => (
          <NotebookCard
            key={nb.slug}
            notebook={nb}
            chapterId={chapter.id}
            href={`${baseHref}/notebook/${nb.slug}`}
          />
        ))}
      </div>
    </section>
  );
}
