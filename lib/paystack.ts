import { getSupabaseBrowser } from "./supabase";

/**
 * Shared Paystack checkout + plan-grant logic, extracted so both the
 * builder's legacy pricing modal path and the dedicated /builder/upgrade
 * page trigger the exact same real charge instead of two implementations
 * drifting apart.
 */

export function chargeWithPaystack(opts: {
  plan: string;
  amount: number;
  email: string;
  onSuccess: () => void;
}): { ok: true } | { ok: false; error: string } {
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!paystackKey || paystackKey.startsWith("pk_test_xxxx")) {
    // Demo mode — no Paystack configured; simulate success immediately.
    opts.onSuccess();
    return { ok: true };
  }

  const w = window as unknown as Record<string, unknown>;
  if (typeof w.PaystackPop === "undefined") {
    return { ok: false, error: "Paystack script not loaded. Please refresh and try again." };
  }

  const PaystackPop = w.PaystackPop as {
    setup: (config: Record<string, unknown>) => { openIframe: () => void };
  };
  const handler = PaystackPop.setup({
    key: paystackKey,
    email: opts.email,
    amount: opts.amount * 100, // convert to cents
    currency: "USD",
    ref: "AP_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
    metadata: {
      plan: opts.plan,
      custom_fields: [{ display_name: "Plan", variable_name: "plan", value: opts.plan }],
    },
    callback: (response: { reference: string }) => {
      console.log("[Paystack] Payment success:", response.reference);
      opts.onSuccess();
    },
    onClose: () => {
      console.log("[Paystack] Payment popup closed.");
    },
  });
  handler.openIframe();
  return { ok: true };
}

export async function grantProAccess(plan: string, email: string): Promise<boolean> {
  const sb = getSupabaseBrowser();
  if (!sb) return false;

  const planExpiresAt =
    plan === "monthly"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : plan === "yearly"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null;

  const { error } = await sb
    .from("profiles")
    .update({ plan, plan_expires_at: planExpiresAt, prompts_used: 0 })
    .eq("email", email);

  if (error) {
    console.warn("[Supabase] Profile update failed:", error);
    return false;
  }
  return true;
}
