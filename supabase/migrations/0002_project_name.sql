-- Project Name (lightweight grouping for prompt history)
--
-- Lets a user tag saved prompts with a project name (e.g. "Villa A") so
-- multiple views/rooms of the same building can be found and reused
-- together in the Archive, instead of scrolling through one flat list.
-- Run this once in the Supabase dashboard SQL editor, same as 0001.

alter table public.prompt_history
  add column if not exists project_name text;

create index if not exists prompt_history_user_project_idx
  on public.prompt_history (user_id, project_name);
