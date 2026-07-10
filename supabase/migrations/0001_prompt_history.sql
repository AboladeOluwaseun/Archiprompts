-- Prompt History
--
-- Persists each generated prompt per signed-in user so "unlimited" Pro
-- access accumulates something durable instead of vanishing on refresh.
-- Run this once in the Supabase dashboard SQL editor (this repo has no
-- CLI/migration runner wired up — profiles/payments/prompt_options were
-- created the same way).

create table if not exists public.prompt_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  builder_mode text not null,
  ai_tool text not null,
  summary text not null,
  prompt_text text not null,
  form_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists prompt_history_user_id_created_at_idx
  on public.prompt_history (user_id, created_at desc);

alter table public.prompt_history enable row level security;

create policy "Users can view own prompt history"
  on public.prompt_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own prompt history"
  on public.prompt_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own prompt history"
  on public.prompt_history for delete
  using (auth.uid() = user_id);
