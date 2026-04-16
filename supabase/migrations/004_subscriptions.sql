-- ============================================================
-- embriAIO — Course Subscriptions & Subscriber Progress
-- ============================================================

-- 1. Course Subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscribed_at timestamptz DEFAULT now(),
  UNIQUE(course_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS idx_subs_course ON public.course_subscriptions(course_id);
CREATE INDEX IF NOT EXISTS idx_subs_subscriber ON public.course_subscriptions(subscriber_id);

-- 2. Subscriber Progress (per chapter per subscriber)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriber_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.course_subscriptions(id) ON DELETE CASCADE,
  chapter_id      uuid NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at      timestamptz,
  completed_at    timestamptz,
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(subscription_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_progress_sub ON public.subscriber_progress(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_progress_chapter ON public.subscriber_progress(chapter_id);

-- 3. RLS Policies
-- ============================================================

ALTER TABLE public.course_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_progress ENABLE ROW LEVEL SECURITY;

-- Subscriptions: users can see their own, course owners can see subscribers
CREATE POLICY "subs_select_own" ON public.course_subscriptions
  FOR SELECT USING (
    subscriber_id IN (
      SELECT id FROM public.profiles
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "subs_select_owner" ON public.course_subscriptions
  FOR SELECT USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.profiles p ON c.author_id = p.id
      WHERE p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "subs_insert" ON public.course_subscriptions
  FOR INSERT WITH CHECK (
    subscriber_id IN (
      SELECT id FROM public.profiles
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "subs_delete" ON public.course_subscriptions
  FOR DELETE USING (
    subscriber_id IN (
      SELECT id FROM public.profiles
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Subscriber progress: subscribers can manage own, course owners can view
CREATE POLICY "sub_progress_select_own" ON public.subscriber_progress
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

CREATE POLICY "sub_progress_select_owner" ON public.subscriber_progress
  FOR SELECT USING (
    subscription_id IN (
      SELECT cs.id FROM public.course_subscriptions cs
      JOIN public.courses c ON cs.course_id = c.id
      JOIN public.profiles p ON c.author_id = p.id
      WHERE p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "sub_progress_manage" ON public.subscriber_progress
  FOR ALL USING (
    subscription_id IN (
      SELECT id FROM public.course_subscriptions
      WHERE subscriber_id IN (
        SELECT id FROM public.profiles
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- 4. Auto-update updated_at on subscriber_progress
-- ============================================================
CREATE TRIGGER subscriber_progress_updated_at
  BEFORE UPDATE ON public.subscriber_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
