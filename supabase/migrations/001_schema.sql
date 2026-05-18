-- profiles 테이블
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text,
  gender        text check (gender in ('MALE', 'FEMALE')),
  english_level text check (english_level in ('HIGH', 'MIDDLE', 'LOW')),
  role          text not null default 'MEMBER' check (role in ('MEMBER', 'ADMIN')),
  is_onboarded  boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "self read/write" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "authenticated read" on public.profiles for select
  using (auth.role() = 'authenticated');

-- sessions 테이블 (모임 회차)
create table public.sessions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id)
);

alter table public.sessions enable row level security;

create policy "authenticated read" on public.sessions for select
  using (auth.role() = 'authenticated');

create policy "admin insert" on public.sessions for insert
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
  ));

-- seat_assignments 테이블
-- user_id → profiles.id (PostgREST join을 위해 auth.users 대신 profiles 참조)
create table public.seat_assignments (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  team_number int not null,
  unique (session_id, user_id)
);

alter table public.seat_assignments enable row level security;

create policy "authenticated read" on public.seat_assignments for select
  using (auth.role() = 'authenticated');

create policy "admin write" on public.seat_assignments for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
  ))
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
  ));

-- 신규 유저 가입 시 profiles 행 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
