create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  username extensions.citext unique,
  name text not null default '',
  bio text not null default '',
  city text not null default '',
  date_of_birth date,
  avatar_color text not null default '#F28C28',
  avatar_path text,
  interests text[] not null default '{}',
  preferred_vibes text[] not null default '{}',
  verified boolean not null default false,
  verified_phone boolean not null default true,
  notifications_enabled boolean not null default true,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username::text ~ '^[a-zA-Z0-9_.]{3,20}$'),
  constraint profiles_bio_length check (char_length(bio) <= 160),
  constraint profiles_interests_limit check (cardinality(interests) <= 30),
  constraint profiles_vibes_limit check (cardinality(preferred_vibes) <= 20)
);

create table public.otp_rate_limits (
  phone text primary key,
  request_window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  failed_attempt_count integer not null default 0 check (failed_attempt_count >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table public.migration_imports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  source_storage_key text not null check (source_storage_key = '@chillwithhomies/demo-state-v3'),
  source_version integer not null check (source_version = 3),
  raw_state jsonb not null,
  id_map jsonb not null default '{}',
  imported_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.enforce_adult_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.profile_completed_at is not null then
    if new.date_of_birth is null or new.date_of_birth > current_date - interval '18 years' then
      raise exception 'User must be at least 18 years old' using errcode = '23514';
    end if;
    if new.username is null or char_length(trim(new.name)) < 2 or char_length(trim(new.city)) = 0 then
      raise exception 'Completed profile is missing required fields' using errcode = '23514';
    end if;
    if cardinality(new.interests) < 3 then
      raise exception 'Completed profile requires at least three interests' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger profiles_enforce_adult
before insert or update on public.profiles
for each row execute function public.enforce_adult_profile();

alter table public.profiles enable row level security;
alter table public.otp_rate_limits enable row level security;
alter table public.migration_imports enable row level security;

create policy profiles_select_authenticated
on public.profiles for select
to authenticated
using (true);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy migration_imports_select_own
on public.migration_imports for select
to authenticated
using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy avatar_insert_own
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy avatar_select_own
on storage.objects for select
to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);

create policy avatar_update_own
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy avatar_delete_own
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);

revoke all on public.otp_rate_limits from anon, authenticated;
revoke all on public.migration_imports from anon;
