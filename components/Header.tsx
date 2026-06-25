interface HeaderProps {
  remaining: number;
  isPro: boolean;
  onUpgrade: () => void;
  userEmail?: string | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export default function Header({
  remaining,
  isPro,
  onUpgrade,
  userEmail,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="hdr">
      <div className="logo">
        <div className="logo-icon">A</div>
        <div className="logo-text">
          Archi<span>Prompts</span>
        </div>
        <span className="ver">v2</span>
      </div>
      <div className="hdr-right">
        <div className={`badge${remaining === 0 && !isPro ? " dim" : ""}`}>
          {isPro
            ? "✦ Pro — Unlimited"
            : `${remaining} free prompt${remaining !== 1 ? "s" : ""} remaining`}
        </div>
        {!isPro && (
          <button className="btn-sm" onClick={onUpgrade}>
            Upgrade →
          </button>
        )}
        {userEmail ? (
          <button
            className="btn-sm"
            onClick={onSignOut}
            style={{ marginLeft: 8 }}
            title={userEmail}
          >
            Sign Out
          </button>
        ) : null}
      </div>
    </header>
  );
}
