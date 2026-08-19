-- ==============================================================================
-- Strawberry Lemonade - Completed Tasks & Metadata Schema for Supabase
-- ==============================================================================

-- 1. Create the `completed_tasks` table
create table if not exists public.completed_tasks (
    id text primary key,
    text text not null,
    category text not null default 'personal',
    completed boolean not null default true,
    completed_at timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    metadata jsonb default '{}'::jsonb
);

-- 2. Create index on completed_at and category for fast querying and analytics
create index if not exists idx_completed_tasks_completed_at on public.completed_tasks (completed_at desc);
create index if not exists idx_completed_tasks_category on public.completed_tasks (category);

-- 3. Enable Row Level Security (RLS)
alter table public.completed_tasks enable row level security;

-- 4. Create RLS policies
-- (Allows public read, insert, update, and delete for client anon key)
create policy "Allow public read completed_tasks"
    on public.completed_tasks
    for select
    using (true);

create policy "Allow public insert completed_tasks"
    on public.completed_tasks
    for insert
    with check (true);

create policy "Allow public update completed_tasks"
    on public.completed_tasks
    for update
    using (true)
    with check (true);

create policy "Allow public delete completed_tasks"
    on public.completed_tasks
    for delete
    using (true);

-- 5. Helpful comment for metadata documentation
comment on column public.completed_tasks.metadata is 'Stores task metadata such as device, completion time-of-day, priority, tags, or day of week';
