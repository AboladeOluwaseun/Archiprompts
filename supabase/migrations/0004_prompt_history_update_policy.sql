-- Allow a user to rename the project tag on their own saved prompts.
--
-- 0001 only granted select/insert/delete — renaming a project after the
-- fact (the common case: you generate first, then decide to tag it)
-- needs an update policy for the browser client to do it directly.
-- Run this once in the Supabase dashboard SQL editor, same as 0001-0003.

create policy "Users can update own prompt history"
  on public.prompt_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
