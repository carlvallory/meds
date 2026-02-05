-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ROLES (Enum)
create type app_role as enum ('admin', 'captain', 'mediator');

-- ZONES
create table public.zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- USERS (Public Profile)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  role app_role default 'mediator'::app_role,
  assigned_zone_id uuid references public.zones(id) on delete set null,
  is_active boolean default true,
  last_seen timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REASONS FOR UNAVAILABILITY
create table public.availability_reasons (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STATUS LOGS (History of Break/Unavailable)
create type status_type as enum ('break', 'unavailable');

create table public.status_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  type status_type not null,
  reason_id uuid references public.availability_reasons(id), -- Only for 'unavailable'
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  duration_minutes integer generated always as (
    extract(epoch from (end_time - start_time)) / 60
  ) stored
);

-- PANIC ALERTS
create table public.panic_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  zone_id uuid references public.zones(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- RLS POLICIES
alter table public.users enable row level security;
alter table public.zones enable row level security;
alter table public.availability_reasons enable row level security;
alter table public.status_logs enable row level security;
alter table public.panic_alerts enable row level security;

-- USERS Policies
create policy "Public users are viewable by everyone" on public.users for select using (true);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- ZONES Policies
create policy "Zones are viewable by everyone" on public.zones for select using (true);
create policy "Admins/Captains can manage zones" on public.zones for all using (
  exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'captain'))
);

-- STATUS LOGS Policies
create policy "Users can view logs" on public.status_logs for select using (true);
create policy "Users can insert their own logs" on public.status_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own logs" on public.status_logs for update using (auth.uid() = user_id);

-- HANDLE NEW USER (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'mediator');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
