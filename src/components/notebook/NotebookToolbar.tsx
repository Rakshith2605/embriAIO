import { Notebook, ChapterId } from "@/types/curriculum";
import { getGithubUrl } from "@/lib/utils";
import { CompletionToggle } from "./CompletionToggle";
import { GitBranch, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  notebook: Notebook;
  chapterId: ChapterId;
  backHref: string;
  backLabel: string;
}

export function NotebookToolbar({ notebook, chapterId, backHref, backLabel }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <span className="text-muted-foreground/30 hidden sm:block">|</span>
        <h1 className="text-sm font-semibold text-foreground truncate hidden sm:block">
          {notebook.title}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={getGithubUrl(notebook.githubPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          <GitBranch className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <CompletionToggle chapterId={chapterId} notebookSlug={notebook.slug} />
      </div>
    </div>
  );
}
