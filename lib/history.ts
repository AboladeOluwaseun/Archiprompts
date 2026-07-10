import { getSupabaseBrowser } from "./supabase";
import { PromptFormData, DEFAULT_FORM_DATA, AiTool, BuilderMode } from "./types";

/**
 * Prompt History
 *
 * Persists each generated prompt to Supabase (RLS-scoped to the signed-in
 * user) so "unlimited" Pro access actually accumulates something durable
 * instead of every generation vanishing on page refresh. Requires the
 * `prompt_history` table + RLS policies — see the SQL migration handed
 * over alongside this file; it is not created automatically.
 */

export interface HistoryEntry {
  id: string;
  builder_mode: BuilderMode;
  ai_tool: AiTool;
  summary: string;
  prompt_text: string;
  form_snapshot: PromptFormData;
  created_at: string;
}

function buildSummary(form: PromptFormData): string {
  if (form.builderMode === "interior") {
    return [form.roomType, form.interiorStyle].filter(Boolean).join(" · ") || "Interior render";
  }
  return [form.buildingType, form.archStyle].filter(Boolean).join(" · ") || "Exterior render";
}

export async function saveHistoryEntry(
  form: PromptFormData,
  promptText: string,
): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;

  const { error } = await sb.from("prompt_history").insert({
    builder_mode: form.builderMode,
    ai_tool: form.aiTool,
    summary: buildSummary(form),
    prompt_text: promptText,
    form_snapshot: form,
  });

  if (error) {
    console.warn("[History] save failed", error);
  }
}

export async function fetchHistory(limit = 30): Promise<HistoryEntry[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];

  const { data, error } = await sb
    .from("prompt_history")
    .select("id, builder_mode, ai_tool, summary, prompt_text, form_snapshot, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[History] fetch failed", error);
    return [];
  }

  return (data as HistoryEntry[]) || [];
}

export async function deleteHistoryEntry(id: string): Promise<boolean> {
  const sb = getSupabaseBrowser();
  if (!sb) return false;

  const { error } = await sb.from("prompt_history").delete().eq("id", id);
  if (error) {
    console.warn("[History] delete failed", error);
    return false;
  }
  return true;
}

export function hydrateFormSnapshot(snapshot: PromptFormData): PromptFormData {
  return { ...DEFAULT_FORM_DATA, ...snapshot };
}
