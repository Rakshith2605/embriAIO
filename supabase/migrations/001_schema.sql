-- ============================================================
-- embriAIO — User-Created Courses Schema
-- Run these migrations in order in your Supabase SQL editor
-- ============================================================

-- 1. Profiles (synced from NextAuth on sign-in)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  image       text,
  created_at  timestamptz default now()
);

-- 2. Courses
-- ============================================================
create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  slug          text unique not null,
  title         text not null,
  description   text not null default '',
  accent_color  text not null default 'violet',
  status        text not null default 'draft' check (status in ('draft', 'published')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  published_at  timestamptz
);

create index if not exists idx_courses_author on public.courses(author_id);
create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_slug   on public.courses(slug);

-- 3. Course Chapters
-- ============================================================
create table if not exists public.course_chapters (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  "order"     integer not null default 0,
  title       text not null,
  description text not null default ''
);

create index if not exists idx_chapters_course on public.course_chapters(course_id);

-- 4. Chapter Videos
-- ============================================================
create table if not exists public.chapter_videos (
  id               uuid primary key default gen_random_uuid(),
  chapter_id       uuid not null references public.course_chapters(id) on delete cascade,
  platform         text not null default 'youtube' check (platform in ('youtube', 'peertube', 'other')),
  video_url        text not null,
  embed_url        text not null,
  title            text not null,
  duration_seconds integer,
  "order"          integer not null default 0
);

create index if not exists idx_videos_chapter on public.chapter_videos(chapter_id);

-- 5. Chapter Notebooks (Colab links)
-- ============================================================
create table if not exists public.chapter_notebooks (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references public.course_chapters(id) on delete cascade,
  colab_url   text not null,
  title       text not null,
  description text not null default '',
  "order"     integer not null default 0
);

create index if not exists idx_notebooks_chapter on public.chapter_notebooks(chapter_id);

-- 6. Auto-update updated_at on courses
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_chapters enable row level security;
alter table public.chapter_videos enable row level security;
alter table public.chapter_notebooks enable row level security;

-- Profiles: anyone authenticated can read; users update own
create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (true);

create policy "profiles_update" on public.profiles
  for update using (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Courses: anyone can read published; authors CRUD own
create policy "courses_select_published" on public.courses
  for select using (status = 'published');

create policy "courses_select_own" on public.courses
  for select using (
    author_id in (
      select id from public.profiles
      where email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

create policy "courses_insert" on public.courses
  for insert with check (
    author_id in (
      select id from public.profiles
      where email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

create policy "courses_update" on public.courses
  for update using (
    author_id in (
      select id from public.profiles
      where email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

create policy "courses_delete" on public.courses
  for delete using (
    author_id in (
      select id from public.profiles
      where email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Chapters: inherit from course access
create policy "chapters_select" on public.course_chapters
  for select using (
    course_id in (select id from public.courses)
  );

create policy "chapters_modify" on public.course_chapters
  for all using (
    course_id in (
      select c.id from public.courses c
      join public.profiles p on c.author_id = p.id
      where p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Videos: inherit from chapter → course
create policy "videos_select" on public.chapter_videos
  for select using (
    chapter_id in (select id from public.course_chapters)
  );

create policy "videos_modify" on public.chapter_videos
  for all using (
    chapter_id in (
      select ch.id from public.course_chapters ch
      join public.courses c on ch.course_id = c.id
      join public.profiles p on c.author_id = p.id
      where p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Notebooks: inherit from chapter → course
create policy "notebooks_select" on public.chapter_notebooks
  for select using (
    chapter_id in (select id from public.course_chapters)
  );

create policy "notebooks_modify" on public.chapter_notebooks
  for all using (
    chapter_id in (
      select ch.id from public.course_chapters ch
      join public.courses c on ch.course_id = c.id
      join public.profiles p on c.author_id = p.id
      where p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
