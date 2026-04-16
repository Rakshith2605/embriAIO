-- ============================================================
-- embriAIO — Platform Courses Schema Extension
-- Extends the base schema to support the full curriculum
-- (notebooks with github paths, bonus folders, chapter videos, etc.)
-- ============================================================

-- 1. Extend courses table with platform-specific columns
-- ============================================================
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'community' CHECK (course_type IN ('platform', 'community')),
  ADD COLUMN IF NOT EXISTS href text,
  ADD COLUMN IF NOT EXISTS chapters_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS videos_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notebooks_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progress_storage_key text,
  ADD COLUMN IF NOT EXISTS total_notebooks integer DEFAULT 0;

-- 2. Extend course_chapters with curriculum fields
-- ============================================================
ALTER TABLE public.course_chapters
  ADD COLUMN IF NOT EXISTS subtitle text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS github_path text DEFAULT '',
  ADD COLUMN IF NOT EXISTS has_code boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS icon text DEFAULT 'BookOpen',
  ADD COLUMN IF NOT EXISTS color text DEFAULT 'violet';

-- 3. Chapter Videos — extend with source/label
-- ============================================================
ALTER TABLE public.chapter_videos
  ADD COLUMN IF NOT EXISTS youtube_id text,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS label text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- 4. Chapter Notebooks — extend with curriculum fields
-- ============================================================
ALTER TABLE public.chapter_notebooks
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS filename text DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_path text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notebook_type text DEFAULT 'main' CHECK (notebook_type IN ('main', 'exercise', 'bonus', 'supplemental')),
  ADD COLUMN IF NOT EXISTS estimated_minutes integer;

-- 5. Bonus Folders table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chapter_bonus_folders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id  uuid NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  slug        text NOT NULL,
  title       text NOT NULL,
  github_path text NOT NULL,
  description text DEFAULT '',
  gpu_required boolean DEFAULT false,
  "order"     integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bonus_folders_chapter ON public.chapter_bonus_folders(chapter_id);

-- RLS for bonus folders
ALTER TABLE public.chapter_bonus_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bonus_folders_select" ON public.chapter_bonus_folders
  FOR SELECT USING (
    chapter_id IN (SELECT id FROM public.course_chapters)
  );

CREATE POLICY "bonus_folders_modify" ON public.chapter_bonus_folders
  FOR ALL USING (
    chapter_id IN (
      SELECT ch.id FROM public.course_chapters ch
      JOIN public.courses c ON ch.course_id = c.id
      JOIN public.profiles p ON c.author_id = p.id
      WHERE p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- 6. Featured Videos table (top-level, not per-chapter)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.featured_videos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  youtube_id       text NOT NULL,
  title            text NOT NULL,
  description      text DEFAULT '',
  duration_seconds integer,
  source           text DEFAULT 'other',
  label            text DEFAULT '',
  "order"          integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_featured_videos_course ON public.featured_videos(course_id);

ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "featured_videos_select" ON public.featured_videos
  FOR SELECT USING (true);

CREATE POLICY "featured_videos_modify" ON public.featured_videos
  FOR ALL USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.profiles p ON c.author_id = p.id
      WHERE p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- 7. Index on courses by type
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_courses_type ON public.courses(course_type);
