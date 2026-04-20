import { createServiceClient } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export const TOOL_DEFINITIONS = [
  {
    name: "create_course",
    description:
      "Create a new course on the emrAIo platform with chapters. The course is created as a draft for the user to review and publish.",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Course title" },
        topic: { type: "string", description: "Course topic (alias for title)" },
        description: { type: "string", description: "Course description" },
        accent_color: {
          type: "string",
          enum: [
            "violet",
            "blue",
            "orange",
            "emerald",
            "cyan",
            "pink",
            "yellow",
            "red",
            "indigo",
            "teal",
          ],
          description: "Accent color (default: violet)",
        },
        chapters: {
          type: "array",
          description: "Chapter titles to create",
          items: { type: "string" },
        },
      },
      required: ["title"],
    },
  },
  {
    name: "list_courses",
    description: "List your courses on emrAIo with chapter/resource counts",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "published"],
          description: "Filter by status",
        },
      },
    },
  },
  {
    name: "get_course",
    description:
      "Get full course details including chapters, videos, notebooks, and papers",
    inputSchema: {
      type: "object" as const,
      properties: {
        course_id: { type: "string", description: "Course UUID" },
      },
      required: ["course_id"],
    },
  },
  {
    name: "add_resource",
    description:
      "Add a resource (video, paper, or notebook link) to a chapter",
    inputSchema: {
      type: "object" as const,
      properties: {
        chapter_id: { type: "string", description: "Chapter UUID" },
        type: {
          type: "string",
          enum: ["video", "paper", "notebook"],
          description: "Resource type",
        },
        title: { type: "string", description: "Resource title" },
        url: { type: "string", description: "Resource URL" },
        description: {
          type: "string",
          description: "Resource description (for papers and notebooks)",
        },
      },
      required: ["chapter_id", "type", "title", "url"],
    },
  },
  {
    name: "publish_course",
    description:
      "Publish a draft course so it becomes visible on the platform. Requires at least 1 chapter with content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        course_id: { type: "string", description: "Course UUID" },
      },
      required: ["course_id"],
    },
  },
  {
    name: "search_youtube",
    description: "Search YouTube for educational videos",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        max_results: {
          type: "number",
          description: "Max results (default: 5, max: 25)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "suggest_papers",
    description: "Search for academic papers via Semantic Scholar",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        max_results: {
          type: "number",
          description: "Max results (default: 5, max: 20)",
        },
      },
      required: ["query"],
    },
  },
];

export async function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  switch (toolName) {
    case "create_course":
      return createCourse(args, userId);
    case "list_courses":
      return listCourses(args, userId);
    case "get_course":
      return getCourse(args, userId);
    case "add_resource":
      return addResource(args, userId);
    case "publish_course":
      return publishCourse(args, userId);
    case "search_youtube":
      return searchYoutube(args);
    case "suggest_papers":
      return suggestPapers(args);
    default:
      return err(`Unknown tool: ${toolName}`);
  }
}

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function err(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

// ──── create_course ────────────────────────────────────────

async function createCourse(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  // Accept "topic" as alias for "title" (backward compat with older schemas)
  const title = (args.title as string) || (args.topic as string);
  if (!title) return err("title is required");

  const description = (args.description as string) ?? "";
  const accentColor = (args.accent_color as string) ?? "violet";
  const chapterTitles = (args.chapters as string[]) ?? [];

  const supabase = createServiceClient();

  // Generate unique slug
  let slug = slugify(title);
  const { data: existing } = await supabase
    .from("courses")
    .select("slug")
    .like("slug", `${slug}%`);

  if (existing && existing.length > 0) {
    slug = `${slug}-${existing.length + 1}`;
  }

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .insert({
      author_id: userId,
      slug,
      title: title.trim(),
      description: description.trim(),
      accent_color: accentColor,
      status: "draft",
      created_via: "claude",
    })
    .select()
    .single();

  if (courseErr || !course)
    return err(`Failed to create course: ${courseErr?.message}`);

  // Create chapters if provided
  let chapters: unknown[] = [];
  if (chapterTitles.length > 0) {
    const rows = chapterTitles.map((t, i) => ({
      course_id: course.id,
      title: typeof t === "string" ? t.trim() : `Chapter ${i + 1}`,
      description: "",
      order: i,
      slug: slugify(typeof t === "string" ? t : `chapter-${i + 1}`),
    }));

    const { data: created, error: chErr } = await supabase
      .from("course_chapters")
      .insert(rows)
      .select();

    if (chErr)
      return err(`Course created but chapters failed: ${chErr.message}`);
    chapters = created ?? [];
  }

  return ok({
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      status: "draft (pending review)",
      created_via: "claude",
      review_url: `https://www.emraio.com/my-courses/${course.id}/review`,
    },
    chapters,
    message:
      "Course created as draft. The user should review it at the review URL before publishing.",
  });
}

