-- Minha Aventura de Fé (name-cristian) — sale page analytics schema
-- Run this once in the Supabase project's SQL Editor (Project → SQL Editor → New query).
-- Same pattern used on la-botica-de-la-abuela: this is a separate Supabase project,
-- not shared data.

create table if not exists page_sessions (
  id text primary key,                 -- client-generated visitor id (kept in localStorage)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  views int not null default 1,
  referrer text,
  landing_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  checkout_clicks int not null default 0,
  first_checkout_click_at timestamptz,
  last_checkout_click_at timestamptz,
  user_agent text
);

alter table page_sessions enable row level security;

-- Only a logged-in dashboard user can read the data.
create policy "authenticated can read page sessions" on page_sessions
  for select to authenticated using (true);

-- No insert/update policies for anon/public: the page never talks to
-- Supabase directly. It POSTs to api/track-view.js and api/track-click.js,
-- which write using the service role key (server-side only), bypassing RLS
-- entirely.

-- After running this, create your dashboard login at:
-- Authentication → Users → Add user (email + password).
