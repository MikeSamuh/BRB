-- Add email to profiles (run in Supabase SQL Editor)
alter table public.profiles add column if not exists email text;

-- Update existing profiles to add emails (adjust to match what you used)
update public.profiles set email = 'admin@birdrock.bank'   where role = 'admin';
update public.profiles set email = 'manager@birdrock.bank' where role = 'manager';
update public.profiles set email = u.email
  from auth.users u
  where profiles.id = u.id and profiles.email is null;

-- Allow admin to insert profiles for new users
create policy "admin insert profiles" on public.profiles for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admin to delete profiles
create policy "admin delete profiles" on public.profiles for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admin/manager to delete transactions (for account cleanup)
create policy "admin delete transactions" on public.transactions for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));

-- Allow admin to delete accounts
create policy "admin delete accounts" on public.accounts for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admin to insert accounts
create policy "admin insert accounts" on public.accounts for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
