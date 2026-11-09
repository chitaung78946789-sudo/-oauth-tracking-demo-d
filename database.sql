-- Replace this email before running the SQL.
-- It is the Google Gmail address that may view the dashboard.

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  google_user_id text not null,
  name text,
  email text,
  avatar_url text,
  ip_address inet,
  country text,
  city text,
  device_type text,
  operating_system text,
  browser text,
  visited_at timestamptz not null default now(),
  consent_version text not null,
  created_at timestamptz not null default now()
);

alter table public.visitor_events enable row level security;
revoke all on public.visitor_events from anon, authenticated;
grant select, delete on public.visitor_events to authenticated;

create policy "admin can read all visitor events"
on public.visitor_events for select to authenticated
using ((select auth.jwt() ->> 'email') = 'admin@example.com');

create policy "admin can delete all visitor events"
on public.visitor_events for delete to authenticated
using ((select auth.jwt() ->> 'email') = 'admin@example.com');

create policy "visitor can delete own events"
on public.visitor_events for delete to authenticated
using (auth_user_id = (select auth.uid()));

-- Run manually to remove records older than 30 days.
delete from public.visitor_events
where visited_at < now() - interval '30 days';
