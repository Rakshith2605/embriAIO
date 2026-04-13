"use client";

import { notFound } from "next/navigation";
import { useEffect } from "react";
import { CURRICULUM, getNotebookBySlug } from "@/lib/curriculum";
import { JupyterFrame } from "@/components/notebook/JupyterFrame";
import { NotebookToolbar } from "@/components/notebook/NotebookToolbar";
import { useProgress } from "@/hooks/useProgress";
import { ChapterId } from "@/types/curriculum";

interface Props {
  params: { chapterId: string; notebookSlug: string };
}

export default function NotebookPage({ params }: Props) {
  const chapter = CURRICULUM.chapters.find((c) => c.id === params.chapterId);
  if (!chapter) notFound();

  const notebook = getNotebookBySlug(params.chapterId, params.notebookSlug);
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
