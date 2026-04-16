-- ============================================================
-- embriAIO — Category & Ratings
-- ============================================================

-- 1. Add category to courses
-- ============================================================
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- Update platform courses with their categories
UPDATE public.courses SET category = 'nlp' WHERE slug = 'llms-from-scratch';
UPDATE public.courses SET category = 'optimization' WHERE slug = 'quantization';
UPDATE public.courses SET category = 'nlp' WHERE slug = 'finetuning';
UPDATE public.courses SET category = 'nlp' WHERE slug = 'rag-vectors';
UPDATE public.courses SET category = 'computer-vision' WHERE slug = 'diffusion';
UPDATE public.courses SET category = 'computer-vision' WHERE slug = 'multimodal';

-- 2. Course Ratings table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating     integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_course ON public.course_ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON public.course_ratings(user_id);

-- RLS
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_select" ON public.course_ratings
  FOR SELECT USING (true);

CREATE POLICY "ratings_insert" ON public.course_ratings
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.profiles
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "ratings_update" ON public.course_ratings
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM public.profiles
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "ratings_delete" ON public.course_ratings
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM public.profiles
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
