-- ============================================================
-- MCP Learning Courses (separate from platform courses)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mcp_courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  topic       text NOT NULL DEFAULT '',
  difficulty  text NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status      text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcp_courses_user   ON public.mcp_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_courses_status ON public.mcp_courses(status);

CREATE TRIGGER mcp_courses_updated_at
  BEFORE UPDATE ON public.mcp_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Modules
CREATE TABLE IF NOT EXISTS public.mcp_course_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.mcp_courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order  integer NOT NULL DEFAULT 0,
  status      text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcp_modules_course ON public.mcp_course_modules(course_id);

-- Resources
CREATE TABLE IF NOT EXISTS public.mcp_course_resources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   uuid NOT NULL REFERENCES public.mcp_course_modules(id) ON DELETE CASCADE,
  type        text NOT NULL DEFAULT 'other'
    CHECK (type IN ('youtube', 'paper', 'colab', 'github', 'article', 'other')),
  title       text NOT NULL,
  url         text NOT NULL,
  description text NOT NULL DEFAULT '',
  metadata    jsonb DEFAULT '{}',
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcp_resources_module ON public.mcp_course_resources(module_id);

-- User Progress
CREATE TABLE IF NOT EXISTS public.mcp_user_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id  uuid NOT NULL REFERENCES public.mcp_course_resources(id) ON DELETE CASCADE,
  completed    boolean NOT NULL DEFAULT false,
  notes        text NOT NULL DEFAULT '',
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_mcp_progress_user     ON public.mcp_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_progress_resource ON public.mcp_user_progress(resource_id);
