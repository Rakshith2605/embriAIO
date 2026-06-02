/* ───── Video platform support ─────────────────────────── */

export type VideoPlatform = "youtube" | "peertube" | "other";

export type CourseStatus = "draft" | "published";

export type CourseVisibility = "public" | "restricted" | "private";

export type AccentColor =
  | "violet"
  | "blue"
  | "orange"
  | "emerald"
  | "cyan"
  | "pink"
  | "yellow"
  | "red"
  | "indigo"
  | "teal";

/* ───── Database row types ────────────────────────────── */

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
}

export interface UserCourse {
  id: string;
  author_id: string;
  slug: string;
  title: string;
  description: string;
  accent_color: AccentColor;
  status: CourseStatus;
  visibility: CourseVisibility;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface UserChapter {
  id: string;
  course_id: string;
  order: number;
  title: string;
  description: string;
}

export interface UserVideo {
  id: string;
  chapter_id: string;
  platform: VideoPlatform;
  video_url: string;
  embed_url: string;
  title: string;
  duration_seconds: number | null;
  order: number;
}

export interface UserNotebook {
  id: string;
  chapter_id: string;
  colab_url: string;
  title: string;
  description: string;
  order: number;
}

export interface UserPaper {
  id: string;
  chapter_id: string;
  url: string;
  title: string;
  description: string;
  order: number;
}

/* ───── Aggregate / view types ────────────────────────── */

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  accent_color: AccentColor;
  status: CourseStatus;
  published_at: string | null;
  created_via?: "manual" | "claude";
  author: {
    id?: string;
    name: string | null;
    image: string | null;
  };
  chapter_count: number;
  video_count: number;
  notebook_count: number;
}

export interface CourseDetail extends UserCourse {
  author: Pick<Profile, "name" | "image" | "email">;
  chapters: ChapterDetail[];
}

export interface ChapterDetail extends UserChapter {
  videos: UserVideo[];
  notebooks: UserNotebook[];
  papers: UserPaper[];
}

/* ───── Form / input types ────────────────────────────── */

export const COURSE_CATEGORIES = [
  { value: "nlp", label: "Natural Language Processing" },
  { value: "computer-vision", label: "Computer Vision & Multimodal" },
  { value: "optimization", label: "Optimization & Efficiency" },
  { value: "general", label: "General" },
] as const;

export type CourseCategory = string;

export const CATEGORY_CUSTOM = "__custom__";

export interface CourseFormData {
  title: string;
  description: string;
  accent_color: AccentColor;
  visibility: CourseVisibility;
  category: CourseCategory;
  chapters: ChapterFormData[];
}

export interface ChapterFormData {
  id?: string; // present when editing existing chapter
  title: string;
  description: string;
  videos: VideoFormData[];
  notebooks: NotebookFormData[];
  papers: PaperFormData[];
}

export interface VideoFormData {
  id?: string;
  url: string; // raw URL entered by user
  title: string;
  youtube_id?: string; // set for platform videos that only have youtube_id
}

export type NotebookSource = "colab" | "github";

export interface NotebookFormData {
  id?: string;
  colab_url: string;
  title: string;
  description: string;
  source?: NotebookSource; // 'colab' (default) or 'github' for JupyterLite
  github_path?: string; // set for platform notebooks
  filename?: string;
}

export interface PaperFormData {
  id?: string;
  url: string;
  title: string;
  description: string;
}

/* ───── Resource progress types ───────────────────────── */

export interface VideoProgressRecord {
  id: string;
  subscription_id: string;
  video_id: string;
  max_position_seconds: number;
  percent_watched: number;
  updated_at: string;
}

export interface NotebookProgressRecord {
  id: string;
  subscription_id: string;
  notebook_id: string;
  status: "not_started" | "completed";
  completed_at: string | null;
  updated_at: string;
}

export interface PaperProgressRecord {
  id: string;
  subscription_id: string;
  paper_id: string;
  status: "not_started" | "completed";
  completed_at: string | null;
  updated_at: string;
}

export interface ChapterResourceProgress {
  chapterId: string;
  chapterStatus: "not_started" | "in_progress" | "completed";
  videos: {
    videoId: string;
    maxPositionSeconds: number;
    percentWatched: number;
    durationSeconds: number | null;
  }[];
  notebooks: {
    notebookId: string;
    completed: boolean;
  }[];
  papers: {
    paperId: string;
    completed: boolean;
  }[];
}

export interface CourseWeightedProgress {
  courseId: string;
  totalVideoSeconds: number;
  watchedVideoSeconds: number;
  totalNotebooks: number;
  completedNotebooks: number;
  totalPapers: number;
  completedPapers: number;
  videoPercent: number;
  colabPercent: number;
  paperPercent: number;
  overallPercent: number;
  chapters: ChapterResourceProgress[];
}

/* ───── Access request types ─────────────────────────── */

export type AccessRequestStatus = "pending" | "approved" | "denied";

export interface AccessRequest {
  id: string;
  course_id: string;
  requester_id: string;
  status: AccessRequestStatus;
  message: string;
  created_at: string;
  reviewed_at: string | null;
  reviewer?: Pick<Profile, "name" | "image" | "email">;
}
