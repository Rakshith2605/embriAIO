-- Course visibility: public, restricted, private
-- public    = visible and accessible to everyone
-- restricted = visible to all, content locked until owner approves access
-- private   = only the owner can see and access

alter table public.courses
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'restricted', 'private'));

-- Access requests for restricted courses
create table if not exists public.course_access_requests (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  message     text not null default '',
  created_at  timestamptz default now(),
  reviewed_at timestamptz,
  unique (course_id, requester_id)
);

create index if not exists idx_access_requests_course on public.course_access_requests(course_id);
create index if not exists idx_access_requests_requester on public.course_access_requests(requester_id);

alter table public.course_access_requests enable row level security;

-- Drop policies if they already exist (idempotent)
drop policy if exists "access_requests_own" on public.course_access_requests;
drop policy if exists "access_requests_owner" on public.course_access_requests;
drop policy if exists "access_requests_insert" on public.course_access_requests;
drop policy if exists "access_requests_update" on public.course_access_requests;

-- Anyone authenticated can see their own requests
create policy "access_requests_own" on public.course_access_requests
  for select using (
    requester_id in (
      select id from public.profiles
      where email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Course owners can see requests for their courses
create policy "access_requests_owner" on public.course_access_requests
  for select using (
    course_id in (
      select c.id from public.courses c
      join public.profiles p on c.author_id = p.id
      where p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Requesters can insert their own requests
create policy "access_requests_insert" on public.course_access_requests
  for insert with check (
    requester_id in (
      select id from public.profiles
      where email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Course owners can update (approve/deny) requests
create policy "access_requests_update" on public.course_access_requests
  for update using (
    course_id in (
      select c.id from public.courses c
      join public.profiles p on c.author_id = p.id
      where p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
