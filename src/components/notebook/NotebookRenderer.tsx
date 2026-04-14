"use client";

import { useState, useEffect, useCallback } from "react";
import { marked } from "marked";
import { ExternalLink, AlertTriangle, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
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

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*[mGKHF]/g, "");
}

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
  const isErr = output.name === "stderr";
  return (
    <pre
      style={{
        background: isErr ? 'rgba(192,57,43,0.06)' : 'rgba(200,184,130,0.15)',
        border: isErr ? '1px solid rgba(192,57,43,0.3)' : '1px solid #C8B882',
        color: isErr ? '#C0392B' : '#1C1610',
        borderLeft: isErr ? '3px solid #C0392B' : undefined,
      }}
      className="text-xs font-jetbrains whitespace-pre-wrap break-words leading-relaxed px-4 py-3 my-1"
    >
      {text}
    </pre>
  );
}

function ExecuteOut({ output }: { output: ExecuteResult | DisplayData }) {
  const data = output.data;

  if (data["image/png"]) {
    return (
      <div className="my-2" style={{ border: '1px solid #C8B882', display: 'inline-block', background: '#FFFDF5' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${data["image/png"]}`}
          alt="cell output"
          className="max-w-full block"
        />
      </div>
    );
  }

  if (data["image/svg+xml"]) {
    const svg = joinSource(data["image/svg+xml"]);
    return (
      <div
        className="my-2 [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  if (data["text/html"]) {
    const html = joinSource(data["text/html"]);
    return (
      <div
        className="my-1 overflow-x-auto text-[13px] font-source-serif"
        style={{
          color: '#1C1610',
        }}
        // Table styles applied via globals.css or inline
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (data["text/plain"]) {
    const text = joinSource(data["text/plain"]);
    return (
      <pre
        className="text-xs font-jetbrains whitespace-pre-wrap break-words leading-relaxed px-4 py-3 my-1"
        style={{ background: 'rgba(200,184,130,0.15)', border: '1px solid #C8B882', color: '#1C1610' }}
      >
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
    <div
      className="my-1 overflow-hidden"
      style={{ border: '1px solid rgba(192,57,43,0.4)', borderLeft: '3px solid #C0392B', background: 'rgba(192,57,43,0.04)' }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
        style={{ borderBottom: expanded ? '1px solid rgba(192,57,43,0.2)' : 'none' }}
        onClick={() => setExpanded((p) => !p)}
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: '#C0392B' }} />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: '#C0392B' }} />
        )}
        <span className="text-xs font-jetbrains font-semibold" style={{ color: '#C0392B' }}>{output.ename}</span>
        <span className="text-xs font-jetbrains truncate" style={{ color: '#8B7355' }}>{output.evalue}</span>
      </div>
      <pre className="text-xs font-jetbrains whitespace-pre-wrap break-words leading-relaxed px-3 pb-2 pt-1" style={{ color: '#5C4E35' }}>
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
      className="py-2 px-2"
      style={{ color: '#1C1610' }}
      // Prose styles injected below via a class
    >
      <div
        className="nb-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
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
    <div className="my-2">
      {/* Input */}
      <div className="flex gap-2 items-start">
        <span
          className="text-[10px] font-jetbrains mt-2.5 shrink-0 w-10 text-right select-none"
          style={{ color: '#A08E6B' }}
        >
          {label}
        </span>
        <pre
          className="flex-1 overflow-x-auto text-xs font-jetbrains leading-relaxed px-4 py-3 whitespace-pre-wrap break-words"
          style={{ background: '#EDE8D5', border: '1px solid #C8B882', color: '#1C1610' }}
        >
          {source}
        </pre>
      </div>
      {/* Outputs */}
      {outputs && outputs.length > 0 && (
        <div className="flex gap-2 items-start mt-1">
          <span className="text-[10px] font-jetbrains mt-2.5 shrink-0 w-10 text-right select-none" style={{ color: 'transparent' }}>
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ border: '1px solid #C8B882', background: '#FFFDF5', minHeight: '24rem' }}
    >
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid #C8B882' }}>
        <div
          className="h-4 w-4 rounded-full border-2 animate-spin shrink-0"
          style={{ borderColor: 'rgba(200,184,130,0.4)', borderTopColor: '#C0392B' }}
        />
        <div>
          <p className="font-playfair text-[14px]" style={{ color: '#1C1610' }}>Loading notebook…</p>
          <p className="font-jetbrains text-[10px] mt-0.5" style={{ color: '#A08E6B' }}>Rendering pre-computed outputs</p>
        </div>
      </div>
      <div className="px-6 space-y-4 py-6">
        {[60, 100, 40, 80, 50].map((w, i) => (
          <div
            key={i}
            className="h-4 animate-pulse"
            style={{ width: `${w}%`, background: 'rgba(200,184,130,0.3)' }}
          />
        ))}
      </div>
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

export function NotebookRenderer({ chapterId, filename, githubPath, height = "calc(100vh - 14rem)" }: Props) {
  const [notebook, setNotebook] = useState<RawNotebook | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const colabUrl = `https://colab.research.google.com/github/rasbt/LLMs-from-scratch/blob/main/${githubPath}`;
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

  if (status === "loading") return <LoadingSkeleton />;

  if (status === "error" || !notebook) {
    return (
      <div
        className="p-8 text-center space-y-4"
        style={{ border: '1px solid #C8B882', background: '#FFFDF5' }}
      >
        <AlertTriangle className="h-8 w-8 mx-auto" style={{ color: '#C0392B' }} />
        <p className="font-playfair text-[16px]" style={{ color: '#1C1610' }}>Could not load notebook</p>
        <p className="font-jetbrains text-[11px]" style={{ color: '#A08E6B' }}>{errorMsg}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-[0.08em] transition-colors"
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
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
          <a
            href={colabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-[0.08em] transition-colors"
            style={{ background: '#F9AB00', color: '#000', border: '1px solid transparent' }}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open in Colab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ border: '1px solid #C8B882', background: '#FFFDF5' }}
    >
      {/* Chrome bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid #C8B882', background: '#EDE8D5' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-jetbrains text-[9px] truncate max-w-xs"
            style={{ color: '#8B7355' }}
          >
            {filename}
          </span>
          <span
            className="inline-flex items-center px-2 py-0.5 font-jetbrains text-[8px] tracking-wide"
            style={{ border: '1px solid #C8B882', color: '#A08E6B', background: '#F7F2E7' }}
          >
            Read-only
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={colabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 font-jetbrains text-[10px] uppercase tracking-[0.06em] transition-opacity hover:opacity-80"
            style={{ background: '#F9AB00', color: '#000' }}
            title="Open in Google Colab"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 17.292l-4.5-4.364 1.857-1.857 2.643 2.506 5.643-5.643 1.857 1.857-7.5 7.501z"/>
            </svg>
            Colab
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ color: '#A08E6B' }}
            title="Open on GitHub"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#A08E6B'; }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Cells */}
      <div className="overflow-y-auto px-6 py-5 space-y-1" style={{ height }}>
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

          if (cell.cell_type === "raw" && source.trim()) {
            return (
              <pre
                key={i}
                className="text-xs font-jetbrains whitespace-pre-wrap px-4 py-3 my-1"
                style={{ background: 'rgba(200,184,130,0.2)', border: '1px solid #C8B882', color: '#5C4E35' }}
              >
                {source}
              </pre>
            );
          }

          return null;
        })}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 flex items-center justify-between shrink-0"
        style={{ borderTop: '1px solid #C8B882', background: '#EDE8D5' }}
      >
        <p className="font-jetbrains text-[10px]" style={{ color: '#A08E6B' }}>
          Pre-computed outputs · To run cells,{" "}
          <a
            href={colabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: '#8B7355' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
          >
            open in Colab
          </a>
          {" "}or{" "}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: '#8B7355' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
          >
            clone from GitHub
          </a>
        </p>
        <p className="font-jetbrains text-[10px] shrink-0" style={{ color: '#A08E6B' }}>
          {notebook.cells.length} cells
        </p>
      </div>
    </div>
  );
}
