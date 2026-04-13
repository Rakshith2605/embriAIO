"use client";

import { useState, useMemo, useCallback } from "react";
import { SEARCH_INDEX, SEARCH_ITEMS } from "@/lib/search-index";
import { SearchableItem } from "@/types/curriculum";

const RECENT_KEY = "embriAIO_recent_v1";
const MAX_RECENT = 5;

export function useSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return SEARCH_INDEX.search(query.trim()).slice(0, 12).map((r) => r.item);
  }, [query]);

  const recentItems = useMemo((): SearchableItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      return ids
        .map((id) => SEARCH_ITEMS.find((item) => item.id === id))
        .filter(Boolean) as SearchableItem[];
    } catch {
      return [];
    }
  }, []);

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
