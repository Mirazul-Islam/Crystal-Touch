-- ===========================================================================
-- Migration 0002 — recurring visits
-- Run this in the Supabase SQL editor if you already ran schema.sql before the
-- recurring feature was added. Safe to run more than once.
-- ===========================================================================

alter table public.bookings
  add column if not exists series_id uuid,
  add column if not exists visit_number int not null default 1,
  add column if not exists recurrence_parent_id uuid references public.bookings (id) on delete set null;

-- Backfill: existing bookings each become the root of their own series.
update public.bookings set series_id = id where series_id is null;

create index if not exists bookings_series_idx on public.bookings (series_id);

-- Trigger: a new booking starts its own series unless a series_id is provided
-- (auto-created repeat visits pass the parent's series_id explicitly).
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
