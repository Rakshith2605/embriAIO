"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SEARCH_INDEX } from "@/lib/search-index";
import { SearchableItem } from "@/types/curriculum";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<SearchableItem[]>([]);

  useEffect(() => {
    if (q.trim().length >= 2) {
      setResults(SEARCH_INDEX.search(q.trim()).slice(0, 20).map((r) => r.item));
    } else {
      setResults([]);
    }
  }, [q]);

  function handleSelect(item: SearchableItem) {
    if (item.isBonus) {
      window.open(item.href, "_blank");
    } else {
      router.push(item.href);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {q ? `Results for "${q}"` : "Search"}
        </h1>
        {results.length > 0 && (
          <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {results.length > 0 ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {results.map((item, i) => (
            <SearchResultItem
              key={item.id}
              item={item}
              isActive={false}
              onClick={() => handleSelect(item)}
            />
          ))}
        </div>
      ) : q.trim().length >= 2 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No results found for &ldquo;{q}&rdquo;</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Try a different keyword</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Use ⌘K to open the search dialog</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
