export type ChapterId = string;

export type NotebookType = "main" | "exercise" | "bonus" | "supplemental";

export type ContentTag =
  | "tokenization"
  | "attention"
  | "gpt"
  | "pretraining"
  | "finetuning"
  | "lora"
  | "pytorch"
  | "evaluation"
  | "architecture";

export type CompletionStatus = "not_started" | "in_progress" | "completed";

export interface Notebook {
  slug: string;
  title: string;
  filename: string;
  githubPath: string;
  type: NotebookType;
  description?: string;
  estimatedMinutes?: number;
}

export type VideoSource = "raschka" | "freecodecamp" | "workshop" | "other";

export interface ChapterVideo {
  youtubeId: string;
  title: string;
  durationSeconds?: number;
  source?: VideoSource;
  label?: string;
}

export interface VideoResource {
  youtubeId: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  source: VideoSource;
  label: string;
}

export interface BonusFolder {
  slug: string;
  title: string;
  githubPath: string;
  description?: string;
  gpuRequired?: boolean;
  notebooks: Notebook[];
}

export interface Chapter {
  id: ChapterId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  tags: ContentTag[];
  githubPath: string;
  mainNotebooks: Notebook[];
  bonusFolders: BonusFolder[];
  video?: ChapterVideo;
  extraVideos?: ChapterVideo[];
  hasCode: boolean;
  icon: string;
  color: string;
}

export interface Curriculum {
  chapters: Chapter[];
  appendices: Chapter[];
  featuredVideos: VideoResource[];
  version: string;
}

export interface NotebookProgress {
  notebookSlug: string;
  status: CompletionStatus;
  completedAt?: string;
  lastOpenedAt?: string;
}

export interface ChapterProgress {
  chapterId: ChapterId;
  notebookProgress: Record<string, NotebookProgress>;
  videoWatched: boolean;
}

export interface ProgressState {
  chapters: Record<ChapterId, ChapterProgress>;
  lastUpdatedAt: string;
}

export type ProgressAction =
  | { type: "MARK_NOTEBOOK_COMPLETE"; chapterId: ChapterId; notebookSlug: string }
  | { type: "MARK_NOTEBOOK_IN_PROGRESS"; chapterId: ChapterId; notebookSlug: string }
  | { type: "RESET_NOTEBOOK"; chapterId: ChapterId; notebookSlug: string }
  | { type: "MARK_VIDEO_WATCHED"; chapterId: ChapterId }
  | { type: "RESET_ALL" }
  | { type: "HYDRATE"; state: ProgressState };

export interface SearchableItem {
  id: string;
  chapterId: ChapterId;
  chapterTitle: string;
  notebookTitle: string;
  description: string;
  tags: string[];
  href: string;
  type: "chapter" | NotebookType;
  isBonus?: boolean;
}
