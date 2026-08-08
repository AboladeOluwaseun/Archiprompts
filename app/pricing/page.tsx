"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";

const PLANS = [
  {
    name: "FREE",
    tag: "",
    price: "$0",
    per: "",
    sub: "3 prompts, then sign-in required",
    feats: [
      "Full prompt builder, both modes",
      "Quick Start presets",
      "Copy to any AI tool",
      "No Render Preview",
    ],
    cta: "Current plan",
    plan: null as null | "monthly" | "yearly",
  },
  {
    name: "MONTHLY",
    tag: "",
    price: "$8",
    per: "/ month",
    sub: "30-day access, renewed manually",
    feats: [
      "Unlimited prompts",
      "Render Preview — gpt-image-2",
      "Refine This Render",
      "Version history",
      "Cross-render consistency",
    ],
    cta: "Pay with Paystack",
    plan: "monthly" as const,
  },
  {
    name: "YEARLY",
    tag: "BEST VALUE",
    price: "$100",
    per: "/ year",
    sub: "365-day access, renewed manually",
    feats: [
      "Everything in Monthly",
      "2 months free vs. paying monthly",
      "Priority on new render features",
      "Beta testers are on this tier",
    ],
    cta: "Pay with Paystack",
    plan: "yearly" as const,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<"monthly" | "yearly" | null>(null);

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
    };
    load();
  }, []);

  const goToUpgrade = (plan: "monthly" | "yearly") => {
    if (!userEmail) {
      setPendingPlan(plan);
      setShowAuth(true);
      return;
    }
    router.push(`/builder/upgrade?plan=${plan}`);
  };

  return (
    <div className="pricing-page">
      <div className="page-toolbar">
        <Link href="/builder" className="projects-back">
          ← Back to builder
        </Link>
        <ThemeToggle />
      </div>

      <div className="lineage-eyebrow">PLANS</div>
      <h1 className="lineage-title">Pay monthly, or pay yearly and save.</h1>
      <p className="lineage-sub">
        Prompt building is free forever. Rendering costs money to run, so it sits
        behind the paid tier.
      </p>

      <div className="pricing-grid">
        {PLANS.map((p) => (
          <div key={p.name} className="pricing-card">
            <div className="pricing-card-head">
              <span className="pricing-card-name">{p.name}</span>
              {p.tag && <span className="pricing-card-tag">{p.tag}</span>}
            </div>
            <div className="pricing-card-price">
              <span className="pricing-card-amount">{p.price}</span>
              <span className="pricing-card-per">{p.per}</span>
            </div>
            <div className="pricing-card-sub">{p.sub}</div>
            <div className="pricing-card-feats">
              {p.feats.map((f) => (
                <div key={f} className="pricing-card-feat">
                  <span className="pricing-card-feat-dot">·</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={p.plan ? "btn-sm" : "btn-sm secondary"}
              disabled={!p.plan}
              onClick={() => p.plan && goToUpgrade(p.plan)}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footnote">
        <span>Paystack · USD · signature-verified webhook</span>
      </div>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSignedIn={(email) => {
          setUserEmail(email);
          setShowAuth(false);
          if (pendingPlan) router.push(`/builder/upgrade?plan=${pendingPlan}`);
        }}
      />
    </div>
  );
}
