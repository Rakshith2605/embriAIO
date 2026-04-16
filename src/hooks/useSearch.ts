"use client";

import { useState, useMemo, useCallback } from "react";
import { buildSearchIndex } from "@/lib/search-index";
import { useCurriculum } from "@/context/CurriculumContext";
import { SearchableItem } from "@/types/curriculum";

const RECENT_KEY = "embriAIO_recent_v1";
const MAX_RECENT = 5;

export function useSearch() {
  const curriculum = useCurriculum();
  const [query, setQuery] = useState("");

  const { searchIndex, searchItems } = useMemo(() => {
    const allChapters = [...curriculum.chapters, ...curriculum.appendices];
    return buildSearchIndex(allChapters);
  }, [curriculum]);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchIndex.search(query.trim()).slice(0, 12).map((r) => r.item);
  }, [query, searchIndex]);

  const recentItems = useMemo((): SearchableItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      return ids
        .map((id) => searchItems.find((item) => item.id === id))
        .filter(Boolean) as SearchableItem[];
    } catch {
      return [];
    }
  }, [searchItems]);

  const recordVisit = useCallback((itemId: string) => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      const next = [itemId, ...ids.filter((id) => id !== itemId)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  return { query, setQuery, results, recentItems, recordVisit };
}
