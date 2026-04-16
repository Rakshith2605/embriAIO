import { createServiceClient } from "./supabase";
import type {
  Chapter,
  ChapterId,
  Notebook,
  NotebookType,
  BonusFolder,
  ChapterVideo,
  VideoResource,
  VideoSource,
  ContentTag,
  Curriculum,
} from "@/types/curriculum";
import type { CourseDefinition } from "./courses";

// ─── Helpers ────────────────────────────────────────────────

function toChapterId(slug: string): ChapterId {
  return slug as ChapterId;
}

// ─── Fetch all platform courses (for home / sign-in pages) ──

export async function fetchCourses(): Promise<CourseDefinition[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("courses")
    .select("*")
    .eq("course_type", "platform")
    .order("slug");

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.slug,
    title: c.title,
    description: c.description,
    href: c.href ?? "#",
    status:
      c.status === "published"
        ? ("available" as const)
        : ("coming-soon" as const),
    accentColor: `text-${c.accent_color}-400`,
    chapters: c.chapters_count ?? undefined,
    videos: c.videos_count ?? undefined,
    notebooks: c.notebooks_count ?? undefined,
    progressLocalStorageKey: c.progress_storage_key ?? undefined,
    totalNotebooks: c.total_notebooks ?? undefined,
  }));
}

// ─── Fetch full curriculum for a published course ────────────

export async function fetchCurriculum(
  courseSlug = "llms-from-scratch"
): Promise<Curriculum> {
  const sb = createServiceClient();

  // 1. Get the course
  const { data: course, error: courseErr } = await sb
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (courseErr || !course) throw courseErr ?? new Error("Course not found");

  // 2. Get all chapters with their nested data
  const { data: dbChapters, error: chErr } = await sb
    .from("course_chapters")
    .select(
      `
      id, slug, title, description, subtitle, tags, github_path,
      has_code, icon, color, "order",
      chapter_notebooks (
        id, slug, title, description, filename, github_path, notebook_type, estimated_minutes, "order"
      ),
      chapter_videos (
        id, youtube_id, title, duration_seconds, source, label, is_primary, "order"
      ),
      chapter_bonus_folders (
        id, slug, title, github_path, description, gpu_required, "order"
      )
    `
    )
    .eq("course_id", course.id)
    .order("order");

  if (chErr) throw chErr;

  // 3. Get featured videos
  const { data: dbFeatured, error: fvErr } = await sb
    .from("featured_videos")
    .select("*")
    .eq("course_id", course.id)
    .order("order");

  if (fvErr) throw fvErr;

  // 4. Transform into Chapter[] shape
  const allChapters: Chapter[] = (dbChapters ?? []).map((ch) => {
    const notebooks: Notebook[] = (ch.chapter_notebooks ?? [])
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .map(
        (nb: {
          slug: string;
          title: string;
          filename: string;
          github_path: string;
          notebook_type: string;
          description: string;
          estimated_minutes: number | null;
        }) => ({
          slug: nb.slug ?? "",
          title: nb.title,
          filename: nb.filename ?? "",
          githubPath: nb.github_path ?? "",
          type: (nb.notebook_type ?? "main") as NotebookType,
          description: nb.description ?? "",
          estimatedMinutes: nb.estimated_minutes ?? undefined,
        })
      );

    const videos = (ch.chapter_videos ?? []).sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order
    );

    const primaryVideo = videos.find(
      (v: { is_primary: boolean }) => v.is_primary
    );
    const extraVids = videos.filter(
      (v: { is_primary: boolean }) => !v.is_primary
    );

    const video: ChapterVideo | undefined = primaryVideo
      ? {
          youtubeId: primaryVideo.youtube_id ?? "",
          title: primaryVideo.title,
          durationSeconds: primaryVideo.duration_seconds ?? undefined,
          source: (primaryVideo.source ?? "other") as VideoSource,
          label: primaryVideo.label ?? undefined,
        }
      : undefined;

    const extraVideos: ChapterVideo[] = extraVids.map(
      (v: {
        youtube_id: string;
        title: string;
        duration_seconds: number | null;
        source: string;
        label: string;
      }) => ({
        youtubeId: v.youtube_id ?? "",
        title: v.title,
        durationSeconds: v.duration_seconds ?? undefined,
        source: (v.source ?? "other") as VideoSource,
        label: v.label ?? undefined,
      })
    );

    const bonusFolders: BonusFolder[] = (ch.chapter_bonus_folders ?? [])
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .map(
        (bf: {
          slug: string;
          title: string;
          github_path: string;
          description: string;
          gpu_required: boolean;
        }) => ({
          slug: bf.slug,
          title: bf.title,
          githubPath: bf.github_path,
          description: bf.description ?? "",
          gpuRequired: bf.gpu_required ?? false,
          notebooks: [],
        })
      );

    return {
      id: toChapterId(ch.slug ?? ""),
      order: ch.order,
      title: ch.title,
      subtitle: ch.subtitle ?? "",
      description: ch.description ?? "",
      tags: ((ch.tags as string[]) ?? []) as ContentTag[],
      githubPath: ch.github_path ?? "",
      hasCode: ch.has_code ?? true,
      icon: ch.icon ?? "BookOpen",
      color: ch.color ?? "violet",
      mainNotebooks: notebooks,
      bonusFolders,
      video,
      extraVideos: extraVideos.length > 0 ? extraVideos : undefined,
    };
  });

  const chapters = allChapters.filter((c) => c.id.startsWith("ch"));
  const appendices = allChapters.filter((c) => c.id.startsWith("appendix"));

  const featuredVideos: VideoResource[] = (dbFeatured ?? []).map(
    (fv: {
      youtube_id: string;
      title: string;
      description: string;
      duration_seconds: number | null;
      source: string;
      label: string;
    }) => ({
      youtubeId: fv.youtube_id,
      title: fv.title,
      description: fv.description ?? "",
      durationSeconds: fv.duration_seconds ?? undefined,
      source: (fv.source ?? "other") as VideoSource,
      label: fv.label ?? "",
    })
  );

  return {
    version: "2.0.0",
    chapters,
    appendices,
    featuredVideos,
  };
}

// ─── Convenience wrappers matching old API ───────────────────

export async function fetchAllChapters(
  courseSlug = "llms-from-scratch"
): Promise<Chapter[]> {
  const curriculum = await fetchCurriculum(courseSlug);
  return [...curriculum.chapters, ...curriculum.appendices];
}

export async function fetchChapterById(
  chapterId: string,
  courseSlug = "llms-from-scratch"
): Promise<Chapter | null> {
  const all = await fetchAllChapters(courseSlug);
  return all.find((c) => c.id === chapterId) ?? null;
}

export async function fetchNotebookBySlug(
  chapterId: string,
  notebookSlug: string,
  courseSlug = "llms-from-scratch"
): Promise<Notebook | null> {
  const chapter = await fetchChapterById(chapterId, courseSlug);
  if (!chapter) return null;
  return chapter.mainNotebooks.find((n) => n.slug === notebookSlug) ?? null;
}
