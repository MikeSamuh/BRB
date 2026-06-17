-- ── Tables ────────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null check (role in ('admin', 'manager', 'user')),
  account_id text
);

create table public.accounts (
  id text primary key,
  owner_name text not null,
  balance numeric(12,2) not null default 0,
  created_at timestamptz default now()
);

create table public.transactions (
  id text primary key,
  account_id text references public.accounts(id),
  date text not null,
  type text not null check (type in ('deposit', 'withdrawal', 'interest')),
  amount numeric(12,2) not null,
  note text not null,
  balance numeric(12,2) not null,
  performed_by text not null,
  created_at timestamptz default now()
);

create table public.settings (
  key text primary key,
  value text not null
);

-- ── Seed Data ─────────────────────────────────────────────────────────────────

insert into public.settings (key, value) values ('interest_rate', '4.5');

insert into public.accounts (id, owner_name, balance) values
  ('acc_alice', 'Alice Johnson', 3250.00),
  ('acc_bob',   'Bob Smith',     1875.50),
  ('acc_carol', 'Carol White',   8400.00);

insert into public.transactions (id, account_id, date, type, amount, note, balance, performed_by) values
  ('t1',  'acc_alice', '2026-01-15', 'deposit',    3000.00, 'Initial deposit',       3000.00,  'Manager'),
  ('t2',  'acc_alice', '2026-03-01', 'interest',     11.25, 'Monthly interest',      3011.25,  'System'),
  ('t3',  'acc_alice', '2026-05-10', 'deposit',     250.00, 'Birthday gift deposit', 3261.25,  'Manager'),
  ('t4',  'acc_alice', '2026-06-01', 'interest',     12.23, 'Monthly interest',      3273.48,  'System'),
  ('t5',  'acc_alice', '2026-06-10', 'withdrawal',   23.48, 'Cash out',              3250.00,  'Manager'),
  ('t6',  'acc_bob',   '2026-02-01', 'deposit',    2000.00, 'Initial deposit',       2000.00,  'Manager'),
  ('t7',  'acc_bob',   '2026-04-01', 'interest',      7.50, 'Monthly interest',      2007.50,  'System'),
  ('t8',  'acc_bob',   '2026-05-20', 'withdrawal',  132.00, 'Expense withdrawal',    1875.50,  'Manager'),
  ('t9',  'acc_carol', '2026-01-05', 'deposit',    8000.00, 'Initial deposit',       8000.00,  'Manager'),
  ('t10', 'acc_carol', '2026-03-01', 'interest',     30.00, 'Monthly interest',      8030.00,  'System'),
  ('t11', 'acc_carol', '2026-04-15', 'deposit',     400.00, 'Additional savings',    8430.00,  'Manager'),
  ('t12', 'acc_carol', '2026-06-01', 'interest',     31.61, 'Monthly interest',      8461.61,  'System'),
  ('t13', 'acc_carol', '2026-06-05', 'withdrawal',   61.61, 'Partial withdrawal',    8400.00,  'Manager');

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.accounts    enable row level security;
alter table public.transactions enable row level security;
alter table public.settings    enable row level security;

-- All authenticated users can read
create policy "read profiles"     on public.profiles     for select to authenticated using (true);
create policy "read accounts"     on public.accounts     for select to authenticated using (true);
create policy "read transactions" on public.transactions for select to authenticated using (true);
create policy "read settings"     on public.settings     for select to authenticated using (true);

-- Only admin/manager can write transactions and update account balances
create policy "write transactions" on public.transactions for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));

create policy "update accounts" on public.accounts for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));

-- Only admin can update interest rate
create policy "update settings" on public.settings for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── Profiles: run AFTER creating users in Supabase Auth dashboard ─────────────
-- Replace emails if you used different ones.

-- insert into public.profiles (id, name, role, account_id)
-- select id, 'Admin',        'admin',   null        from auth.users where email = 'admin@birdrock.bank'
-- union all
-- select id, 'Manager',      'manager', null        from auth.users where email = 'manager@birdrock.bank'
-- union all
-- select id, 'Alice Johnson','user',    'acc_alice' from auth.users where email = 'alice@birdrock.bank'
-- union all
-- select id, 'Bob Smith',    'user',    'acc_bob'   from auth.users where email = 'bob@birdrock.bank'
-- union all
-- select id, 'Carol White',  'user',    'acc_carol' from auth.users where email = 'carol@birdrock.bank';
