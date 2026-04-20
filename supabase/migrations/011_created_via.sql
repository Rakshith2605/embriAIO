-- Track how a course was created (manual via UI, or claude via MCP)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS created_via text NOT NULL DEFAULT 'manual'
    CHECK (created_via IN ('manual', 'claude'));
