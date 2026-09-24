-- =====================================================================
-- Рибново — основна структура на базата данни (Фаза 1)
-- Пуска се веднъж в Supabase → SQL Editor.
-- =====================================================================

-- ---------- Видове (enum) ----------

-- Роли на потребителите
create type public.user_role as enum (
  'admin',     -- администратор: одобрява публикации, дава права
  'verified',  -- проверен профил (кметство, училище): пуска аларми
  'resident'   -- жител: публикациите му минават одобрение
);

-- Видове аларми / известия
create type public.alert_category as enum (
  'emergency', -- Спешни (винаги включени)
  'utilities', -- Ток и вода
  'road',      -- Път и сняг
  'events',    -- Събития
  'memorial',  -- Възпоменания
  'ads'        -- Обяви
);

-- Вид публикация
create type public.post_kind as enum (
  'news', -- новина
  'ad'    -- обява
);

-- Състояние на одобрение
create type public.moderation_status as enum (
  'pending',  -- чака одобрение
  'approved', -- одобрена, вижда се от всички
  'rejected'  -- отхвърлена
);

-- ---------- Таблици ----------

-- Профил на всеки потребител (създава се автоматично при регистрация)
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  organization text,               -- напр. „Кметство Рибново“ (за проверени профили)
  role         public.user_role not null default 'resident',
  created_at   timestamptz not null default now()
);

-- Аларми (пускат се само от проверени профили и администратора)
create table public.alerts (
  id             uuid primary key default gen_random_uuid(),
  category       public.alert_category not null,
  title          text not null check (char_length(title) between 3 and 140),
  body           text,
  is_important   boolean not null default false, -- показва се оранжево най-горе на началния екран
  expected_until timestamptz,                    -- „Очаква се до …“
  resolved_at    timestamptz,                    -- попълнено = приключила
  author_id      uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);

create index alerts_active_idx on public.alerts (created_at desc) where resolved_at is null;

-- Събития
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 3 and 140),
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  category    public.alert_category not null default 'events', -- 'events' или 'memorial'
  status      public.moderation_status not null default 'pending',
  author_id   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index events_upcoming_idx on public.events (starts_at) where status = 'approved';

-- Новини и обяви
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  kind         public.post_kind not null default 'news',
  title        text not null check (char_length(title) between 3 and 140),
  body         text not null,
  image_url    text,
  status       public.moderation_status not null default 'pending',
  author_id    uuid references public.profiles (id) on delete set null,
  published_at timestamptz,        -- попълва се при одобрение
  created_at   timestamptz not null default now()
);

create index posts_feed_idx on public.posts (published_at desc) where status = 'approved';

-- Доклади за неподходящо съдържание (бутон „Докладвай“)
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'event', 'alert')),
  target_id   uuid not null,
  reason      text not null check (char_length(reason) between 3 and 500),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Абонаменти за Web Push известия (едно устройство = един ред).
-- Предпочитанията (кои видове известия) се пазят към устройството,
-- за да получават известия и жители, които не са влезли в профил.
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_id    uuid references public.profiles (id) on delete set null,
  categories public.alert_category[] not null
             default array['emergency','utilities','road','events','memorial','ads']::public.alert_category[],
  created_at timestamptz not null default now()
);

-- ---------- Помощни функции за правата ----------

create or replace function public.my_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.my_role() = 'admin', false)
$$;

create or replace function public.is_verified_or_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.my_role() in ('verified', 'admin'), false)
$$;

-- ---------- Автоматични действия (triggers) ----------

-- Нов потребител → нов профил с роля „жител“
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Само администратор може да сменя роли
create or replace function public.protect_profile_role()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null           -- от SQL Editor (без вход) е позволено
     and not public.is_admin() then
    raise exception 'Само администратор може да променя роли';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Публикация от проверен профил/админ → одобрена веднага; от жител → чака одобрение
create or replace function public.set_moderation_on_insert()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    return new; -- вмъкване от SQL Editor / сървъра: оставяме както е подадено
  end if;
  new.author_id := auth.uid();
  if public.is_verified_or_admin() then
    new.status := 'approved';
  else
    new.status := 'pending';
  end if;
  return new;
end;
$$;

create trigger posts_moderation
  before insert on public.posts
  for each row execute function public.set_moderation_on_insert();

create trigger events_moderation
  before insert on public.events
  for each row execute function public.set_moderation_on_insert();

-- Дата на публикуване, когато новина/обява стане одобрена
create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger posts_published_at
  before insert or update on public.posts
  for each row execute function public.set_published_at();

-- ---------- Сигурност на ниво ред (RLS) ----------

alter table public.profiles           enable row level security;
alter table public.alerts             enable row level security;
alter table public.events             enable row level security;
alter table public.posts              enable row level security;
alter table public.reports            enable row level security;
alter table public.push_subscriptions enable row level security;

-- Профили: всеки вижда имената (за подпис под публикациите); всеки редактира своя
create policy profiles_select_all on public.profiles
  for select using (true);
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- Аларми: всички виждат; пускат само проверени профили и админ
create policy alerts_select_all on public.alerts
  for select using (true);
create policy alerts_insert_verified on public.alerts
  for insert with check (public.is_verified_or_admin() and author_id = auth.uid());
create policy alerts_update_author_or_admin on public.alerts
  for update using (author_id = auth.uid() or public.is_admin());
create policy alerts_delete_admin on public.alerts
  for delete using (public.is_admin());

-- Събития: одобрените са публични; авторът вижда своите; админ вижда всичко
create policy events_select_approved on public.events
  for select using (status = 'approved' or author_id = auth.uid() or public.is_admin());
create policy events_insert_signed_in on public.events
  for insert with check (auth.uid() is not null);
create policy events_update_admin on public.events
  for update using (public.is_admin());
create policy events_delete_author_or_admin on public.events
  for delete using (author_id = auth.uid() or public.is_admin());

-- Новини и обяви: същите правила като събитията
create policy posts_select_approved on public.posts
  for select using (status = 'approved' or author_id = auth.uid() or public.is_admin());
create policy posts_insert_signed_in on public.posts
  for insert with check (auth.uid() is not null);
create policy posts_update_admin on public.posts
  for update using (public.is_admin());
create policy posts_delete_author_or_admin on public.posts
  for delete using (author_id = auth.uid() or public.is_admin());

-- Доклади: всеки влязъл може да докладва; вижда своите; админ вижда и обработва всички
create policy reports_insert_signed_in on public.reports
  for insert with check (reporter_id = auth.uid());
create policy reports_select_own_or_admin on public.reports
  for select using (reporter_id = auth.uid() or public.is_admin());
create policy reports_update_admin on public.reports
  for update using (public.is_admin());

-- push_subscriptions: без публични правила — достъп само от сървъра (Фаза 6)

-- ---------- Достъп през API ----------
-- (RLS правилата отгоре решават кои редове; тук казваме кои таблици)

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.alerts, public.events, public.posts to anon, authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.alerts, public.events, public.posts to authenticated;
grant insert, select, update on public.reports to authenticated;
