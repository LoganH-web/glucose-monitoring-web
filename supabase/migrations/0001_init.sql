-- Glucose Monitoring Web — initial schema
-- Apply via the Supabase SQL editor or `supabase db push`.

create extension if not exists "pgcrypto";

create table devices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sn          text not null,
  label       text,
  linked_at   timestamptz not null default now(),
  unique (user_id, sn)
);
create index devices_user_id_idx on devices(user_id);

create table readings (
  id            bigserial primary key,
  device_id     uuid not null references devices(id) on delete cascade,
  eaglenos_id   bigint not null,
  blood_sugar   numeric(5,2) not null,
  trend         smallint,
  measured_at   timestamptz not null,
  inserted_at   timestamptz not null default now(),
  unique (device_id, eaglenos_id)
);
create index readings_device_time_idx on readings(device_id, measured_at desc);

create table ai_summaries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  device_id     uuid not null references devices(id) on delete cascade,
  prompt_key    text not null,
  range_start   timestamptz not null,
  range_end     timestamptz not null,
  response_md   text not null,
  generated_at  timestamptz not null default now()
);
create index ai_summaries_user_idx on ai_summaries(user_id, generated_at desc);

alter table devices       enable row level security;
alter table readings      enable row level security;
alter table ai_summaries  enable row level security;

create policy "own devices"
  on devices for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "own readings"
  on readings for all
  using (device_id in (select id from devices where user_id = auth.uid()))
  with check (device_id in (select id from devices where user_id = auth.uid()));

create policy "own summaries"
  on ai_summaries for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
