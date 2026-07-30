-- Persist the actual rendered preview image, not just the text prompt.
--
-- Adds a column to store the Storage public URL for a render, and
-- creates the public "renders" bucket that /api/render uploads to
-- (using the service role key, so no storage RLS policy is needed —
-- the server bypasses RLS for both the upload and the row update).
-- Run this once in the Supabase dashboard SQL editor, same as 0001/0002.

alter table public.prompt_history
  add column if not exists rendered_image_url text;

insert into storage.buckets (id, name, public)
values ('renders', 'renders', true)
on conflict (id) do nothing;