// ──── list_courses ─────────────────────────────────────────

async function listCourses(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  const supabase = createServiceClient();

  let query = supabase
    .from("courses")
    .select(
      `id, slug, title, description, accent_color, status, created_at, published_at,
       course_chapters(id, title, chapter_videos(id), chapter_notebooks(id), chapter_papers(id))`
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (args.status) query = query.eq("status", args.status as string);

  const { data: courses, error } = await query;
  if (error) return err(`Failed to list courses: ${error.message}`);

  const result = (courses ?? []).map((c) => {
    const chapters = (c.course_chapters ?? []) as Array<{
      id: string;
      title: string;
      chapter_videos: { id: string }[];
      chapter_notebooks: { id: string }[];
      chapter_papers: { id: string }[];
    }>;

    let videos = 0,
      notebooks = 0,
      papers = 0;
    for (const ch of chapters) {
      videos += (ch.chapter_videos ?? []).length;
      notebooks += (ch.chapter_notebooks ?? []).length;
      papers += (ch.chapter_papers ?? []).length;
    }

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      status: c.status,
      chapters: chapters.length,
      videos,
      notebooks,
      papers,
      url: `https://www.emraio.com/course/${c.slug}`,
      created_at: c.created_at,
    };
  });

  return ok(result);
}

// ──── get_course ───────────────────────────────────────────

async function getCourse(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  const courseId = args.course_id as string;
  if (!courseId) return err("course_id is required");

  const supabase = createServiceClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `*, course_chapters(*, chapter_videos(*), chapter_notebooks(*), chapter_papers(*))`
    )
    .eq("id", courseId)
    .eq("author_id", userId)
    .single();

  if (error || !course) return err("Course not found or access denied");

  // Sort chapters and their resources by order
  const chapters = (
    (course.course_chapters ?? []) as Array<Record<string, unknown>>
  )
    .sort((a, b) => (a.order as number) - (b.order as number))
    .map((ch) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      videos: (
        (ch.chapter_videos as Array<Record<string, unknown>>) ?? []
      ).sort((a, b) => (a.order as number) - (b.order as number)),
      notebooks: (
        (ch.chapter_notebooks as Array<Record<string, unknown>>) ?? []
      ).sort((a, b) => (a.order as number) - (b.order as number)),
      papers: (
        (ch.chapter_papers as Array<Record<string, unknown>>) ?? []
      ).sort((a, b) => (a.order as number) - (b.order as number)),
    }));

  return ok({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    status: course.status,
    url: `https://www.emraio.com/course/${course.slug}`,
    chapters,
  });
}

// ──── add_resource ─────────────────────────────────────────

