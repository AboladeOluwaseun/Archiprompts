"use client";

import { useState } from "react";
import { RenderVariant } from "@/lib/renderVariants";

interface OutputPanelProps {
  output: string;
  copied: boolean;
  isLocked: boolean;
  used: number;
  isPro: boolean;
  freeLimit: number;
  onCopy: () => void;
  onUpgrade: () => void;
  renderedImage: string | null;
  rendering: boolean;
  renderError: string | null;
  onRenderPreview: () => void;
  refining: boolean;
  refineError: string | null;
  onRefine: (instructions: string) => void;
  variants: RenderVariant[];
  activeVariantId: string | null;
  onSelectVariant: (variant: RenderVariant) => void;
}

// Quick-add atmospheric touches — the exact kind of post-render staging
// a tester asked for (god rays, people, a LUT) without needing to know
// how to phrase it. Free text below covers anything not listed here.
const REFINE_QUICK_ADDS = [
  { label: "☀️ God Rays", value: "Add dramatic volumetric god rays streaming through the windows" },
  { label: "🧍 Add People", value: "Add 1-2 people naturally positioned in the space, appropriately dressed and scaled" },
  { label: "🌇 Warm Cinematic LUT", value: "Apply a warm, golden cinematic color grade" },
  { label: "❄️ Cool Cinematic LUT", value: "Apply a cool, blue-toned cinematic color grade" },
  { label: "🌿 Add Greenery", value: "Add a few potted plants or greenery naturally placed in the space" },
  { label: "🎞️ Depth of Field", value: "Add a subtle depth-of-field blur to the background" },
];

export default function OutputPanel({
  output,
  copied,
  isLocked,
  used,
  isPro,
  freeLimit,
  onCopy,
  onUpgrade,
  renderedImage,
  rendering,
  renderError,
  onRenderPreview,
  refining,
  refineError,
  onRefine,
  variants,
  activeVariantId,
  onSelectVariant,
}: OutputPanelProps) {
  const [selectedAdds, setSelectedAdds] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");

  const activeVariant = variants.find((v) => v.id === activeVariantId);

  const toggleAdd = (value: string) => {
    setSelectedAdds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleRefineClick = () => {
    const instructions = [...selectedAdds, customInstructions.trim()]
      .filter(Boolean)
      .join(". ");
    if (!instructions) return;
    onRefine(instructions);
  };

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
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="copy-btn"
              onClick={onRenderPreview}
              disabled={rendering}
            >
              {rendering ? (
                "Rendering…"
              ) : (
                <>
                  <span className="render-btn-icon" aria-hidden>🖼</span>
                  {isPro ? "Render Preview" : "Render Preview (Pro)"}
                </>
              )}
            </button>
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
        </div>
      )}

      {renderError && <div className="render-error">{renderError}</div>}

      {rendering && !renderedImage && (
        <div className="render-preview render-preview-loading">
          <div className="render-spinner" />
          <p>Rendering preview — this can take 10–20 seconds…</p>
        </div>
      )}

      {renderedImage && (
        <div className="render-preview">
          <img src={renderedImage} alt="AI-rendered architectural preview" />
          <div className="render-actions-row">
            <a
              className="render-download"
              href={renderedImage}
              download="archiprompts-preview.png"
            >
              Download PNG
            </a>
            {activeVariant && (
              <span className="variant-current-label" title={activeVariant.label}>
                Viewing: {activeVariant.label}
              </span>
            )}
          </div>

          {variants.length > 1 && (
            <div className="variant-strip">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  className={`variant-thumb${v.id === activeVariantId ? " active" : ""}`}
                  onClick={() => onSelectVariant(v)}
                  title={v.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.image_url} alt={v.label} />
                  <span className="variant-thumb-index">{i + 1}</span>
                </button>
              ))}
            </div>
          )}

          <div className="refine-section">
            <div className="refine-label">
              Refine This Render
              <span className="refine-sublabel">
                Post-render staging, not a redo — geometry and materials stay locked.
              </span>
            </div>
            <div className="refine-chips">
              {REFINE_QUICK_ADDS.map((opt) => (
                <div
                  key={opt.value}
                  className={`chip${selectedAdds.includes(opt.value) ? " active" : ""}`}
                  onClick={() => toggleAdd(opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
            <textarea
              className="refine-input"
              placeholder="Anything else to add or adjust? e.g. 'make the dining chairs upholstered in navy fabric'"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={2}
            />
            {refineError && <div className="render-error">{refineError}</div>}
            <button
              type="button"
              className="refine-btn"
              onClick={handleRefineClick}
              disabled={
                refining || (selectedAdds.length === 0 && !customInstructions.trim())
              }
            >
              {refining ? "Refining…" : "✦ Refine Render"}
            </button>
          </div>
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
