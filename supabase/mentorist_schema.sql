create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_onboarding (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null,
  primary_focus text not null,
  support_mode text not null default 'mentor' check (support_mode in ('mentor', 'pair')),
  balance_health smallint not null check (balance_health between 0 and 100),
  balance_relationships smallint not null check (balance_relationships between 0 and 100),
  balance_growth smallint not null check (balance_growth between 0 and 100),
  balance_work smallint not null check (balance_work between 0 and 100),
  answers jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_workspace_state (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  state_version integer not null default 1,
  source text not null default 'client',
  synced_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists user_onboarding_set_updated_at on public.user_onboarding;
create trigger user_onboarding_set_updated_at
before update on public.user_onboarding
for each row
execute function public.set_updated_at();

drop trigger if exists user_workspace_state_set_updated_at on public.user_workspace_state;
create trigger user_workspace_state_set_updated_at
before update on public.user_workspace_state
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_onboarding enable row level security;
alter table public.user_workspace_state enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "onboarding_select_own" on public.user_onboarding;
create policy "onboarding_select_own"
on public.user_onboarding
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "onboarding_insert_own" on public.user_onboarding;
create policy "onboarding_insert_own"
on public.user_onboarding
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "onboarding_update_own" on public.user_onboarding;
create policy "onboarding_update_own"
on public.user_onboarding
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "workspace_select_own" on public.user_workspace_state;
create policy "workspace_select_own"
on public.user_workspace_state
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "workspace_insert_own" on public.user_workspace_state;
create policy "workspace_insert_own"
on public.user_workspace_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "workspace_update_own" on public.user_workspace_state;
create policy "workspace_update_own"
on public.user_workspace_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
