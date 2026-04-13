import { Curriculum } from "@/types/curriculum";
import { CHAPTERS } from "./data/chapters";
import { APPENDICES } from "./data/appendices";
import { FEATURED_VIDEOS } from "./data/featured-videos";

export const CURRICULUM: Curriculum = {
  version: "1.1.0",
  chapters: CHAPTERS,
  appendices: APPENDICES,
  featuredVideos: FEATURED_VIDEOS,
};

export const ALL_CHAPTERS = [...CHAPTERS, ...APPENDICES];

export function getChapterById(id: string) {
  return ALL_CHAPTERS.find((c) => c.id === id);
}

export function getNotebookBySlug(chapterId: string, notebookSlug: string) {
  const chapter = getChapterById(chapterId);
  if (!chapter) return null;
  return chapter.mainNotebooks.find((n) => n.slug === notebookSlug) ?? null;
}
