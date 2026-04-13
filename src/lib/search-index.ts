import Fuse from "fuse.js";
import { ALL_CHAPTERS } from "./curriculum";
import { SearchableItem, ChapterId } from "@/types/curriculum";

function buildSearchItems(): SearchableItem[] {
  const items: SearchableItem[] = [];

  ALL_CHAPTERS.forEach((chapter) => {
    items.push({
      id: chapter.id,
      chapterId: chapter.id as ChapterId,
      chapterTitle: chapter.title,
      notebookTitle: chapter.subtitle,
      description: chapter.description,
      tags: chapter.tags,
      href: chapter.id.startsWith("appendix")
        ? `/appendix/${chapter.id}`
        : `/chapter/${chapter.id}`,
      type: "chapter",
    });

    chapter.mainNotebooks.forEach((nb) => {
      items.push({
        id: `${chapter.id}::${nb.slug}`,
        chapterId: chapter.id as ChapterId,
        chapterTitle: chapter.title,
        notebookTitle: nb.title,
        description: nb.description ?? "",
        tags: chapter.tags,
        href: chapter.id.startsWith("appendix")
          ? `/appendix/${chapter.id}/notebook/${nb.slug}`
          : `/chapter/${chapter.id}/notebook/${nb.slug}`,
        type: nb.type,
      });
    });

    chapter.bonusFolders.forEach((bf) => {
      items.push({
        id: `${chapter.id}::bonus::${bf.slug}`,
        chapterId: chapter.id as ChapterId,
        chapterTitle: chapter.title,
        notebookTitle: bf.title,
        description: bf.description ?? "",
        tags: chapter.tags,
        href: `https://github.com/rasbt/LLMs-from-scratch/tree/main/${bf.githubPath}`,
        type: "bonus",
        isBonus: true,
      });
    });
  });

  return items;
}

export const SEARCH_ITEMS = buildSearchItems();

export const SEARCH_INDEX = new Fuse(SEARCH_ITEMS, {
  keys: [
    { name: "notebookTitle", weight: 0.4 },
    { name: "description", weight: 0.25 },
    { name: "chapterTitle", weight: 0.2 },
    { name: "tags", weight: 0.15 },
  ],
  threshold: 0.35,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  useExtendedSearch: false,
});
