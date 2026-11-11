-- MeCity AI · Έρευνα δρόμου: πίνακας απαντήσεων
create table if not exists public.responses (
  id         text primary key,
  ts         timestamptz not null default now(),
  seg        text,
  pain       text,
  price      text,
  ai         text,
  use        text,
  trust      text,
  agent      text,
  age        text,
  video      text,
  created_at timestamptz not null default now()
);

alter table public.responses enable row level security;

grant select, insert, delete on public.responses to anon;

drop policy if exists "anon insert" on public.responses;
drop policy if exists "anon read" on public.responses;
drop policy if exists "anon delete recent" on public.responses;

create policy "anon insert" on public.responses
  for insert to anon with check (true);

create policy "anon read" on public.responses
  for select to anon using (true);

-- Διαγραφή επιτρέπεται μόνο για καταχωρίσεις των τελευταίων 15 λεπτών (κουμπί «Διαγραφή τελευταίας»)
create policy "anon delete recent" on public.responses
  for delete to anon using (created_at > now() - interval '15 minutes');
