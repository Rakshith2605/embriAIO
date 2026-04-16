import Fuse from "fuse.js";
import { SearchableItem, ChapterId, Chapter } from "@/types/curriculum";

export function buildSearchItems(allChapters: Chapter[]): SearchableItem[] {
  const items: SearchableItem[] = [];

  allChapters.forEach((chapter) => {
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

export function buildSearchIndex(allChapters: Chapter[]) {
  const searchItems = buildSearchItems(allChapters);
  const searchIndex = new Fuse(searchItems, {
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
  return { searchItems, searchIndex };
}
