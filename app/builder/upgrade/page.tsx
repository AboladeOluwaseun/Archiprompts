"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import { chargeWithPaystack, grantProAccess } from "@/lib/paystack";

const PLAN_DETAILS = {
  monthly: {
    label: "MONTHLY",
    price: "₦100",
    amount: 100,
    per: "for 30 days · renewed manually",
    note: "This is not a subscription. Access stops after 30 days unless you pay again — nothing is charged automatically.",
  },
  lifetime: {
    label: "LIFETIME",
    price: "₦25,000",
    amount: 25000,
    per: "once · permanent access",
    note: "One payment. No renewal, no subscription to cancel, and no price change if the plan price moves later.",
  },
};

function UpgradePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = searchParams.get("plan") === "lifetime" ? "lifetime" : "monthly";
  const plan = PLAN_DETAILS[planKey];

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState("");

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
    };
    load();
  }, []);

  const handlePay = () => {
    if (!userEmail) {
      router.push("/pricing");
      return;
    }
    setError(null);
    const result = chargeWithPaystack({
      plan: planKey,
      amount: plan.amount,
      email: userEmail,
      onSuccess: async () => {
        const ok = await grantProAccess(planKey, userEmail);
        if (ok) {
          setReference("AP_" + Date.now().toString(36).toUpperCase());
          setPaid(true);
        } else {
          setError("Payment succeeded but activating your plan failed — contact support with your payment reference.");
        }
      },
    });
    if (!result.ok) setError(result.error);
  };

  if (paid) {
    return (
      <div className="theme-paper">
      <div className="upgrade-page">
        <div className="lineage-eyebrow accent">PAID · STEP 2 OF 2</div>
        <h1 className="lineage-title">Render Preview is on.</h1>
        <p className="lineage-sub">
          The prompt you were blocked on is still in the builder exactly as you left it.
          Generating it is the obvious next thing to do.
        </p>
        <div className="upgrade-receipt">
          <div className="upgrade-receipt-row">
            <span>Reference</span>
            <span>{reference}</span>
          </div>
          <div className="upgrade-receipt-row">
            <span>Plan</span>
            <span>{plan.label}</span>
          </div>
          <div className="upgrade-receipt-row">
            <span>Amount</span>
            <span>{plan.price}</span>
          </div>
          <div className="upgrade-receipt-row">
            <span>Status</span>
            <span>Confirmed</span>
          </div>
        </div>
        <Link href="/builder" className="btn-sm">
          Back to the builder
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className="theme-paper">
    <div className="upgrade-page">
      <div className="lineage-eyebrow">CONFIRM · STEP 1 OF 2</div>
      <h1 className="lineage-title">Check this before you pay.</h1>

      <div className="upgrade-confirm-card">
        <div className="upgrade-confirm-head">
          <div>
            <div className="upgrade-confirm-plan">{plan.label}</div>
            <div className="upgrade-confirm-per">{plan.per}</div>
          </div>
          <div className="upgrade-confirm-price">{plan.price}</div>
        </div>
        <p className="upgrade-confirm-note">{plan.note}</p>
        <div className="upgrade-confirm-meta">
          <div>
            <span>Charged in</span>
            <span>NGN, by Paystack</span>
          </div>
          <div>
            <span>Renders included</span>
            <span>unlimited, fair-use</span>
          </div>
          <div>
            <span>Refund window</span>
            <span>7 days</span>
          </div>
        </div>
      </div>

      {error && <div className="render-error">{error}</div>}

      <div className="upgrade-actions">
        <button type="button" className="btn-sm" onClick={handlePay}>
          Pay {plan.price} with Paystack
        </button>
        <Link href="/pricing" className="copy-btn">
          Back to plans
        </Link>
      </div>
      <div className="upgrade-footnote">
        You&apos;ll land on Paystack&apos;s page next. Card details never touch our servers.
      </div>
    </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradePageInner />
    </Suspense>
  );
}
