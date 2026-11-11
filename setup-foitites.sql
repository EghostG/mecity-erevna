-- MeCity AI · Έρευνα φοιτητών
create table if not exists public.students (
  id text primary key,
  ts timestamptz not null default now(),
  living text, city text, sources text, pain text, scam text,
  price text, ai text, budget text, use text, trust text,
  created_at timestamptz not null default now()
);
alter table public.students enable row level security;
grant select, insert on public.students to anon;
create policy "anon insert" on public.students for insert to anon with check (true);
create policy "anon read" on public.students for select to anon using (true);
