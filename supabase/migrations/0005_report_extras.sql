-- ===========================================================================
-- Migration 0005 — cleaner closing checklist + Airbnb restock alerts on reports
-- Safe to run more than once.
-- ===========================================================================

alter table public.reports
  add column if not exists closing_checklist jsonb not null default '[]'::jsonb,
  add column if not exists supply_alerts     jsonb not null default '[]'::jsonb;
