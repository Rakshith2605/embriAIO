"use client";

import { useOverallProgress } from "@/hooks/useProgress";
import { useProgressContext } from "@/context/ProgressContext";
import { RotateCcw, ExternalLink } from "lucide-react";

export function SidebarFooter() {
  const { completedNotebooks, percentComplete, isHydrated } = useOverallProgress();
  const { dispatch } = useProgressContext();

  return (
    <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid #C8B882' }}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-jetbrains text-[9px] uppercase tracking-[0.1em]" style={{ color: '#8B7355' }}>
            Overall Progress
          </span>
          <span className="font-jetbrains text-[9px]" style={{ color: '#1C1610' }}>
            {isHydrated ? `${percentComplete}%` : '—'}
          </span>
        </div>
        <div className="h-[3px] overflow-hidden" style={{ background: 'rgba(200,184,130,0.3)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: isHydrated ? `${percentComplete}%` : '0%', background: '#C0392B' }}
          />
        </div>
        {isHydrated && completedNotebooks > 0 && (
          <p className="font-jetbrains text-[9px]" style={{ color: '#8B7355' }}>
            {completedNotebooks} notebook{completedNotebooks !== 1 ? 's' : ''} completed
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <a
          href="https://github.com/rasbt/LLMs-from-scratch"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-jetbrains text-[9px] transition-colors"
          style={{ color: '#8B7355' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
        >
          <ExternalLink className="h-3 w-3" />
          GitHub Repo
        </a>
        <span style={{ color: '#C8B882' }}>·</span>
        <button
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) {
              dispatch({ type: 'RESET_ALL' });
            }
          }}
          className="flex items-center gap-1.5 font-jetbrains text-[9px] transition-colors"
          style={{ color: '#8B7355' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
