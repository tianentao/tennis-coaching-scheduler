-- available_time_slots is security_invoker and inner-joins the coach's profile for
-- coach_name. With only "profiles_select_own_or_admin", players couldn't read coach
-- profiles, so the join dropped every row and players saw no open slots.
-- Coach/admin profiles (display_name + role) are public to signed-in users;
-- other players' profiles stay private.
create policy "profiles_select_coaches"
on public.profiles
for select
to authenticated
using (role in ('coach', 'admin'));
