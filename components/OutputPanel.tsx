interface OutputPanelProps {
  output: string;
  copied: boolean;
  isLocked: boolean;
  used: number;
  isPro: boolean;
  freeLimit: number;
  onCopy: () => void;
  onUpgrade: () => void;
}

export default function OutputPanel({
  output,
  copied,
  isLocked,
  used,
  isPro,
  freeLimit,
  onCopy,
  onUpgrade,
}: OutputPanelProps) {
  return (
    <div className="out-panel">
      <div className="out-lbl fi s3">Generated Prompt</div>
      <div className={`out-box${output ? ' has' : ''}`}>
        {!output ? (
          <div className="out-ph">
            Configure your project settings on the left,
            <br />
            then click <strong>Generate</strong> to build your prompt.
            <br />
            <br />
            Each option addresses a specific AI failure mode
            <br />
            we discovered during testing.
          </div>
        ) : (
          <div className="out-txt">{output}</div>
        )}

        {/* Paywall Overlay */}
        {!isPro && used >= freeLimit && (
          <div className="pw on">
            <div className="pw-lock">🔒</div>
            <div className="pw-title">Free prompts used</div>
            <div className="pw-sub">
              Upgrade to Pro for unlimited prompts, advanced facade controls,
              and all building types.
            </div>
            <button className="btn-sm" onClick={onUpgrade}>
              Upgrade to Pro →
            </button>
          </div>
        )}
      </div>

      {output && (
        <div className="out-foot">
          <span className="cc">{output.length} characters</span>
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={onCopy}
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy Prompt
              </>
            )}
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="tips">
        <h4>Zero Reprompting Tips</h4>
        <p>
          ✦ <strong>Revit Mode:</strong> Upload your Revit screenshot alongside
          the prompt. The AI will lock to your geometry.
        </p>
        <p>
          ✦ <strong>Fins vs Glass:</strong> We lock fins as &ldquo;SOLID OPAQUE&rdquo;
          — AI tools frequently render aluminium fins as glass without this.
        </p>
        <p>
          ✦ <strong>Slab expression:</strong> Deep slabs (800mm+) create dramatic
          shadow lines. Select &ldquo;Deep / Dramatic&rdquo; for this effect.
        </p>
      </div>
    </div>
  );
}
