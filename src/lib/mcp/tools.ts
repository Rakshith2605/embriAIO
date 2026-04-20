import { createServiceClient } from "@/lib/supabase";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export const TOOL_DEFINITIONS = [
  {
    name: "create_course",
    description: "Create a new learning course with auto-generated modules",
    inputSchema: {
      type: "object" as const,
      properties: {
        topic: { type: "string", description: "Course topic" },
        difficulty: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced"],
          description: "Difficulty level (default: beginner)",
        },
        num_modules: {
          type: "number",
          description: "Number of modules to create (default: 5)",
        },
        description: { type: "string", description: "Course description" },
      },
      required: ["topic"],
    },
  },
  {
    name: "list_courses",
    description:
      "List your courses with optional status filter and progress summary",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "active", "completed", "archived"],
          description: "Filter by status",
        },
      },
    },
  },
  {
    name: "get_course",
    description:
      "Get full course details including modules, resources, and progress",
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
      "Add a learning resource (video, paper, notebook, etc.) to a module",
    inputSchema: {
      type: "object" as const,
      properties: {
        module_id: { type: "string", description: "Module UUID" },
        type: {
          type: "string",
          enum: ["youtube", "paper", "colab", "github", "article", "other"],
          description: "Resource type",
        },
        title: { type: "string", description: "Resource title" },
        url: { type: "string", description: "Resource URL" },
        description: { type: "string", description: "Resource description" },
      },
      required: ["module_id", "type", "title", "url"],
    },
  },
  {
    name: "update_progress",
    description: "Update your progress on a learning resource",
    inputSchema: {
      type: "object" as const,
      properties: {
        resource_id: { type: "string", description: "Resource UUID" },
        completed: {
          type: "boolean",
          description: "Whether the resource is completed",
        },
        notes: { type: "string", description: "Notes about the resource" },
      },
      required: ["resource_id"],
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
    case "update_progress":
      return updateProgress(args, userId);
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
  const topic = args.topic as string;
  if (!topic) return err("topic is required");

  const difficulty = (args.difficulty as string) ?? "beginner";
  const numModules = Math.min(Math.max(Number(args.num_modules) || 5, 1), 20);
  const description = (args.description as string) ?? "";

  const supabase = createServiceClient();

  const { data: course, error: courseErr } = await supabase
    .from("mcp_courses")
    .insert({
      user_id: userId,
      title: topic,
      description,
      topic,
      difficulty,
      status: "draft",
    })
    .select()
    .single();

  if (courseErr || !course)
    return err(`Failed to create course: ${courseErr?.message}`);

  const modules = Array.from({ length: numModules }, (_, i) => ({
    course_id: course.id,
    title: `Module ${i + 1}`,
    sort_order: i,
    status: "not_started",
  }));

  const { data: createdModules, error: modErr } = await supabase
    .from("mcp_course_modules")
    .insert(modules)
    .select();

  if (modErr)
    return err(`Course created but modules failed: ${modErr.message}`);

  return ok({ course, modules: createdModules });
}

// ──── list_courses ─────────────────────────────────────────

async function listCourses(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  const supabase = createServiceClient();

  let query = supabase
    .from("mcp_courses")
    .select(
      `*, mcp_course_modules(id, mcp_course_resources(id, mcp_user_progress(completed, user_id)))`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (args.status) query = query.eq("status", args.status as string);

  const { data: courses, error } = await query;
  if (error) return err(`Failed to list courses: ${error.message}`);

  const result = (courses ?? []).map((c) => {
    let totalResources = 0;
    let completedResources = 0;

    for (const m of (c.mcp_course_modules ?? []) as Array<{
      id: string;
      mcp_course_resources: Array<{
        id: string;
        mcp_user_progress: Array<{ completed: boolean; user_id: string }>;
      }>;
    }>) {
      for (const r of m.mcp_course_resources ?? []) {
        totalResources++;
        if (
          (r.mcp_user_progress ?? []).some(
            (p) => p.completed && p.user_id === userId
          )
        ) {
          completedResources++;
        }
      }
    }

    return {
      id: c.id,
      title: c.title,
      topic: c.topic,
      difficulty: c.difficulty,
      status: c.status,
      created_at: c.created_at,
      progress: `${completedResources}/${totalResources}`,
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
    .from("mcp_courses")
    .select(
      `*, mcp_course_modules(*, mcp_course_resources(*, mcp_user_progress(*)))`
    )
    .eq("id", courseId)
    .eq("user_id", userId)
    .single();

  if (error || !course) return err("Course not found or access denied");

  const modules = (
    (course.mcp_course_modules ?? []) as Array<Record<string, unknown>>
  )
    .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
    .map((m) => ({
      ...m,
      mcp_course_resources: (
        (m.mcp_course_resources as Array<Record<string, unknown>>) ?? []
      ).sort((a, b) => (a.sort_order as number) - (b.sort_order as number)),
    }));

  return ok({ ...course, mcp_course_modules: modules });
}

// ──── add_resource ─────────────────────────────────────────

async function addResource(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  const moduleId = args.module_id as string;
  if (!moduleId) return err("module_id is required");

  const supabase = createServiceClient();

  // Verify ownership through module -> course -> user_id
  const { data: mod } = await supabase
    .from("mcp_course_modules")
    .select("id, mcp_courses!inner(user_id)")
    .eq("id", moduleId)
    .single();

  if (!mod) return err("Module not found");

  const owner = (mod as unknown as { mcp_courses: { user_id: string } })
    .mcp_courses.user_id;
  if (owner !== userId)
    return err("Access denied: module belongs to another user");

  const { count } = await supabase
    .from("mcp_course_resources")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  const { data: resource, error } = await supabase
    .from("mcp_course_resources")
    .insert({
      module_id: moduleId,
      type: (args.type as string) ?? "other",
      title: args.title as string,
      url: args.url as string,
      description: (args.description as string) ?? "",
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (error || !resource)
    return err(`Failed to add resource: ${error?.message}`);
  return ok(resource);
}

// ──── update_progress ──────────────────────────────────────

async function updateProgress(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  const resourceId = args.resource_id as string;
  if (!resourceId) return err("resource_id is required");

  const supabase = createServiceClient();

  // Verify ownership through resource -> module -> course -> user_id
  const { data: resource } = await supabase
    .from("mcp_course_resources")
    .select("id, mcp_course_modules!inner(mcp_courses!inner(user_id))")
    .eq("id", resourceId)
    .single();

  if (!resource) return err("Resource not found");

  const owner = (
    resource as unknown as {
      mcp_course_modules: { mcp_courses: { user_id: string } };
    }
  ).mcp_course_modules.mcp_courses.user_id;
  if (owner !== userId) return err("Access denied");

  const upsertData: Record<string, unknown> = {
    user_id: userId,
    resource_id: resourceId,
  };

  if (args.completed !== undefined) {
    upsertData.completed = args.completed;
    upsertData.completed_at = args.completed
      ? new Date().toISOString()
      : null;
  }
  if (args.notes !== undefined) upsertData.notes = args.notes;

  const { data, error } = await supabase
    .from("mcp_user_progress")
    .upsert(upsertData, { onConflict: "user_id,resource_id" })
    .select()
    .single();

  if (error) return err(`Failed to update progress: ${error.message}`);
  return ok(data);
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
