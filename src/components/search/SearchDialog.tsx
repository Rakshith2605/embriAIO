"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { SearchResultItem } from "./SearchResultItem";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: Props) {
  const { query, setQuery, results, recentItems, recordVisit } = useSearch();
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const displayItems = query.trim().length >= 2 ? results : recentItems;
  const showRecent = query.trim().length < 2 && recentItems.length > 0;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
    } else {
      setQuery("");
    }
  }, [open, setQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleSelect(item: (typeof displayItems)[0]) {
    recordVisit(item.id);
    if (item.isBonus) {
      window.open(item.href, "_blank");
    } else {
      router.push(item.href);
    }
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, displayItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && displayItems[activeIndex]) {
      handleSelect(displayItems[activeIndex]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <div className="relative w-full max-w-xl bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search chapters, notebooks, topics…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {showRecent && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Recent</span>
            </div>
          )}

          {displayItems.length > 0 ? (
            displayItems.map((item, i) => (
              <SearchResultItem
                key={item.id}
                item={item}
                isActive={i === activeIndex}
                onClick={() => handleSelect(item)}
              />
            ))
          ) : query.trim().length >= 2 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different keyword</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Type to search across all content</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-background px-1">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-background px-1">↵</kbd> open
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-background px-1">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
