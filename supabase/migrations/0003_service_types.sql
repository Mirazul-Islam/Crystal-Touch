-- ===========================================================================
-- Migration 0003 — restrict service types to the four offered cleans
-- (house / apartment / airbnb / airbnb_express)
--
-- Postgres can't remove enum values in place, so we just add the new one.
-- The legacy values (hotel, office, move_in_out, post_construction,
-- deep_clean) stay defined but are no longer offered anywhere in the app —
-- harmless, and existing bookings still display.
--
-- Run this as a standalone statement in the Supabase SQL editor (ADD VALUE
-- cannot run inside a transaction block).
-- ===========================================================================

alter type public.service_type add value if not exists 'airbnb_express';
