-- Persist the uploaded Revit/SketchUp/3ds Max reference image too, not
-- just the rendered output — so loading a saved prompt from Archive can
-- restore the actual model reference into the Model Upload section,
-- not just the text settings. Reuses the existing "renders" bucket.
-- Run this once in the Supabase dashboard SQL editor, same as 0001-0004.

alter table public.prompt_history
  add column if not exists reference_image_url text;
