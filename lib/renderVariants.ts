import { getSupabaseBrowser } from "./supabase";

/**
 * Render Variants
 *
 * Read-side of the version history for a prompt's renders — every
 * render/refine call writes a new row server-side (service role); this
 * just lists them so the builder can show a browsable/comparable strip
 * instead of only ever showing the latest.
 */

export interface RenderVariant {
  id: string;
  history_id: string;
  image_url: string;
  label: string;
  parent_variant_id: string | null;
  created_at: string;
}

export async function fetchRenderVariants(historyId: string): Promise<RenderVariant[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];

  const { data, error } = await sb
    .from("render_variants")
    .select("id, history_id, image_url, label, parent_variant_id, created_at")
    .eq("history_id", historyId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[Variants] fetch failed", error);
    return [];
  }

  return (data as RenderVariant[]) || [];
}
