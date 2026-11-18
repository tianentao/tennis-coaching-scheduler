create extension if not exists "pgcrypto";

create type public.app_role as enum ('player', 'coach', 'admin');
create type public.skill_level as enum ('beginner', 'intermediate', 'advanced', 'all_levels');
create type public.booking_status as enum ('booked', 'cancelled');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.app_role not null default 'player',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null,
  court_name text,
  skill_level public.skill_level not null default 'all_levels',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint time_slots_time_check check (ends_at > starts_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.time_slots (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.booking_status not null default 'booked',
  notes text,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index bookings_one_active_booking_per_slot_idx
  on public.bookings (slot_id)
  where status = 'booked';

create index bookings_user_id_status_idx
  on public.bookings (user_id, status, created_at desc);

create index bookings_slot_id_idx
  on public.bookings (slot_id);

create index time_slots_coach_starts_at_idx
  on public.time_slots (coach_id, starts_at);

create index time_slots_active_starts_at_idx
  on public.time_slots (is_active, starts_at);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_time_slots_updated_at
before update on public.time_slots
for each row
execute function public.set_updated_at();

create trigger set_bookings_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do update
    set display_name = coalesce(excluded.display_name, public.profiles.display_name);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('coach', 'admin')
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
  and not exists (
    select 1
    from public.bookings b
    where b.slot_id = ts.id
      and b.status = 'booked'
  );

create or replace function public.book_time_slot(target_slot_id uuid, booking_notes text default null)
returns setof public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  target_slot public.time_slots%rowtype;
  created_booking public.bookings%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_slot
  from public.time_slots
  where id = target_slot_id
    and is_active = true
  for update;

  if not found then
    raise exception 'Time slot not found or inactive';
  end if;

  if exists (
    select 1
    from public.bookings
    where slot_id = target_slot_id
      and status = 'booked'
  ) then
    raise exception 'Time slot already booked';
  end if;

  insert into public.bookings (slot_id, user_id, notes)
  values (target_slot_id, current_user_id, booking_notes)
  returning * into created_booking;

  return next created_booking;
end;
$$;

create or replace function public.cancel_booking(target_booking_id uuid)
returns setof public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  updated_booking public.bookings%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.bookings b
  set status = 'cancelled',
      cancelled_at = timezone('utc', now())
  where b.id = target_booking_id
    and b.status = 'booked'
    and (
      b.user_id = current_user_id
      or public.is_admin()
    )
  returning * into updated_booking;

  if not found then
    raise exception 'Booking not found or cannot be cancelled';
  end if;

  return next updated_booking;
end;
$$;

alter table public.profiles enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "time_slots_select_all_authenticated"
on public.time_slots
for select
to authenticated
using (true);

create policy "time_slots_manage_admin"
on public.time_slots
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "bookings_select_own_or_admin"
on public.bookings
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "bookings_insert_self"
on public.bookings
for insert
to authenticated
with check (user_id = auth.uid());

create policy "bookings_update_own_or_admin"
on public.bookings
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.available_time_slots to anon, authenticated;
grant select on public.time_slots to authenticated;
grant select, insert, update on public.bookings to authenticated;
grant select, update on public.profiles to authenticated;
grant execute on function public.book_time_slot(uuid, text) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
