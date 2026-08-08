"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      const email = data.session?.user?.email ?? null;
      setUserEmail(email);
      if (email) router.replace("/builder");
    };
    load();
  }, [router]);

  const sb = getSupabaseBrowser();
  const demoMode = !sb;

  const handleGoogleSignIn = async () => {
    if (!sb) {
      setError("Google sign-in requires a configured Supabase backend.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: authError } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/builder` },
    });
    setLoading(false);
    if (authError) setError(authError.message);
  };

  if (userEmail) return null;

  return (
    <div className="account-page">
      <div className="page-toolbar account-toolbar">
        <Link href="/builder" className="projects-back">
          ← Back to builder
        </Link>
        <ThemeToggle />
      </div>
      <div className="account-copy">
        <div className="lineage-eyebrow">ACCOUNT</div>
        <h1 className="account-title">
          An account keeps your prompts. It does not cost anything.
        </h1>
        <p className="lineage-sub">
          Any prompts you built before signing up stay in this browser and move across
          when you create the account. Nothing is lost by having waited.
        </p>
        <div className="account-value-list">
          <div className="account-value-row">
            <span>Unlimited prompts, both modes</span>
            <span className="account-value-tag">FREE</span>
          </div>
          <div className="account-value-row">
            <span>Archive, restorable form state</span>
            <span className="account-value-tag">FREE</span>
          </div>
          <div className="account-value-row">
            <span className="dim">Render Preview and Refine</span>
            <span className="account-value-tag accent">PAID</span>
          </div>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-title">Continue with Google</div>
        <p className="account-card-sub">
          No card, no trial countdown. Rendering is the only thing that ever asks for
          payment.
        </p>
        <button
          type="button"
          className="pay-btn"
          onClick={handleGoogleSignIn}
          disabled={loading || demoMode}
          style={{ width: "100%" }}
        >
          {loading ? "Loading…" : "Continue with Google"}
        </button>
        <Link href="/builder" className="btn-sm secondary account-guest-link">
          Continue as guest
        </Link>
        {error && <div className="render-error">{error}</div>}
      </div>
    </div>
  );
}
