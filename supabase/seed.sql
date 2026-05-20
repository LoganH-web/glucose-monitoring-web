-- Seed: test device + 7 days of realistic glucose readings
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Uses service role context so RLS is bypassed — safe for dev seeding only.
--
-- Test user: testpatient@propertylab.com
-- User ID:   ee523716-a7ec-4ec2-80f0-1c78028e85ef

do $$
declare
  v_user_id  uuid := 'ee523716-a7ec-4ec2-80f0-1c78028e85ef';
  v_device_id uuid;
begin

  -- Insert test device (idempotent)
  insert into devices (user_id, sn, label)
  values (v_user_id, 'TEST-SN-0001', 'Test CGM Device')
  on conflict (user_id, sn) do nothing;

  select id into v_device_id
  from devices
  where user_id = v_user_id and sn = 'TEST-SN-0001';

  -- 7 days of readings every 5 minutes = 2016 rows
  -- blood_sugar oscillates between ~4.5 and ~9.5 mmol/L (realistic CGM pattern)
  -- trend: 1=flat 2=rising_slow 3=rising 4=rising_fast 5=falling_slow 6=falling 7=falling_fast
  insert into readings (device_id, eaglenos_id, blood_sugar, trend, measured_at)
  select
    v_device_id,
    row_number() over (order by t) as eaglenos_id,
    round(
      (6.5
        + 2.0 * sin(extract(epoch from t) / 7200.0)   -- ~2h meal cycle
        + 0.8 * sin(extract(epoch from t) / 1800.0)   -- 30-min noise
        + (random() - 0.5) * 0.4                      -- jitter
      )::numeric,
      2
    ) as blood_sugar,
    case
      when sin(extract(epoch from t) / 7200.0) > 0.5  then 3  -- rising
      when sin(extract(epoch from t) / 7200.0) > 0.1  then 2  -- rising slow
      when sin(extract(epoch from t) / 7200.0) < -0.5 then 6  -- falling
      when sin(extract(epoch from t) / 7200.0) < -0.1 then 5  -- falling slow
      else 1                                                    -- flat
    end as trend,
    t as measured_at
  from generate_series(
    now() - interval '7 days',
    now(),
    interval '5 minutes'
  ) as t
  on conflict (device_id, eaglenos_id) do nothing;

end $$;
