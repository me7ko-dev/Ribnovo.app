-- =====================================================================
-- Рибново — примерни данни (за проба). Пуска се след 0001_init.sql.
-- Датите са спрямо „сега“, за да има винаги предстоящи събития.
-- Можете да го пуснете отново: първо изтрива старите примерни данни.
-- =====================================================================

delete from public.alerts;
delete from public.events;
delete from public.posts;

-- ---------- Аларми ----------
insert into public.alerts (category, title, body, is_important, expected_until, resolved_at, created_at) values
  ('utilities', 'Спиране на водата в горната махала',
   'Поради авария на главния водопровод няма да има вода в горната част на селото. Екипът на ВиК работи по отстраняването.',
   true, now() + interval '4 hours', null, now() - interval '40 minutes'),
  ('road', 'Заледен участък по пътя за Гоце Делчев',
   'Шофирайте внимателно след завоя при моста. Опесъчаването е започнало.',
   false, null, null, now() - interval '3 hours'),
  ('utilities', 'Планирано спиране на тока',
   'Енергото извърши ремонт на трафопоста. Токът е възстановен.',
   false, null, now() - interval '1 day', now() - interval '1 day 6 hours');

-- ---------- Събития ----------
insert into public.events (title, description, location, starts_at, ends_at, category, status) values
  ('Сбор на селото', 'Традиционният сбор с музика, хоро и курбан за здраве.', 'Централния площад',
   (date_trunc('day', now() at time zone 'Europe/Sofia') at time zone 'Europe/Sofia') + interval '2 days 11 hours', (date_trunc('day', now() at time zone 'Europe/Sofia') at time zone 'Europe/Sofia') + interval '2 days 18 hours', 'events', 'approved'),
  ('Родителска среща', 'Среща с родителите на учениците от 1. до 7. клас.', 'Училището',
   (date_trunc('day', now() at time zone 'Europe/Sofia') at time zone 'Europe/Sofia') + interval '3 days 17 hours', null, 'events', 'approved'),
  ('Помен (примерно събитие)', 'Близките канят всички на помен в памет на своя близък.', 'Дома на семейството',
   (date_trunc('day', now() at time zone 'Europe/Sofia') at time zone 'Europe/Sofia') + interval '4 days 12 hours', null, 'memorial', 'approved'),
  ('Футбол: Рибново – Вълкосел', 'Приятелски мач. Елате да подкрепите отбора!', 'Стадиона',
   (date_trunc('day', now() at time zone 'Europe/Sofia') at time zone 'Europe/Sofia') + interval '6 days 16 hours', null, 'events', 'approved'),
  ('Сватбен ден в традиционни носии', 'Открита репетиция на рибновската сватба за гости на селото.', 'Читалището',
   (date_trunc('day', now() at time zone 'Europe/Sofia') at time zone 'Europe/Sofia') + interval '9 days 10 hours', null, 'events', 'approved');

-- ---------- Новини и обяви ----------
insert into public.posts (kind, title, body, status, published_at) values
  ('news', 'Започва ремонтът на улицата към училището',
   'От понеделник започва полагането на нов асфалт. Движението ще бъде ограничено за около две седмици.',
   'approved', now() - interval '2 hours'),
  ('news', 'Читалището набира деца за фолклорния състав',
   'Записванията са всеки делничен ден от 16 до 18 часа в читалището. Възраст от 7 до 14 години.',
   'approved', now() - interval '1 day'),
  ('ad', 'Продавам дърва за огрев',
   'Бук и дъб, нарязани и нацепени. Доставка в рамките на селото. Тел. 0888 000 000.',
   'approved', now() - interval '2 days'),
  ('news', 'Благодарност към доброволците',
   'Благодарим на всички, които помогнаха за почистването на реката в събота!',
   'approved', now() - interval '4 days');
