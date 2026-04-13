"use client";

import { notFound } from "next/navigation";
import { useEffect } from "react";
import { CURRICULUM, getNotebookBySlug } from "@/lib/curriculum";
import { JupyterFrame } from "@/components/notebook/JupyterFrame";
import { NotebookToolbar } from "@/components/notebook/NotebookToolbar";
import { useProgress } from "@/hooks/useProgress";
import { ChapterId } from "@/types/curriculum";

interface Props {
  params: { appendixId: string; notebookSlug: string };
}

export default function AppendixNotebookPage({ params }: Props) {
  const appendix = CURRICULUM.appendices.find((a) => a.id === params.appendixId);
  if (!appendix) notFound();

  const notebook = getNotebookBySlug(params.appendixId, params.notebookSlug);
  if (!notebook) notFound();

  const { markInProgress } = useProgress(params.appendixId as ChapterId);

  useEffect(() => {
    markInProgress(params.notebookSlug);
  }, [params.notebookSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <NotebookToolbar
        notebook={notebook}
        chapterId={params.appendixId as ChapterId}
        backHref={`/appendix/${appendix.id}`}
        backLabel={`${appendix.title}: ${appendix.subtitle}`}
      />
      <JupyterFrame
        githubPath={notebook.githubPath}
        title={notebook.title}
      />
    </div>
  );
}
