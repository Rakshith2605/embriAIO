"use client";

import { notFound } from "next/navigation";
import { useEffect } from "react";
import { useCurriculum } from "@/context/CurriculumContext";
import { JupyterFrame } from "@/components/notebook/JupyterFrame";
import { NotebookToolbar } from "@/components/notebook/NotebookToolbar";
import { useProgress } from "@/hooks/useProgress";
import { ChapterId } from "@/types/curriculum";

interface Props {
  params: { chapterId: string; notebookSlug: string };
}

export default function NotebookPage({ params }: Props) {
  const curriculum = useCurriculum();
  const chapter = curriculum.chapters.find((c) => c.id === params.chapterId);
  if (!chapter) notFound();

  const notebook = chapter.mainNotebooks.find((n) => n.slug === params.notebookSlug) ?? null;
  if (!notebook) notFound();

  const { markInProgress } = useProgress(params.chapterId as ChapterId);

  useEffect(() => {
    markInProgress(params.notebookSlug);
  }, [params.notebookSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <NotebookToolbar
        notebook={notebook}
        chapterId={params.chapterId as ChapterId}
        backHref={`/chapter/${chapter.id}`}
        backLabel={`${chapter.title}: ${chapter.subtitle}`}
      />
      <JupyterFrame
        githubPath={notebook.githubPath}
        title={notebook.title}
      />
    </div>
  );
}
