"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RenderVariant } from "@/lib/renderVariants";

type FailureType = "timeout" | "reference" | "plan" | "cancelled" | "generic" | null;

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
  failureType: FailureType;
  onCancelRender: () => void;
  onRetryRender: () => void;
  onRenderPreview: () => void;
  referenceImageName: string | null;
  projectRefsUsed: number;
  historyEntryId: string | null;
  refining: boolean;
  refineError: string | null;
  onRefine: (instructions: string) => void;
  variants: RenderVariant[];
  activeVariantId: string | null;
  onSelectVariant: (variant: RenderVariant) => void;
  aiTools: { id: string; name: string }[];
  aiTool: string;
  onAiToolChange: (id: string) => void;
  onGenerate: () => void;
  onSave: () => void;
  saveLabel: string;
}

const STAGE_LABELS = ["Queued at OpenAI", "Encoding the prompt", "Generating", "Upscaling"];

const FAILS: Record<
  Exclude<FailureType, null>,
  { tag: string; title: string; body: string; meta: string; primary: string; secondary: string }
> = {
  timeout: {
    tag: "MODEL TIMEOUT",
    title: "gpt-image-2 did not answer within 60 seconds.",
    body:
      "Nothing was charged — this app never charges per render. This is load at the model provider rather than anything in your prompt, so a second attempt usually goes through.",
    meta: "no charge · prompt saved",
    primary: "Try again",
    secondary: "Back to the prompt",
  },
  reference: {
    tag: "REFERENCE REJECTED",
    title: "Your reference image came back unusable.",
    body:
      "The model returned it as unreadable. Rendering without it would give you a different building, so it stopped rather than guess.",
    meta: "no charge · geometry lock unavailable",
    primary: "Replace the reference",
    secondary: "Render text-to-image anyway",
  },
  plan: {
    tag: "PLAN REQUIRED",
    title: "Render Preview needs an active plan.",
    body:
      "The prompt is yours either way — copy it into any tool. In-app rendering calls a paid model, so it's gated on the server, not just here.",
    meta: "no charge",
    primary: "View plans",
    secondary: "Back to the prompt",
  },
  cancelled: {
    tag: "CANCELLED",
    title: "You stopped this render.",
    body: "Cancelling before the image returns costs nothing, and the form is untouched. Generating again sends the same prompt.",
    meta: "no charge",
    primary: "Generate again",
    secondary: "Back to the prompt",
  },
  generic: {
    tag: "RENDER FAILED",
    title: "Something went wrong generating this image.",
    body: "No charge on a failed render. Try again, or copy the prompt and use it directly in another tool.",
    meta: "no charge",
    primary: "Try again",
    secondary: "Back to the prompt",
  },
};

