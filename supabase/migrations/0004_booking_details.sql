-- ===========================================================================
-- Migration 0004 — buzz/access code, human reference code, and who supplies
-- the cleaning materials. Safe to run more than once.
-- ===========================================================================

alter table public.bookings
  add column if not exists buzz_code text,
  add column if not exists reference_code text,
  -- false = client provides supplies ($25/hr/cleaner)
  -- true  = Crystal Touch brings supplies ($40/hr/cleaner)
  add column if not exists company_supplies boolean not null default false;

-- Generate a short, human-friendly, unambiguous reference code (e.g. CT-7F3K9Q)
-- on insert when one isn't supplied.
create or replace function public.set_reference_code()
returns trigger language plpgsql as $$
declare
  code  text;
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I
  i     int;
begin
  if new.reference_code is null then
    loop
      code := 'CT-';
      for i in 1..6 loop
        code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
      end loop;
      exit when not exists (select 1 from public.bookings where reference_code = code);
    end loop;
    new.reference_code := code;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_set_reference_code on public.bookings;
create trigger bookings_set_reference_code
  before insert on public.bookings
  for each row execute function public.set_reference_code();

-- Backfill reference codes for existing bookings.
do $$
declare
  r     record;
  code  text;
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i     int;
begin
  for r in select id from public.bookings where reference_code is null loop
    loop
      code := 'CT-';
      for i in 1..6 loop
        code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
      end loop;
      exit when not exists (select 1 from public.bookings where reference_code = code);
    end loop;
    update public.bookings set reference_code = code where id = r.id;
  end loop;
end $$;

create unique index if not exists bookings_reference_code_idx
  on public.bookings (reference_code);

create index if not exists bookings_client_email_idx
  on public.bookings (lower(client_email));