async function addResource(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  const chapterId = args.chapter_id as string;
  if (!chapterId) return err("chapter_id is required");

  const type = args.type as string;
  if (!type) return err("type is required (video, paper, or notebook)");

  const title = args.title as string;
  const url = args.url as string;
  if (!title || !url) return err("title and url are required");

  const supabase = createServiceClient();

  // Verify ownership: chapter -> course -> author_id
  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id, courses!inner(author_id)")
    .eq("id", chapterId)
    .single();

  if (!chapter) return err("Chapter not found");

  const owner = (chapter as unknown as { courses: { author_id: string } })
    .courses.author_id;
  if (owner !== userId)
    return err("Access denied: chapter belongs to another user");

  if (type === "video") {
    // Extract youtube_id from URL if possible
    let youtubeId: string | null = null;
    try {
      const parsed = new URL(url);
      if (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtu.be")
      ) {
        youtubeId =
          parsed.searchParams.get("v") ||
          parsed.pathname.split("/").pop() ||
          null;
      }
    } catch {
      /* not a valid URL, store as-is */
    }

    const { count } = await supabase
      .from("chapter_videos")
      .select("id", { count: "exact", head: true })
      .eq("chapter_id", chapterId);

    const { data, error } = await supabase
      .from("chapter_videos")
      .insert({
        chapter_id: chapterId,
        title: title.trim(),
        video_url: url.trim(),
        embed_url: youtubeId
          ? `https://www.youtube.com/embed/${youtubeId}`
          : url.trim(),
        youtube_id: youtubeId,
        platform: youtubeId ? "youtube" : "other",
        order: count ?? 0,
        is_primary: (count ?? 0) === 0,
      })
      .select()
      .single();

    if (error) return err(`Failed to add video: ${error.message}`);
    return ok(data);
  }

  if (type === "notebook") {
    const { count } = await supabase
      .from("chapter_notebooks")
      .select("id", { count: "exact", head: true })
      .eq("chapter_id", chapterId);

    const { data, error } = await supabase
      .from("chapter_notebooks")
      .insert({
        chapter_id: chapterId,
        title: title.trim(),
        colab_url: url.trim(),
        description: ((args.description as string) ?? "").trim(),
        order: count ?? 0,
      })
      .select()
      .single();

    if (error) return err(`Failed to add notebook: ${error.message}`);
    return ok(data);
  }

  if (type === "paper") {
    const { count } = await supabase
      .from("chapter_papers")
      .select("id", { count: "exact", head: true })
      .eq("chapter_id", chapterId);

    const { data, error } = await supabase
      .from("chapter_papers")
      .insert({
        chapter_id: chapterId,
        title: title.trim(),
        url: url.trim(),
        description: ((args.description as string) ?? "").trim(),
        order: count ?? 0,
      })
      .select()
      .single();

    if (error) return err(`Failed to add paper: ${error.message}`);
    return ok(data);
  }

  return err(`Unknown resource type: ${type}. Use video, paper, or notebook.`);
}

// ──── publish_course ───────────────────────────────────────

async function publishCourse(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  const courseId = args.course_id as string;
  if (!courseId) return err("course_id is required");

  const supabase = createServiceClient();

  // Verify ownership
  const { data: course } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .eq("author_id", userId)
    .single();

  if (!course) return err("Course not found or access denied");

  // Check it has at least 1 chapter with content
  const { data: chapters } = await supabase
    .from("course_chapters")
    .select("id, chapter_videos(id), chapter_notebooks(id), chapter_papers(id)")
    .eq("course_id", courseId);

  if (!chapters || chapters.length === 0)
    return err("Course must have at least one chapter to publish");

  const hasContent = chapters.some((ch: Record<string, unknown>) => {
    const vids = (ch.chapter_videos as unknown[]) ?? [];
    const nbs = (ch.chapter_notebooks as unknown[]) ?? [];
    const pps = (ch.chapter_papers as unknown[]) ?? [];
    return vids.length > 0 || nbs.length > 0 || pps.length > 0;
  });

  if (!hasContent)
    return err("At least one chapter must have a video, notebook, or paper");

  const { data, error } = await supabase
    .from("courses")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", courseId)
    .select()
    .single();

  if (error) return err(`Failed to publish: ${error.message}`);

  return ok({
    id: data.id,
    status: "published",
    url: `https://www.emraio.com/course/${data.slug}`,
  });
}

// ──── search_youtube ───────────────────────────────────────

async function searchYoutube(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return ok(
      "YouTube search is not configured. Set YOUTUBE_API_KEY environment variable to enable this feature."
    );
  }

  const query = args.query as string;
  if (!query) return err("query is required");

  const maxResults = Math.min(Math.max(Number(args.max_results) || 5, 1), 25);

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok)
    return err(`YouTube API error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  const results = (data.items ?? []).map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        thumbnails: {
          medium?: { url: string };
          default?: { url: string };
        };
        channelTitle: string;
      };
    }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    })
  );

  return ok(results);
}

// ──── suggest_papers ───────────────────────────────────────

async function suggestPapers(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const query = args.query as string;
  if (!query) return err("query is required");

  const maxResults = Math.min(Math.max(Number(args.max_results) || 5, 1), 20);

  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", String(maxResults));
  url.searchParams.set(
    "fields",
    "title,url,abstract,year,authors,citationCount"
  );

  const res = await fetch(url.toString());
  if (!res.ok)
    return err(`Semantic Scholar API error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  const results = (data.data ?? []).map(
    (paper: {
      paperId: string;
      title: string;
      abstract: string;
      url: string;
      year: number;
      authors: Array<{ name: string }>;
      citationCount: number;
    }) => ({
      paperId: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      url: paper.url,
      year: paper.year,
      authors: (paper.authors ?? []).map((a) => a.name),
      citationCount: paper.citationCount,
    })
  );

  return ok(results);
}
