interface PricingModalProps {
  open: boolean;
  email: string;
  userEmail?: string | null;
  onEmailChange: (email: string) => void;
  onPayment: (plan: string, amount: number) => void;
  onClose: () => void;
}

export default function PricingModal({
  open,
  email,
  userEmail,
  onEmailChange,
  onPayment,
  onClose,
}: PricingModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-wrap open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <button className="m-close" onClick={onClose}>
          ×
        </button>

        <div className="m-head">
          <h2>
            Upgrade to{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Pro
            </span>
          </h2>
          <p>
            Unlimited prompts for all your projects. Advanced facade controls,
            commercial buildings, Revit mode.
          </p>
        </div>

        <div className="p-cards">
          {/* Monthly */}
          <div className="pc">
            <div className="p-name">Monthly</div>
            <div className="p-amt">
              ₦<span>100</span>
            </div>
            <div className="p-per">per month · cancel anytime (test price)</div>
            <ul className="p-feats">
              <li>Unlimited prompt generation</li>
              <li>All building types &amp; styles</li>
              <li>Advanced facade controls</li>
              <li>New categories monthly</li>
              <li>Priority email support</li>
            </ul>
            <button
              className="pay-btn out"
              disabled={!userEmail}
              onClick={() => userEmail && onPayment("monthly", 100)}
            >
              {userEmail ? "Get Monthly Access" : "Sign in to Upgrade"}
            </button>
          </div>

          {/* Lifetime */}
          <div className="pc rec">
            <div className="rec-tag">Best Value</div>
            <div className="p-name">Lifetime</div>
            <div className="p-amt">
              ₦25<span>,000</span>
            </div>
            <div className="p-per">one-time · forever access</div>
            <ul className="p-feats">
              <li>Everything in Monthly</li>
              <li>Lifetime updates free</li>
              <li>Free prompt pack PDF (25 prompts)</li>
              <li>WhatsApp support group</li>
              <li>Early access to new features</li>
            </ul>
            <button
              className="pay-btn"
              disabled={!userEmail}
              onClick={() => userEmail && onPayment("lifetime", 25000)}
            >
              {userEmail ? "Get Lifetime Access" : "Sign in to Upgrade"}
            </button>
          </div>
        </div>

        {!userEmail ? (
          <p
            style={{
              margin: "0 24px 18px",
              color: "var(--warn)",
              fontSize: 13,
            }}
          >
            You need to sign in before upgrading. Use the Sign in button at the
            top to continue.
          </p>
        ) : null}

        <div className="email-sec">
          <input
            type="email"
            placeholder={
              userEmail
                ? "Signed-in email used for payment"
                : "Your email address (required)"
            }
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={Boolean(userEmail)}
          />
        </div>

        {userEmail ? (
          <p
            style={{
              margin: "0 24px 16px",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Signed in as <strong>{userEmail}</strong>. Payment will be applied
            to your account.
          </p>
        ) : null}

        <div className="m-foot">
          <p>
            Secured by Paystack ·{" "}
            <span>Nigerian cards, bank transfer &amp; USSD accepted</span>
          </p>
        </div>
      </div>
    </div>
  );
}
