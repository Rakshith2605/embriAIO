import { Notebook, ChapterId } from "@/types/curriculum";
import { getGithubUrl } from "@/lib/utils";
import { CompletionToggle } from "./CompletionToggle";
import { ExternalLink, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  notebook: Notebook;
  chapterId: ChapterId;
  backHref: string;
  backLabel: string;
}

export function NotebookToolbar({ notebook, chapterId, backHref, backLabel }: Props) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 mb-5 px-4 py-3"
      style={{ background: '#FFFDF5', border: '1px solid #C8B882', borderLeft: '3px solid #C0392B' }}
    >
      {/* Left: back + title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={backHref}
          className="flex items-center gap-1 font-jetbrains text-[10px] tracking-[0.1em] uppercase shrink-0 transition-colors"
          style={{ color: '#8B7355' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <span
          className="shrink-0 font-jetbrains text-[10px]"
          style={{ color: '#C8B882' }}
        >
          ›
        </span>
        <h1
          className="font-playfair text-[14px] truncate hidden sm:block"
          style={{ color: '#1C1610' }}
        >
          {notebook.title}
        </h1>
      </div>

      {/* Right: GitHub + completion */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={getGithubUrl(notebook.githubPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-jetbrains text-[10px] tracking-[0.08em] uppercase transition-colors"
          style={{ border: '1px solid #C8B882', color: '#5C4E35' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C0392B';
            (e.currentTarget as HTMLElement).style.color = '#C0392B';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C8B882';
            (e.currentTarget as HTMLElement).style.color = '#5C4E35';
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <CompletionToggle chapterId={chapterId} notebookSlug={notebook.slug} />
      </div>
    </div>
  );
}
