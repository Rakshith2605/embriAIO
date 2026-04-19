-- Chapter papers: links to research papers / Google Docs
create table if not exists public.chapter_papers (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references public.course_chapters(id) on delete cascade,
  url         text not null,
  title       text not null,
  description text not null default '',
  "order"     integer not null default 0
);

create index idx_chapter_papers_chapter on public.chapter_papers(chapter_id);

alter table public.chapter_papers enable row level security;

create policy "papers_select" on public.chapter_papers
  for select using (
    chapter_id in (select id from public.course_chapters)
  );

create policy "papers_modify" on public.chapter_papers
  for all using (
    chapter_id in (
      select ch.id from public.course_chapters ch
      join public.courses c on ch.course_id = c.id
      join public.profiles p on c.author_id = p.id
      where p.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
