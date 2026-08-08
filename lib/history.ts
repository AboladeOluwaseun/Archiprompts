import { getSupabaseBrowser } from "./supabase";
import { PromptFormData, DEFAULT_FORM_DATA, AiTool, BuilderMode } from "./types";
import { CAMERA_ANGLES, INTERIOR_CAMERA_ANGLES, shortLabel } from "./formOptions";

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
  project_name: string | null;
  rendered_image_url: string | null;
  reference_image_url: string | null;
  created_at: string;
}

function buildSummary(form: PromptFormData): string {
  if (form.builderMode === "interior") {
    const angle = shortLabel(form.interiorCameraAngle, INTERIOR_CAMERA_ANGLES);
    return (
      [form.roomType, form.interiorStyle, angle].filter(Boolean).join(" · ") ||
      "Interior render"
    );
  }
  const angle = shortLabel(form.cameraAngle, CAMERA_ANGLES);
  return (
    [form.buildingType, form.archStyle, angle].filter(Boolean).join(" · ") ||
    "Exterior render"
  );
}

export async function saveHistoryEntry(
  form: PromptFormData,
  promptText: string,
  projectName?: string,
): Promise<string | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;

  const { data, error } = await sb
    .from("prompt_history")
    .insert({
      builder_mode: form.builderMode,
      ai_tool: form.aiTool,
      summary: buildSummary(form),
      prompt_text: promptText,
      form_snapshot: form,
      project_name: projectName?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[History] save failed", error);
    return null;
  }

  return data?.id ?? null;
}

export async function fetchHistory(limit = 30): Promise<HistoryEntry[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];

  const { data, error } = await sb
    .from("prompt_history")
    .select("id, builder_mode, ai_tool, summary, prompt_text, form_snapshot, project_name, rendered_image_url, reference_image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[History] fetch failed", error);
    return [];
  }

  return (data as HistoryEntry[]) || [];
}

export async function fetchHistoryEntryById(id: string): Promise<HistoryEntry | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;

  const { data, error } = await sb
    .from("prompt_history")
    .select("id, builder_mode, ai_tool, summary, prompt_text, form_snapshot, project_name, rendered_image_url, reference_image_url, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.warn("[History] fetch by id failed", error);
    return null;
  }

  return data as HistoryEntry;
}

export async function updateHistoryProjectName(
  id: string,
  projectName: string,
): Promise<boolean> {
  const sb = getSupabaseBrowser();
  if (!sb) return false;

  // Supabase/PostgREST returns no error when an update matches zero rows
  // (e.g. RLS silently filters the row out) — `.select()` forces it to
  // return the affected row(s) so a silent no-op can actually be told
  // apart from a real success, instead of reporting false confidence.
  const { data, error } = await sb
    .from("prompt_history")
    .update({ project_name: projectName.trim() || null })
    .eq("id", id)
    .select("id");

  if (error) {
    console.warn("[History] project rename failed", error);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn(
      "[History] project rename matched no rows — check the update RLS policy (migration 0004) is applied",
      id,
    );
    return false;
  }

  return true;
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
