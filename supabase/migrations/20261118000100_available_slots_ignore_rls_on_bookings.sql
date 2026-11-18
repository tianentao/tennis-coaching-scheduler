-- available_time_slots is security_invoker, so its NOT EXISTS check on bookings ran
-- under the viewer's RLS. Players can only see their own bookings, so slots booked by
-- other players still showed as open (booking them then failed in book_time_slot).
-- Check active bookings through a security definer helper that exposes only a boolean.
create or replace function public.slot_has_active_booking(target_slot_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bookings
    where slot_id = target_slot_id
      and status = 'booked'
  );
$$;

create or replace view public.available_time_slots
with (security_invoker = true)
as
select
  ts.id,
  ts.coach_id,
  ts.starts_at,
  ts.ends_at,
  ts.location,
  ts.court_name,
  ts.skill_level,
  coach.display_name as coach_name
from public.time_slots ts
join public.profiles coach on coach.id = ts.coach_id
where ts.is_active = true
  and not public.slot_has_active_booking(ts.id);
