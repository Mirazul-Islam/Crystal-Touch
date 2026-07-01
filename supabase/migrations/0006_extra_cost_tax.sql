-- ===========================================================================
-- Migration 0006 — per-job extra cost (e.g. Uber) + per-job tax rate
-- Safe to run more than once.
-- ===========================================================================

alter table public.bookings
  add column if not exists extra_cost      numeric(10, 2),
  add column if not exists extra_cost_note text,
  -- e.g. 0.15 for 15% HST. 0 = not taxed (the default).
  add column if not exists tax_rate        numeric(5, 4) not null default 0;
