drop policy if exists profiles_select_authenticated on public.profiles;

create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);
