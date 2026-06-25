import { createBrowserClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/* ─── Browser Client (for use in client components) ──────────── */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY;

  if (!url || !key) return null; // demo mode — no Supabase configured

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

/* ─── Server Client (for use in API routes — service role) ───── */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_KEY;

  if (!url || !key) return null; // demo mode

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/* ─── Helper: check if Supabase is configured ───────────────── */
export function isSupabaseConfigured(): boolean {
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY;
  const secretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_KEY;

  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && publicKey && secretKey);
}
