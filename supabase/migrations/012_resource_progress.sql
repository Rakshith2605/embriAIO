-- ============================================================
-- embriAIO — Resource-Level Progress Tracking
-- Per-video watch progress, per-notebook completion, per-paper read status
-- Also adds total_video_seconds to courses for weighted progress
-- ============================================================

-- 1. Add total_video_seconds column to courses
-- ============================================================
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS total_video_seconds bigint NOT NULL DEFAULT 0;

-- 2. Per-video watch progress (max position reached model)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriber_video_progress (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id       uuid NOT NULL REFERENCES public.course_subscriptions(id) ON DELETE CASCADE,
  video_id              uuid NOT NULL REFERENCES public.chapter_videos(id) ON DELETE CASCADE,
  max_position_seconds  int NOT NULL DEFAULT 0,
  percent_watched       int NOT NULL DEFAULT 0 CHECK (percent_watched >= 0 AND percent_watched <= 100),
  updated_at            timestamptz DEFAULT now(),
  UNIQUE(subscription_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_vid_progress_sub ON public.subscriber_video_progress(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_vid_progress_video ON public.subscriber_video_progress(video_id);

-- 3. Per-notebook completion (Mark Complete)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriber_notebook_progress (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id   uuid NOT NULL REFERENCES public.course_subscriptions(id) ON DELETE CASCADE,
  notebook_id       uuid NOT NULL REFERENCES public.chapter_notebooks(id) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'completed')),
  completed_at      timestamptz,
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(subscription_id, notebook_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_nb_progress_sub ON public.subscriber_notebook_progress(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_nb_progress_notebook ON public.subscriber_notebook_progress(notebook_id);

-- 4. Per-paper read status (Mark as Read)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriber_paper_progress (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id   uuid NOT NULL REFERENCES public.course_subscriptions(id) ON DELETE CASCADE,
  paper_id          uuid NOT NULL REFERENCES public.chapter_papers(id) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'completed')),
  completed_at      timestamptz,
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(subscription_id, paper_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_paper_progress_sub ON public.subscriber_paper_progress(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_paper_progress_paper ON public.subscriber_paper_progress(paper_id);

-- 5. RLS Policies
-- ============================================================

ALTER TABLE public.subscriber_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_notebook_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_paper_progress ENABLE ROW LEVEL SECURITY;

-- Video progress: subscribers manage own, course owners can view
CREATE POLICY "sub_vid_progress_select_own" ON public.subscriber_video_progress
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

CREATE POLICY "sub_vid_progress_select_owner" ON public.subscriber_video_progress
  FOR SELECT USING (
    video_id IN (
      SELECT cv.id FROM public.chapter_videos cv
      JOIN public.course_chapters cc ON cv.chapter_id = cc.id
      JOIN public.courses c ON cc.course_id = c.id
      JOIN public.profiles p ON c.author_id = p.id
      WHERE p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "sub_vid_progress_manage" ON public.subscriber_video_progress
  FOR ALL USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- Notebook progress: subscribers manage own, course owners can view
CREATE POLICY "sub_nb_progress_select_own" ON public.subscriber_notebook_progress
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

CREATE POLICY "sub_nb_progress_select_owner" ON public.subscriber_notebook_progress
  FOR SELECT USING (
    notebook_id IN (
      SELECT cn.id FROM public.chapter_notebooks cn
      JOIN public.course_chapters cc ON cn.chapter_id = cc.id
      JOIN public.courses c ON cc.course_id = c.id
      JOIN public.profiles p ON c.author_id = p.id
      WHERE p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "sub_nb_progress_manage" ON public.subscriber_notebook_progress
  FOR ALL USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- Paper progress: subscribers manage own, course owners can view
CREATE POLICY "sub_paper_progress_select_own" ON public.subscriber_paper_progress
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

CREATE POLICY "sub_paper_progress_select_owner" ON public.subscriber_paper_progress
  FOR SELECT USING (
    paper_id IN (
      SELECT cp.id FROM public.chapter_papers cp
      JOIN public.course_chapters cc ON cp.chapter_id = cc.id
      JOIN public.courses c ON cc.course_id = c.id
      JOIN public.profiles p ON c.author_id = p.id
      WHERE p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "sub_paper_progress_manage" ON public.subscriber_paper_progress
  FOR ALL USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- 6. Auto-update triggers
-- ============================================================
CREATE TRIGGER subscriber_video_progress_updated_at
  BEFORE UPDATE ON public.subscriber_video_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subscriber_notebook_progress_updated_at
  BEFORE UPDATE ON public.subscriber_notebook_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subscriber_paper_progress_updated_at
  BEFORE UPDATE ON public.subscriber_paper_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 7. Function to recalculate total_video_seconds for a course
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_course_video_seconds(p_course_id uuid)
RETURNS void AS $$
DECLARE
  v_total bigint;
BEGIN
  SELECT COALESCE(SUM(cv.duration_seconds), 0)
  INTO v_total
  FROM public.chapter_videos cv
  JOIN public.course_chapters cc ON cv.chapter_id = cc.id
  WHERE cc.course_id = p_course_id
    AND cv.duration_seconds IS NOT NULL;

  UPDATE public.courses
  SET total_video_seconds = v_total
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger to auto-recalculate total_video_seconds on video changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_recalc_video_seconds()
RETURNS trigger AS $$
DECLARE
  v_course_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT cc.course_id INTO v_course_id
    FROM public.course_chapters cc
    WHERE cc.id = OLD.chapter_id;
    PERFORM public.recalculate_course_video_seconds(v_course_id);
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT cc.course_id INTO v_course_id
    FROM public.course_chapters cc
    WHERE cc.id = NEW.chapter_id;
    PERFORM public.recalculate_course_video_seconds(v_course_id);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF COALESCE(OLD.duration_seconds, 0) <> COALESCE(NEW.duration_seconds, 0) THEN
      SELECT cc.course_id INTO v_course_id
      FROM public.course_chapters cc
      WHERE cc.id = NEW.chapter_id;
      PERFORM public.recalculate_course_video_seconds(v_course_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_video_seconds_recalc
  AFTER INSERT OR UPDATE OF duration_seconds OR DELETE
  ON public.chapter_videos
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recalc_video_seconds();

-- 9. Backfill total_video_seconds for existing courses
-- ============================================================
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.courses LOOP
    PERFORM public.recalculate_course_video_seconds(rec.id);
  END LOOP;
END;
$$;