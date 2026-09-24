-- =====================================================================
-- Рибново — Фаза 2+: профилни снимки, снимки към публикации,
-- харесвания, коментари, доклади за коментари.
-- Пуска се веднъж в Supabase → SQL Editor, след 0001_init.sql.
-- =====================================================================

-- ---------- Нови колони ----------

alter table public.profiles add column avatar_url text;

alter table public.events add column image_url text;

alter table public.posts
  add column like_count    integer not null default 0,
  add column comment_count integer not null default 0;

-- Докладване и на коментари
alter table public.reports drop constraint reports_target_type_check;
alter table public.reports
  add constraint reports_target_type_check
  check (target_type in ('post', 'event', 'alert', 'comment'));

-- Само администраторът дава „организация“ (напр. „Кметство Рибново“),
-- защото тя се показва с отметка за проверен профил.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role
      or new.organization is distinct from old.organization)
     and auth.uid() is not null           -- от SQL Editor (без вход) е позволено
     and not public.is_admin() then
    raise exception 'Само администратор може да променя роли и организации';
  end if;
  return new;
end;
$$;

-- При регистрация с телефон няма име — оставяме празно, попълва се после
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''));
  return new;
end;
$$;

-- ---------- Харесвания ----------

create table public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index post_likes_user_idx on public.post_likes (user_id);

-- ---------- Коментари ----------

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index comments_post_idx on public.comments (post_id, created_at);

-- ---------- Броячи (обновяват се автоматично) ----------

create or replace function public.update_post_counters()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  delta integer := case when tg_op = 'INSERT' then 1 else -1 end;
  target uuid := case when tg_op = 'INSERT' then new.post_id else old.post_id end;
begin
  if tg_table_name = 'post_likes' then
    update public.posts set like_count = greatest(like_count + delta, 0) where id = target;
  else
    update public.posts set comment_count = greatest(comment_count + delta, 0) where id = target;
  end if;
  return null;
end;
$$;

create trigger post_likes_counter
  after insert or delete on public.post_likes
  for each row execute function public.update_post_counters();

create trigger comments_counter
  after insert or delete on public.comments
  for each row execute function public.update_post_counters();

-- Може да се харесва и коментира само одобрена публикация
create or replace function public.is_approved_post(p uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.posts where id = p and status = 'approved')
$$;

-- ---------- Правила за достъп ----------

alter table public.post_likes enable row level security;
alter table public.comments   enable row level security;

create policy post_likes_select_all on public.post_likes
  for select using (true);
create policy post_likes_insert_own on public.post_likes
  for insert with check (user_id = auth.uid() and public.is_approved_post(post_id));
create policy post_likes_delete_own on public.post_likes
  for delete using (user_id = auth.uid());

create policy comments_select_all on public.comments
  for select using (true);
create policy comments_insert_own on public.comments
  for insert with check (author_id = auth.uid() and public.is_approved_post(post_id));
create policy comments_delete_own_or_admin on public.comments
  for delete using (author_id = auth.uid() or public.is_admin());

-- Админът може да скрива (изтрива) и публикации/събития при доклад — вече е разрешено в 0001.

grant select on public.post_likes, public.comments to anon, authenticated;
grant insert, delete on public.post_likes, public.comments to authenticated;

-- ---------- Снимки (Supabase Storage) ----------

-- Публична папка „images“: всеки вижда снимките; качва само влязъл потребител,
-- и то само в своя подпапка (<id на потребителя>/...). До 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy images_insert_own_folder on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy images_delete_own_folder on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
