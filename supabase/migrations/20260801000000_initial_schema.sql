-- Мини-CRM: безопасная модель, разграничение ролей и аудит переходов статуса.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) > 0),
  role text not null check (role in ('manager', 'executor')),
  created_at timestamptz not null default now()
);

create table public.construction_objects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  address text not null check (char_length(trim(address)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text not null check (char_length(trim(description)) > 0),
  object_id uuid not null references public.construction_objects(id) on delete restrict,
  assignee_id uuid not null references public.profiles(id) on delete restrict,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  status text not null default 'new' check (status in ('new', 'in_progress', 'in_review', 'accepted', 'rework')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  changed_by uuid not null references public.profiles(id) on delete restrict,
  from_status text check (from_status is null or from_status in ('new', 'in_progress', 'in_review', 'accepted', 'rework')),
  to_status text not null check (to_status in ('new', 'in_progress', 'in_review', 'accepted', 'rework')),
  comment text,
  created_at timestamptz not null default now()
);

create index tasks_assignee_id_idx on public.tasks(assignee_id);
create index tasks_object_id_idx on public.tasks(object_id);
create index task_status_history_task_id_idx on public.task_status_history(task_id, created_at);

create or replace function public.current_user_role()
returns text
language sql stable security definer
set search_path = pg_catalog, public
as $$ select p.role from public.profiles p where p.id = (select auth.uid()) $$;
revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;
comment on function public.current_user_role() is 'Возвращает роль из доверенного профиля без рекурсивного обращения RLS-политик.';

create or replace function public.can_access_profile(p_profile_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.profiles target
    where target.id = p_profile_id
      and (
        target.id = (select auth.uid())
        or public.current_user_role() = 'manager'
        or exists (
          select 1 from public.tasks t
          where t.assignee_id = (select auth.uid())
            and (t.assignee_id = target.id or t.author_id = target.id)
        )
      )
  )
$$;
revoke all on function public.can_access_profile(uuid) from public;
grant execute on function public.can_access_profile(uuid) to authenticated;
comment on function public.can_access_profile(uuid) is 'Без рекурсии RLS проверяет доступ к своему профилю, профилям manager и участников назначенных задач.';

create or replace function public.can_access_task(p_task_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.tasks t
    where t.id = p_task_id
      and (public.current_user_role() = 'manager' or t.assignee_id = (select auth.uid()))
  )
$$;
revoke all on function public.can_access_task(uuid) from public;
grant execute on function public.can_access_task(uuid) to authenticated;
comment on function public.can_access_task(uuid) is 'Проверка видимости задачи для истории без рекурсивных RLS-политик.';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.write_task_history()
returns trigger
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  actor_id uuid;
  status_comment text;
begin
  actor_id := auth.uid();
  if tg_op = 'INSERT' then
    actor_id := new.author_id;
    if actor_id is null then
      raise exception using errcode = '28000', message = 'Требуется авторизация для создания задачи.';
    end if;
    insert into public.task_status_history(task_id, changed_by, from_status, to_status)
    values (new.id, actor_id, null, new.status);
  elsif old.status is distinct from new.status then
    if actor_id is null then
      raise exception using errcode = '28000', message = 'Требуется авторизация для изменения статуса.';
    end if;
    status_comment := nullif(current_setting('app.task_status_comment', true), '');
    insert into public.task_status_history(task_id, changed_by, from_status, to_status, comment)
    values (new.id, actor_id, old.status, new.status, status_comment);
  end if;
  return new;
end;
$$;

create trigger construction_objects_touch_updated_at before update on public.construction_objects
for each row execute function public.touch_updated_at();
create trigger tasks_touch_updated_at before update on public.tasks
for each row execute function public.touch_updated_at();
create trigger tasks_write_history after insert or update of status on public.tasks
for each row execute function public.write_task_history();

alter table public.profiles enable row level security;
alter table public.construction_objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

create policy profiles_select_self_or_manager on public.profiles
for select to authenticated using ((select public.can_access_profile(id)));
create policy construction_objects_select_visible on public.construction_objects
for select to authenticated using (
  (select public.current_user_role()) = 'manager'
  or exists (select 1 from public.tasks t where t.object_id = construction_objects.id and t.assignee_id = (select auth.uid()))
);
create policy construction_objects_manager_insert on public.construction_objects
for insert to authenticated with check ((select public.current_user_role()) = 'manager');
create policy construction_objects_manager_update on public.construction_objects
for update to authenticated using ((select public.current_user_role()) = 'manager')
with check ((select public.current_user_role()) = 'manager');
create policy construction_objects_manager_delete on public.construction_objects
for delete to authenticated using ((select public.current_user_role()) = 'manager');

create policy tasks_select_visible on public.tasks
for select to authenticated using (
  (select public.current_user_role()) = 'manager' or assignee_id = (select auth.uid())
);
create policy tasks_manager_insert on public.tasks
for insert to authenticated with check (
  (select public.current_user_role()) = 'manager'
  and author_id = (select auth.uid())
  and status = 'new'
  and exists (select 1 from public.profiles p where p.id = assignee_id and p.role = 'executor')
);
create policy tasks_manager_update on public.tasks
for update to authenticated using ((select public.current_user_role()) = 'manager')
with check ((select public.current_user_role()) = 'manager');
create policy tasks_manager_delete on public.tasks
for delete to authenticated using ((select public.current_user_role()) = 'manager');
create policy task_status_history_select_visible on public.task_status_history
for select to authenticated using ((select public.can_access_task(task_id)));

-- Сначала отозвать табличные права целиком, включая стандартные права роли Supabase.
revoke all on public.profiles, public.construction_objects, public.tasks, public.task_status_history from anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.construction_objects to authenticated;
grant select, delete on public.tasks to authenticated;
grant insert (title, description, object_id, assignee_id) on public.tasks to authenticated;
grant update (title, description, object_id, assignee_id) on public.tasks to authenticated;
grant select on public.task_status_history to authenticated;
-- Изменение профилей и назначение ролей выполняет администратор через SQL Editor.
-- authenticated не получает ни INSERT, ни UPDATE, ни DELETE на task_status_history.

create or replace function public.transition_task_status(
  p_task_id uuid,
  p_new_status text,
  p_comment text default null
)
returns void
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  actor_id uuid := auth.uid();
  actor_role text;
  current_status text;
  assignee uuid;
  valid_transition boolean := false;
begin
  if actor_id is null then
    raise exception using errcode = '28000', message = 'Требуется войти в систему.';
  end if;
  select p.role into actor_role from public.profiles p where p.id = actor_id;
  if actor_role is null then
    raise exception using errcode = '42501', message = 'Профиль пользователя не найден.';
  end if;
  select t.status, t.assignee_id into current_status, assignee
  from public.tasks t where t.id = p_task_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Задача не найдена.';
  end if;

  if actor_role = 'executor' and assignee = actor_id then
    valid_transition := (current_status = 'new' and p_new_status = 'in_progress')
      or (current_status = 'in_progress' and p_new_status = 'in_review')
      or (current_status = 'rework' and p_new_status = 'in_progress');
  elsif actor_role = 'manager' then
    valid_transition := (current_status = 'in_review' and p_new_status in ('accepted', 'rework'));
  end if;

  if not valid_transition then
    raise exception using errcode = '42501', message = 'Переход запрещён для вашей роли или текущего статуса.';
  end if;
  if current_status = 'in_review' and p_new_status = 'rework' and nullif(trim(p_comment), '') is null then
    raise exception using errcode = '22023', message = 'При возврате на доработку необходимо указать комментарий.';
  end if;

  -- Передаём комментарий транзакционному trigger; приложение не может задавать автора истории.
  perform set_config('app.task_status_comment', coalesce(p_comment, ''), true);
  update public.tasks set status = p_new_status where id = p_task_id;
  perform set_config('app.task_status_comment', '', true);
end;
$$;
revoke all on function public.transition_task_status(uuid, text, text) from public;
grant execute on function public.transition_task_status(uuid, text, text) to authenticated;
comment on function public.transition_task_status(uuid, text, text) is 'Проверяет роль, назначение и конечный автомат; смена статуса и аудит атомарны.';

commit;
