-- Run this in the Supabase SQL editor to create your tables

create table flights (
  id              uuid primary key default gen_random_uuid(),
  owner_name      text not null,
  owner_contact   text not null,
  departure_location text not null,
  departure_date  date not null,
  departure_time  time,
  available_seats integer not null check (available_seats >= 1),
  notes           text,
  status          text not null default 'available' check (status in ('available', 'requested')),
  created_at      timestamptz not null default now()
);

create table seat_requests (
  id                uuid primary key default gen_random_uuid(),
  flight_id         uuid not null references flights(id) on delete cascade,
  requester_name    text not null,
  requester_contact text not null,
  seats_needed      integer not null check (seats_needed >= 1),
  created_at        timestamptz not null default now()
);

-- Indexes for common query patterns
create index on flights (departure_date);
create index on flights (status);
create index on flights (departure_location);

-- Row-level security: allow public reads of available flights only.
-- All writes go through the service role key in API routes.
alter table flights enable row level security;
alter table seat_requests enable row level security;

create policy "Public can read available flights"
  on flights for select
  using (status = 'available' and departure_date >= current_date);

-- seat_requests are never readable via the anon key (owner sees them via email/contact only)
