import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase";

/**
 * Shared Pro-gating for anything that spends real OpenAI image credit
 * (initial render, refinement). Verifies the Bearer token server-side —
 * not just in the UI — against a live Supabase session + profile plan.
 */

export interface RenderAccessResult {
  ok: boolean;
  reason?: string;
  userId?: string;
  supabase?: SupabaseClient;
}

export async function resolveRenderAccess(
  token: string | null,
): Promise<RenderAccessResult> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { ok: false, reason: "Rendering requires a configured account backend." };
  }
  if (!token) {
    return { ok: false, reason: "Sign in with a Pro account to render previews." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return { ok: false, reason: "Your session has expired — please sign in again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    return { ok: false, reason: "Upgrade to Pro to render preview images." };
  }

  if (profile.plan === "free" || !profile.plan) {
    return { ok: false, reason: "Upgrade to Pro to render preview images." };
  }

  if (profile.plan === "monthly" && profile.plan_expires_at) {
    if (new Date(profile.plan_expires_at) < new Date()) {
      return { ok: false, reason: "Your Pro plan has expired — renew to keep rendering previews." };
    }
  }

  return { ok: true, userId: userData.user.id, supabase };
}
