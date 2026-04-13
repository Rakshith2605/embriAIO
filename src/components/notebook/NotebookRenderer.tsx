"use client";

import { useState, useEffect, useCallback } from "react";
import { marked } from "marked";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, AlertTriangle, Play, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGithubUrl } from "@/lib/utils";

// ─── Notebook JSON types ──────────────────────────────────────────────────────

interface RawNotebook {
  cells: RawCell[];
  metadata?: {
    kernelspec?: { language?: string; display_name?: string };
  };
}

interface RawCell {
  cell_type: "markdown" | "code" | "raw";
  source: string | string[];
  outputs?: CellOutput[];
  execution_count?: number | null;
}

type CellOutput = StreamOutput | ExecuteResult | DisplayData | ErrorOutput;

interface StreamOutput {
  output_type: "stream";
  name: "stdout" | "stderr";
  text: string | string[];
}

interface ExecuteResult {
  output_type: "execute_result";
  execution_count?: number;
  data: OutputData;
  metadata?: Record<string, unknown>;
}

interface DisplayData {
  output_type: "display_data";
  data: OutputData;
  metadata?: Record<string, unknown>;
}

interface ErrorOutput {
  output_type: "error";
  ename: string;
  evalue: string;
  traceback: string[];
}

interface OutputData {
  "text/plain"?: string | string[];
  "text/html"?: string | string[];
  "image/png"?: string;
  "image/svg+xml"?: string | string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function joinSource(s: string | string[]): string {
  return Array.isArray(s) ? s.join("") : s;
}

// Strip ANSI escape codes from traceback strings
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*[mGKHF]/g, "");
}

// Convert a markdown string to safe HTML using marked
function mdToHtml(md: string): string {
  try {
    const result = marked.parse(md, { async: false });
    return typeof result === "string" ? result : md;
  } catch {
    return md;
  }
}

// ─── Output renderers ─────────────────────────────────────────────────────────

function StreamOut({ output }: { output: StreamOutput }) {
  const text = joinSource(output.text);
  if (!text) return null;
  return (
    <pre
      className={cn(
        "text-xs font-mono whitespace-pre-wrap break-words leading-relaxed px-4 py-3 rounded-md my-1",
        output.name === "stderr"
          ? "bg-red-950/40 text-red-300 border border-red-800/40"
          : "bg-muted/60 text-foreground/80"
      )}
    >
      {text}
    </pre>
  );
}

