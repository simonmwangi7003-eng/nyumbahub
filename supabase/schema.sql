-- =====================================================================
-- NyumbaHub Kenya - database schema
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  agency      text,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user','agent','admin')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- PROPERTIES ----------
create table if not exists public.properties (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references public.profiles(id) on delete set null,
  title         text not null,
  description   text,
  listing_type  text not null check (listing_type in ('sale','rent')),
  property_type text not null check (property_type in ('apartment','house','maisonette','townhouse','villa','bungalow','bedsitter','land','commercial','office')),
  price         numeric(14,0) not null check (price >= 0),
  bedrooms      int not null default 0,
  bathrooms     int not null default 0,
  area_sqm      numeric(12,0),
  county        text not null,
  area          text not null,
  address       text,
  latitude      numeric(9,6),
  longitude     numeric(9,6),
  amenities     text[] not null default '{}',
  images        text[] not null default '{}',
  status        text not null default 'pending' check (status in ('pending','approved','rejected','closed')),
  featured      boolean not null default false,
  views         int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_properties_status  on public.properties(status);
create index if not exists idx_properties_county  on public.properties(county);
create index if not exists idx_properties_owner   on public.properties(owner_id);
create index if not exists idx_properties_price   on public.properties(price);

-- ---------- FAVORITES ----------
create table if not exists public.favorites (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ---------- INQUIRIES & VIEWING REQUESTS ----------
create table if not exists public.inquiries (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid not null references public.properties(id) on delete cascade,
  sender_id      uuid references public.profiles(id) on delete set null,
  name           text not null,
  email          text,
  phone          text not null,
  message        text,
  kind           text not null default 'inquiry' check (kind in ('inquiry','viewing')),
  preferred_date timestamptz,
  status         text not null default 'new' check (status in ('new','contacted','closed')),
  created_at     timestamptz not null default now()
);
create index if not exists idx_inquiries_property on public.inquiries(property_id);

-- ---------- HELPERS ----------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active)
$$;

create or replace function public.is_active_user() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active)
$$;

-- Create a profile automatically on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id, new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    case when new.raw_user_meta_data->>'role' = 'agent' then 'agent' else 'user' end
  );
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stop normal users promoting themselves
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.is_active := old.is_active;
    new.email := old.email;
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Moderation: normal users can't self-approve or self-feature listings
create or replace function public.guard_property_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending'; new.featured := false; new.views := 0;
    else
      new.featured := old.featured;
      new.views := old.views;
      new.owner_id := old.owner_id;
      if new.status not in ('pending','closed') then new.status := old.status; end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists guard_property_write on public.properties;
create trigger guard_property_write before insert or update on public.properties
  for each row execute function public.guard_property_write();

-- Safe view counter (callable by anyone)
create or replace function public.increment_views(pid uuid) returns void
language sql security definer set search_path = public as $$
  update public.properties set views = views + 1 where id = pid and status = 'approved';
$$;
grant execute on function public.increment_views(uuid) to anon, authenticated;

-- Public-safe view of agent/owner details (no email exposed)
create or replace view public.public_profiles as
  select id, full_name, phone, agency, avatar_url, role, created_at from public.profiles where is_active;
grant select on public.public_profiles to anon, authenticated;

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles   enable row level security;
alter table public.properties enable row level security;
alter table public.favorites  enable row level security;
alter table public.inquiries  enable row level security;

-- profiles
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin" on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- properties
drop policy if exists "properties read" on public.properties;
create policy "properties read" on public.properties for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
drop policy if exists "properties insert" on public.properties;
create policy "properties insert" on public.properties for insert to authenticated
  with check (owner_id = auth.uid() and public.is_active_user());
drop policy if exists "properties update" on public.properties;
create policy "properties update" on public.properties for update
  using (owner_id = auth.uid() or public.is_admin());
drop policy if exists "properties delete" on public.properties;
create policy "properties delete" on public.properties for delete
  using (owner_id = auth.uid() or public.is_admin());

-- favorites
drop policy if exists "favorites own" on public.favorites;
create policy "favorites own" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- inquiries
drop policy if exists "inquiries insert" on public.inquiries;
create policy "inquiries insert" on public.inquiries for insert
  with check (sender_id is null or sender_id = auth.uid());
drop policy if exists "inquiries read" on public.inquiries;
create policy "inquiries read" on public.inquiries for select using (
  sender_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);
drop policy if exists "inquiries update" on public.inquiries;
create policy "inquiries update" on public.inquiries for update using (
  public.is_admin()
  or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);
drop policy if exists "inquiries delete" on public.inquiries;
create policy "inquiries delete" on public.inquiries for delete using (public.is_admin());

-- ---------- STORAGE (property photos) ----------
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
  on conflict (id) do nothing;

drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'property-images');
drop policy if exists "photos upload own folder" on storage.objects;
create policy "photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos delete own or admin" on storage.objects;
create policy "photos delete own or admin" on storage.objects for delete to authenticated
  using (bucket_id = 'property-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- ADMIN STATISTICS ----------
create or replace function public.admin_stats() returns json
language plpgsql security definer set search_path = public as $$
declare result json;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  select json_build_object(
    'total_properties', (select count(*) from properties),
    'approved',  (select count(*) from properties where status = 'approved'),
    'pending',   (select count(*) from properties where status = 'pending'),
    'rejected',  (select count(*) from properties where status = 'rejected'),
    'closed',    (select count(*) from properties where status = 'closed'),
    'featured',  (select count(*) from properties where featured),
    'for_sale',  (select count(*) from properties where listing_type = 'sale' and status = 'approved'),
    'for_rent',  (select count(*) from properties where listing_type = 'rent' and status = 'approved'),
    'total_users',  (select count(*) from profiles),
    'agents',       (select count(*) from profiles where role = 'agent'),
    'total_inquiries', (select count(*) from inquiries),
    'new_inquiries',   (select count(*) from inquiries where status = 'new'),
    'viewings',        (select count(*) from inquiries where kind = 'viewing'),
    'total_views',     (select coalesce(sum(views),0) from properties),
    'total_favorites', (select count(*) from favorites),
    'avg_sale_price',  (select coalesce(round(avg(price)),0) from properties where listing_type = 'sale' and status = 'approved'),
    'avg_rent',        (select coalesce(round(avg(price)),0) from properties where listing_type = 'rent' and status = 'approved'),
    'by_county', (select coalesce(json_agg(t), '[]'::json) from (
        select county as name, count(*)::int as value from properties group by county order by count(*) desc limit 8) t),
    'by_type', (select coalesce(json_agg(t), '[]'::json) from (
        select property_type as name, count(*)::int as value from properties group by property_type order by count(*) desc) t),
    'monthly', (select coalesce(json_agg(m), '[]'::json) from (
        select to_char(d, 'Mon') as month,
          (select count(*) from properties p where date_trunc('month', p.created_at) = d)::int as listings,
          (select count(*) from profiles u where date_trunc('month', u.created_at) = d)::int as users,
          (select count(*) from inquiries i where date_trunc('month', i.created_at) = d)::int as inquiries
        from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') d
        order by d) m),
    'top_properties', (select coalesce(json_agg(t), '[]'::json) from (
        select id, title, county, views from properties order by views desc limit 5) t)
  ) into result;
  return result;
end $$;
grant execute on function public.admin_stats() to authenticated;
