-- Render Variants
--
-- Every render and every refine now creates a NEW row here instead of
-- overwriting the previous image, so past versions can be browsed and
-- compared instead of being silently replaced. `prompt_history.
-- rendered_image_url` keeps pointing at the latest variant (so Archive's
-- existing thumbnail/restore logic needs no changes), while this table
-- holds the full chain. Written only by the server (service role) —
-- no insert/update policy needed, just select for the browser client
-- to list them.
-- Run this once in the Supabase dashboard SQL editor, same as 0001-0005.

create table if not exists public.render_variants (
  id uuid primary key default gen_random_uuid(),
  history_id uuid not null references public.prompt_history(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  image_url text not null,
  label text not null default 'Render',
  parent_variant_id uuid references public.render_variants(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists render_variants_history_id_idx
  on public.render_variants (history_id, created_at);

alter table public.render_variants enable row level security;

create policy "Users can view own render variants"
  on public.render_variants for select
  using (auth.uid() = user_id);
