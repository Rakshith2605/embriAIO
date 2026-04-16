/* ───── Video platform support ─────────────────────────── */

export type VideoPlatform = "youtube" | "peertube" | "other";

export type CourseStatus = "draft" | "published";

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

/* ───── Aggregate / view types ────────────────────────── */

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  accent_color: AccentColor;
  status: CourseStatus;
  published_at: string | null;
  author: {
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
}

/* ───── Form / input types ────────────────────────────── */

export interface CourseFormData {
  title: string;
  description: string;
  accent_color: AccentColor;
  chapters: ChapterFormData[];
}

export interface ChapterFormData {
  id?: string; // present when editing existing chapter
  title: string;
  description: string;
  videos: VideoFormData[];
  notebooks: NotebookFormData[];
}

export interface VideoFormData {
  id?: string;
  url: string; // raw URL entered by user
  title: string;
}

export interface NotebookFormData {
  id?: string;
  colab_url: string;
  title: string;
  description: string;
}