// Quick-add atmospheric touches — the exact kind of post-render staging
// a tester asked for (god rays, people, a LUT) without needing to know
// how to phrase it. Free text below covers anything not listed here.
const REFINE_QUICK_ADDS = [
  { label: "God rays", value: "Add dramatic volumetric god rays streaming through the windows" },
  { label: "People", value: "Add 1-2 people naturally positioned in the space, appropriately dressed and scaled" },
  { label: "Warm LUT", value: "Apply a warm, golden cinematic color grade" },
  { label: "Cool LUT", value: "Apply a cool, blue-toned cinematic color grade" },
  { label: "Greenery", value: "Add a few potted plants or greenery naturally placed in the space" },
  { label: "Depth of field", value: "Add a subtle depth-of-field blur to the background" },
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
  failureType,
  onCancelRender,
  onRetryRender,
  onRenderPreview,
  referenceImageName,
  projectRefsUsed,
  historyEntryId,
  refining,
  refineError,
  onRefine,
  variants,
  activeVariantId,
  onSelectVariant,
  aiTools,
  aiTool,
  onAiToolChange,
  onGenerate,
  onSave,
  saveLabel,
}: OutputPanelProps) {
  const [selectedAdds, setSelectedAdds] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [activeTab, setActiveTab] = useState<"prompt" | "render">("prompt");
  const [refineOpen, setRefineOpen] = useState(false);

  // Local to this component on purpose: this used to live as state in
  // the parent BuilderPage, where every once-a-second tick forced the
  // entire form (all blocks, every select) to re-render for the whole
  // 12-40s a render takes — measurably expensive with nothing in that
  // tree memoized, and the likely cause of the page becoming
  // unresponsive right around when a render completes. Keeping it here
  // means a tick only re-renders this panel.
  const [renderElapsed, setRenderElapsed] = useState(0);
  const renderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const renderStage = Math.min(3, Math.floor(renderElapsed / 4));

  useEffect(() => {
    if (rendering) {
      setRenderElapsed(0);
      renderTimerRef.current = setInterval(() => {
        setRenderElapsed((prev) => prev + 1);
      }, 1000);
    } else if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current);
      renderTimerRef.current = null;
    }
    return () => {
      if (renderTimerRef.current) {
        clearInterval(renderTimerRef.current);
        renderTimerRef.current = null;
      }
    };
  }, [rendering]);

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

  const handleRenderPreviewClick = () => {
    setActiveTab("render");
    onRenderPreview();
  };

  return (
    <div className="out-panel">
      <div className="out-tabs">
        <button
          type="button"
          className={`out-tab${activeTab === "prompt" ? " active" : ""}`}
          onClick={() => setActiveTab("prompt")}
        >
          Prompt
        </button>
        <button
          type="button"
          className={`out-tab${activeTab === "render" ? " active" : ""}`}
          onClick={() => setActiveTab("render")}
        >
          Render{variants.length ? ` · ${variants.length}` : ""}
        </button>
        <select
          className="out-tabs-tool"
          value={aiTool}
          onChange={(e) => onAiToolChange(e.target.value)}
        >
          {aiTools.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="out-panel-body">
      {activeTab === "prompt" && (
        <>
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
                  onClick={handleRenderPreviewClick}
                  disabled={rendering}
                >
                  {rendering
                    ? "Rendering…"
                    : isPro
                      ? "Render Preview"
                      : "Render Preview (Pro)"}
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
        </>
      )}

      {activeTab === "render" && (
        <>
          {rendering && (
            <div className="render-preview render-preview-loading">
              <div className="render-stage-head">
                <div className="render-spinner" />
                <p>{STAGE_LABELS[renderStage]}…</p>
              </div>
              <div className="render-stage-list">
                {STAGE_LABELS.map((label, i) => {
                  const done = i < renderStage;
                  const active = i === renderStage;
                  return (
                    <div key={label} className="render-stage-row">
                      <span
                        className={`render-stage-dot${done ? " done" : ""}${active ? " active" : ""}`}
                      />
                      <span className={`render-stage-label${done || active ? " lit" : ""}`}>
                        {label}
                      </span>
                      <span className="render-stage-note">
                        {done ? "done" : active ? "running" : "queued"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="render-stage-foot">
                <span className="cc">{renderElapsed}s elapsed · typical 12–40s</span>
                <button type="button" className="refine-drawer-close" onClick={onCancelRender}>
                  Cancel · no charge
                </button>
              </div>
            </div>
          )}

          {!rendering && failureType && (
            <div className="failure-card">
              <div className="failure-tag">{FAILS[failureType].tag}</div>
              <div className="failure-title">{FAILS[failureType].title}</div>
              <p className="failure-body">{FAILS[failureType].body}</p>
              <div className="failure-meta">{FAILS[failureType].meta}</div>
              <div className="failure-actions">
                <button
                  type="button"
                  className="btn-sm"
                  onClick={
                    failureType === "plan"
                      ? onUpgrade
                      : failureType === "reference"
                        ? () => setActiveTab("prompt")
                        : onRetryRender
                  }
                >
                  {FAILS[failureType].primary}
                </button>
                <button type="button" className="copy-btn" onClick={() => setActiveTab("prompt")}>
                  {FAILS[failureType].secondary}
                </button>
              </div>
              {renderError && failureType === "generic" && (
                <div className="render-error">{renderError}</div>
              )}
            </div>
          )}

          {!rendering && !failureType && !renderedImage && (
            <div className="render-empty">
              <div className="render-empty-box" />
              <div className="render-empty-note">
                {output
                  ? "No render yet. Generating uses gpt-image-2 and costs real credit — roughly $0.05 an image."
                  : "Generate a prompt on the Prompt tab, then Render Preview to see it here."}
              </div>
            </div>
          )}

          {!rendering && !failureType && renderedImage && (
            <div className="render-preview">
              <img src={renderedImage} alt="AI-rendered architectural preview" />
              <div className="render-badges">
                {activeVariant && <span className="render-badge">{activeVariant.label}</span>}
                <span className="render-badge">
                  {referenceImageName ? `GEOMETRY LOCKED · ${referenceImageName}` : "TEXT-TO-IMAGE · NO REFERENCE"}
                </span>
                {projectRefsUsed > 0 && (
                  <span className="render-badge accent">+{projectRefsUsed} PROJECT REFS</span>
                )}
              </div>
              <div className="render-actions-row">
                <a
                  className="render-download"
                  href={renderedImage}
                  download="archiprompts-preview.png"
                >
                  Download PNG
                </a>
                <button
                  type="button"
                  className="render-download"
                  onClick={() => setRefineOpen((prev) => !prev)}
                >
                  {refineOpen ? "Close refine" : "Refine this render"}
                </button>
                {historyEntryId && (
                  <Link
                    href={`/builder/versions?entry=${historyEntryId}`}
                    className="render-download"
                  >
                    Lineage →
                  </Link>
                )}
              </div>

              {refineOpen && (
                <div className="refine-section">
                  <div className="refine-label">
                    Refine {activeVariant?.label || "This Render"}
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
                    {refining ? "Refining…" : "Apply — new version"}
                  </button>
                </div>
              )}

              {variants.length > 1 && (
                <div className="render-versions-strip">
                  <div className="render-versions-head">
                    <span className="cc">VERSIONS</span>
                    {historyEntryId && (
                      <Link href={`/builder/versions?entry=${historyEntryId}`} className="see-lineage-link">
                        See lineage →
                      </Link>
                    )}
                  </div>
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
                </div>
              )}
            </div>
          )}
        </>
      )}

      </div>

      <div className="out-panel-footer">
        <button
          type="button"
          className={`gen-btn${isLocked ? " locked" : ""}`}
          onClick={isLocked ? onUpgrade : onGenerate}
        >
          {isLocked ? "Upgrade to generate more" : "Generate — new prompt"}
        </button>
        <button type="button" className="out-panel-save-btn" onClick={onSave}>
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
