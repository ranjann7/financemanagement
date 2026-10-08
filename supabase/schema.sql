create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null,
  email text not null,
  type text not null,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.loans (
  id text primary key,
  customer text not null,
  customer_id text not null references public.customers(id),
  amount numeric(12, 2) not null check (amount > 0),
  type text not null,
  date text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  loan_id text not null references public.loans(id),
  customer text not null,
  amount numeric(12, 2) not null check (amount > 0),
  date text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Paid')),
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;

drop policy if exists "demo customers access" on public.customers;
create policy "demo customers access"
  on public.customers for all to anon, authenticated using (true) with check (true);

drop policy if exists "demo loans access" on public.loans;
create policy "demo loans access"
  on public.loans for all to anon, authenticated using (true) with check (true);

drop policy if exists "demo payments access" on public.payments;
create policy "demo payments access"
  on public.payments for all to anon, authenticated using (true) with check (true);

insert into public.customers (id, name, phone, email, type, status)
values
  ('CUS001', 'Rahul Sharma', '+91 9876543210', 'rahul@gmail.com', 'Personal', 'Active'),
  ('CUS002', 'Priya Verma', '+91 9123456780', 'priya@gmail.com', 'Home Loan', 'Active'),
  ('CUS003', 'Arjun Mehta', '+91 9988776655', 'arjun@gmail.com', 'Business', 'Active'),
  ('CUS004', 'Sneha Patel', '+91 9000000000', 'sneha@gmail.com', 'Education', 'Active')
on conflict (id) do nothing;

insert into public.loans (id, customer, customer_id, amount, type, date, status)
values
  ('LN1001', 'Rahul Sharma', 'CUS001', 250000, 'Personal Loan', '08 Oct 2026', 'Pending'),
  ('LN1002', 'Priya Verma', 'CUS002', 850000, 'Home Loan', '07 Oct 2026', 'Approved'),
  ('LN1003', 'Arjun Mehta', 'CUS003', 500000, 'Business Loan', '05 Oct 2026', 'Rejected'),
  ('LN1004', 'Sneha Patel', 'CUS004', 350000, 'Education Loan', '04 Oct 2026', 'Approved')
on conflict (id) do nothing;

insert into public.payments (id, loan_id, customer, amount, date, status)
values
  ('PAY001', 'LN1002', 'Priya Verma', 25000, '08 Oct 2026', 'Paid'),
  ('PAY002', 'LN1004', 'Sneha Patel', 15000, '07 Oct 2026', 'Paid'),
  ('PAY003', 'LN1001', 'Rahul Sharma', 10000, '06 Oct 2026', 'Pending')
on conflict (id) do nothing;