function ExecuteOut({ output }: { output: ExecuteResult | DisplayData }) {
  const data = output.data;

  // Prefer image/png
  if (data["image/png"]) {
    return (
      <div className="my-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${data["image/png"]}`}
          alt="cell output"
          className="max-w-full rounded-md"
        />
      </div>
    );
  }

  // SVG
  if (data["image/svg+xml"]) {
    const svg = joinSource(data["image/svg+xml"]);
    return (
      <div
        className="my-2 [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  // HTML output
  if (data["text/html"]) {
    const html = joinSource(data["text/html"]);
    return (
      <div
        className="my-1 overflow-x-auto text-sm [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted/50"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Plain text fallback
  if (data["text/plain"]) {
    const text = joinSource(data["text/plain"]);
    return (
      <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed px-4 py-3 rounded-md my-1 bg-muted/60 text-foreground/80">
        {text}
      </pre>
    );
  }

  return null;
}

function ErrorOut({ output }: { output: ErrorOutput }) {
  const [expanded, setExpanded] = useState(false);
  const lines = output.traceback.map(stripAnsi);
  const preview = lines.slice(-3).join("\n");
  const full = lines.join("\n");

  return (
    <div className="my-1 rounded-md border border-red-800/50 bg-red-950/30 overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-red-950/40 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-red-400 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-red-400 shrink-0" />
        )}
        <span className="text-xs font-mono text-red-400 font-semibold">{output.ename}</span>
        <span className="text-xs font-mono text-red-300/70 truncate">{output.evalue}</span>
      </div>
      <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed px-3 pb-2 text-red-300/80">
        {expanded ? full : preview}
      </pre>
    </div>
  );
}

function CellOutputs({ outputs }: { outputs: CellOutput[] }) {
  if (!outputs.length) return null;
  return (
    <div className="mt-1">
      {outputs.map((o, i) => {
        if (o.output_type === "stream") return <StreamOut key={i} output={o} />;
        if (o.output_type === "execute_result" || o.output_type === "display_data")
          return <ExecuteOut key={i} output={o} />;
        if (o.output_type === "error") return <ErrorOut key={i} output={o} />;
        return null;
      })}
    </div>
  );
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function MarkdownCell({ source }: { source: string }) {
  const html = mdToHtml(source);
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none py-2",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-p:text-foreground/90 prose-p:leading-relaxed",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-foreground",
        "prose-pre:bg-muted prose-pre:rounded-md prose-pre:text-xs",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-foreground",
        "prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground",
        "prose-table:text-sm",
        "[&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1.5 [&_th]:bg-muted/50 [&_th]:text-foreground",
        "[&_img]:max-w-full [&_img]:rounded-md"
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CodeCell({
  source,
  outputs,
  execCount,
}: {
  source: string;
  outputs: CellOutput[];
  execCount: number | null | undefined;
}) {
  const label = execCount != null ? `[${execCount}]` : "[ ]";

  return (
    <div className="my-1">
      {/* Input */}
      <div className="flex gap-2 items-start">
        <span className="text-[10px] font-mono text-muted-foreground/50 mt-2.5 shrink-0 w-10 text-right select-none">
          {label}
        </span>
        <pre className="flex-1 overflow-x-auto text-xs font-mono leading-relaxed px-4 py-3 rounded-md bg-muted/40 text-foreground/85 whitespace-pre-wrap break-words">
          {source}
        </pre>
      </div>
      {/* Outputs */}
      {outputs && outputs.length > 0 && (
        <div className="flex gap-2 items-start">
          <span className="text-[10px] font-mono text-muted-foreground/30 mt-2.5 shrink-0 w-10 text-right select-none">
            &nbsp;
          </span>
          <div className="flex-1 min-w-0">
            <CellOutputs outputs={outputs} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  chapterId: string;
  filename: string;
  githubPath: string;
  title: string;
  height?: string;
}

export function NotebookRenderer({ chapterId, filename, githubPath, title, height = "calc(100vh - 12rem)" }: Props) {
  const [notebook, setNotebook] = useState<RawNotebook | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showBinder, setShowBinder] = useState(false);
  const [binderKey, setBinderKey] = useState(0);

  const binderUrl = `https://mybinder.org/v2/gh/rasbt/LLMs-from-scratch/main?filepath=${encodeURIComponent(githubPath)}`;
  const githubUrl = getGithubUrl(githubPath);

  const load = useCallback(() => {
    setStatus("loading");
    setNotebook(null);
    fetch(`/notebooks/${chapterId}/${filename}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<RawNotebook>;
      })
      .then((nb) => {
        setNotebook(nb);
        setStatus("ready");
      })
      .catch((err) => {
        setErrorMsg(String(err));
        setStatus("error");
      });
  }, [chapterId, filename]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Binder mode ──
  if (showBinder) {
    return (
      <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-background" style={{ height }}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-muted-foreground font-mono truncate max-w-xs">{filename}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
              Binder
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBinderKey((k) => k + 1); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Reload Binder"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowBinder(false)}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              ← Read mode
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border-b border-orange-500/20">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <p className="text-xs text-orange-700 dark:text-orange-400">
            Binder may take 1–2 minutes to start. Your changes are temporary.
          </p>
        </div>
        <iframe
          key={binderKey}
          src={binderUrl}
          title={title}
          className="flex-1 border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
        />
      </div>
    );
  }

  // ── Loading skeleton ──
  if (status === "loading") {
    return (
      <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-background" style={{ minHeight: "24rem" }}>
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Loading notebook…</p>
            <p className="text-xs text-muted-foreground">Rendering pre-computed outputs</p>
          </div>
        </div>
        <div className="px-6 space-y-3 pb-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (status === "error" || !notebook) {
    return (
      <div className="rounded-xl border border-border p-8 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
        <p className="text-sm font-medium text-foreground">Could not load notebook</p>
        <p className="text-xs text-muted-foreground">{errorMsg}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View on GitHub
          </a>
        </div>
      </div>
    );
  }

  // ── Rendered notebook ──
  return (
    <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-muted-foreground font-mono truncate max-w-xs">{filename}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
            Read-only
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBinder(true)}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <Play className="h-3 w-3" />
            Run on Binder
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Open on GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Cells */}
      <div className="overflow-y-auto px-4 py-4 space-y-1" style={{ height }}>
        {notebook.cells.map((cell, i) => {
          const source = joinSource(cell.source);
          if (!source.trim() && (!cell.outputs || cell.outputs.length === 0)) return null;

          if (cell.cell_type === "markdown") {
            return (
              <div key={i} className="px-2">
                <MarkdownCell source={source} />
              </div>
            );
          }

          if (cell.cell_type === "code") {
            return (
              <CodeCell
                key={i}
                source={source}
                outputs={cell.outputs ?? []}
                execCount={cell.execution_count}
              />
            );
          }

          // raw cells: just show as plain text
          if (cell.cell_type === "raw" && source.trim()) {
            return (
              <pre key={i} className="text-xs font-mono whitespace-pre-wrap px-4 py-3 rounded-md bg-muted/30 text-muted-foreground">
                {source}
              </pre>
            );
          }

          return null;
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
        <p className="text-[11px] text-muted-foreground">
          Pre-computed outputs · To run cells,{" "}
          <button
            onClick={() => setShowBinder(true)}
            className="underline hover:text-foreground transition-colors"
          >
            open on Binder
          </button>{" "}
          or{" "}
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            clone from GitHub
          </a>
        </p>
        <p className="text-[11px] text-muted-foreground shrink-0">
          {notebook.cells.length} cells
        </p>
      </div>
    </div>
  );
}
