-- ===========================================================================
-- Crystal Touch — Supabase schema
-- Run this in the Supabase SQL editor on a fresh project.
-- ===========================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'cleaner', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.service_type as enum (
    'house', 'apartment', 'airbnb', 'airbnb_express'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.frequency as enum ('one_time', 'weekly', 'biweekly', 'monthly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.time_slot as enum ('morning', 'afternoon', 'evening');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum (
    'new', 'assigned', 'in_progress', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user, holds their role
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        public.user_role not null default 'client',
  phone       text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- bookings — a client's cleaning request (created anonymously)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  public_token        uuid not null unique default gen_random_uuid(),

  -- client contact (no account required)
  client_name         text not null,
  client_email        text not null,
  client_phone        text not null,

  -- service details
  service_type        public.service_type not null,
  frequency           public.frequency not null default 'one_time',
  bedrooms            int not null default 1,
  bathrooms           int not null default 1,
  extras              jsonb not null default '[]'::jsonb,

  -- location
  address             text not null,
  city                text not null,
  postal_code         text,

  -- schedule
  preferred_date      date,
  preferred_time      public.time_slot,

  notes               text,

  -- dispatch / lifecycle
  status              public.booking_status not null default 'new',
  assigned_cleaner_id uuid references public.profiles (id) on delete set null,
  estimated_price     numeric(10, 2),

  -- recurring series: a weekly/monthly client is a chain of bookings (visits)
  -- that all share a series_id. The first booking is the root (series_id = id).
  series_id           uuid,
  visit_number        int not null default 1,
  recurrence_parent_id uuid references public.bookings (id) on delete set null,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists bookings_status_idx          on public.bookings (status);
create index if not exists bookings_cleaner_idx          on public.bookings (assigned_cleaner_id);
create index if not exists bookings_created_at_idx       on public.bookings (created_at desc);
create index if not exists bookings_series_idx           on public.bookings (series_id);

-- A brand-new booking starts its own series (series_id = its own id). Auto-created
-- repeat visits inherit the parent's series_id (set explicitly on insert).
create or replace function public.set_series_id()
returns trigger language plpgsql as $$
begin
  if new.series_id is null then
    new.series_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_set_series_id on public.bookings;
create trigger bookings_set_series_id
  before insert on public.bookings
  for each row execute function public.set_series_id();

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- job_updates — cleaner comments + photos posted while the job is in progress
-- ---------------------------------------------------------------------------
create table if not exists public.job_updates (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings (id) on delete cascade,
  cleaner_id  uuid references public.profiles (id) on delete set null,
  comment     text,
  photo_urls  jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists job_updates_booking_idx on public.job_updates (booking_id, created_at);

-- ---------------------------------------------------------------------------
-- reports — the final after-service report (one per booking)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null unique references public.bookings (id) on delete cascade,
  cleaner_id    uuid references public.profiles (id) on delete set null,
  summary       text not null,
  checklist     jsonb not null default '[]'::jsonb,
  before_photos jsonb not null default '[]'::jsonb,
  after_photos  jsonb not null default '[]'::jsonb,
  completed_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- All writes go through Netlify functions using the service-role key, which
-- bypasses RLS. We still enable RLS and add minimal read policies so nothing
-- is exposed by accident through the anon key.
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.bookings    enable row level security;
alter table public.job_updates enable row level security;
alter table public.reports     enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- profiles: a user can read their own profile; admins read all.
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- bookings: admins read all; cleaners read only the jobs assigned to them.
drop policy if exists "bookings staff read" on public.bookings;
create policy "bookings staff read" on public.bookings
  for select using (public.is_admin() or assigned_cleaner_id = auth.uid());

-- job_updates: visible to admins and the assigned cleaner.
drop policy if exists "job_updates staff read" on public.job_updates;
create policy "job_updates staff read" on public.job_updates
  for select using (
    public.is_admin() or cleaner_id = auth.uid()
  );

-- reports: visible to admins and the cleaner who wrote them.
drop policy if exists "reports staff read" on public.reports;
create policy "reports staff read" on public.reports
  for select using (
    public.is_admin() or cleaner_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- Storage bucket for cleaner job photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do nothing;

-- Allow public read of photos (URLs are unguessable UUIDs). Uploads are done
-- via signed URLs minted by the Netlify function, so no insert policy needed.
drop policy if exists "job-photos public read" on storage.objects;
create policy "job-photos public read" on storage.objects
  for select using (bucket_id = 'job-photos');
