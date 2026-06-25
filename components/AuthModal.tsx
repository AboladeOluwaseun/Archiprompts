"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignedIn: (email: string) => void;
}

export default function AuthModal({
  open,
  onClose,
  onSignedIn,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const sb = getSupabaseBrowser();
  const demoMode = !sb;

  const handleGoogleSignIn = async () => {
    if (!sb) {
      setError("Google auth requires a configured Supabase backend.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/builder`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    }
  };

  // Email/password flow is preserved in this component for later use,
  // but the current UI exposes Google auth only.

  return (
    <div
      className="modal-wrap open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={{ maxWidth: 420 }}>
        <button className="m-close" onClick={onClose}>
          ×
        </button>

        <div className="m-head">
          <h2>
            Sign in to{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              ArchiPrompts
            </span>
          </h2>
          <p>Continue with Google to access your account.</p>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <button
            type="button"
            className="pay-btn"
            onClick={handleGoogleSignIn}
            disabled={loading || demoMode}
            style={{ width: "100%" }}
          >
            {loading ? "Loading..." : "Continue with Google"}
          </button>
          <button
            type="button"
            className="btn-sm secondary"
            style={{ width: "100%", marginTop: 12 }}
            onClick={onClose}
            disabled={loading}
          >
            Continue as guest
          </button>
        </div>

        {error && (
          <div
            style={{
              color: "var(--warn)",
              fontSize: 13,
              padding: "0 24px",
              marginTop: -8,
            }}
          >
            {error}
          </div>
        )}

        <div className="m-foot">
          <p>
            Powered by Supabase Auth · <span>Google sign-in</span>
          </p>
        </div>
      </div>
    </div>
  );
}
