"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { PromptFormData, AiTool, BuilderMode, DEFAULT_FORM_DATA } from "@/lib/types";
import { buildPrompt } from "@/lib/promptEngine";
import { getSupabaseBrowser } from "@/lib/supabase";
import { DEFAULT_BUILDER_OPTIONS, BuilderOptions } from "@/lib/formOptions";

import SelectField from "@/components/SelectField";
import ChipGroup from "@/components/ChipGroup";
import ToolCard from "@/components/ToolCard";
import OutputPanel from "@/components/OutputPanel";
import PricingModal from "@/components/PricingModal";
import AuthModal from "@/components/AuthModal";

const FREE_LIMIT = 3;
const ANON_PROMPT_KEY = "archiprompts-anon-used";

const AI_TOOLS: { id: AiTool; name: string; desc: string }[] = [
  { id: "chatgpt", name: "ChatGPT / DALL·E", desc: "GPT-4o · image gen" },
  { id: "midjourney", name: "Midjourney", desc: "/imagine · v6.1" },
  { id: "nanobanana", name: "Nano Banana", desc: "Google AI · Gemini" },
  { id: "stable", name: "Stable Diffusion", desc: "SDXL · neg prompt" },
  { id: "firefly", name: "Adobe Firefly", desc: "Firefly 3 · reference" },
];

export default function Home() {
  const [form, setForm] = useState<PromptFormData>(DEFAULT_FORM_DATA);
  const [output, setOutput] = useState("");
  const [used, setUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payEmail, setPayEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDebug, setSessionDebug] = useState("checking auth...");
  const [options, setOptions] = useState<BuilderOptions>(
    DEFAULT_BUILDER_OPTIONS,
  );
  const [generatingSection, setGeneratingSection] = useState<
    keyof BuilderOptions | null
  >(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    buildingTypes,
    archStyles,
    floors,
    buildingForms,
    wallFinishes,
    accentMaterials,
    facadeElements,
    finWidths,
    finHeights,
    finMaterials,
    finSpacings,
    slabDepths,
    slabFinishes,
    windowTypes,
    glazingTints,
    roofStyles,
    lightingMoods,
    landscapes,
    cameraAngles,
    // Interior
    roomTypes,
    interiorStyles,
    furnitureLayouts,
    interiorWallFinishes,
    floorMaterials,
    ceilingTypes,
    interiorLightings,
    colorTemps,
    interiorCameraAngles,
    timeOfDays,
    windowViews,
  } = options;

  const isInterior = form.builderMode === 'interior';

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setLoading(false);
      return;
    }

    const loadProfile = async (session: Session | null) => {
      if (!session?.user?.email) {
        setSessionDebug("no active session");
        setUserEmail(null);
        setIsPro(false);
        setUsed(0);
        setLoading(false);
        return;
      }

      const email = session.user.email;
      setSessionDebug(`session active: ${email}`);
      setUserEmail(email);
      setPayEmail(email);
      setShowAuth(false);

      const { data: profile, error } = await sb
        .from("profiles")
        .select("plan, plan_expires_at, prompts_used")
        .eq("id", session.user.id)
        .single();

      if (error || !profile) {
        setUserEmail(email);
        setIsPro(false);
        setUsed(0);
        setLoading(false);
        return;
      }

      setUsed(profile.prompts_used);

      if (profile.plan === "free") {
        setIsPro(false);
      } else if (profile.plan === "monthly" && profile.plan_expires_at) {
        const expired = new Date(profile.plan_expires_at) < new Date();
        setIsPro(!expired);
      } else {
        setIsPro(true);
      }

      setLoading(false);
    };

    // Listen for auth state changes
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        loadProfile(session);
      },
    );

    // Check existing session on mount
    sb.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        loadProfile(session);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch("/api/options");
        if (!response.ok) return;
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.warn("[Options] failed to load", error);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userEmail) return;

    const stored = window.localStorage.getItem(ANON_PROMPT_KEY);
    if (stored) {
      setUsed(Math.min(FREE_LIMIT, Number(stored) || 0));
    }
  }, [userEmail]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ── Form Helpers ──────────────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof PromptFormData>(key: K, value: PromptFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleChip = useCallback(
    (key: "buildingForm" | "roofStyle" | "lightMood" | "interiorStyle" | "colorTemp" | "timeOfDay", value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleMultiChip = useCallback((value: string) => {
    setForm((prev) => {
      const arr = prev.facadeElements;
      return {
        ...prev,
        facadeElements: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }, []);

  // ── Derived State ─────────────────────────────────────────────
  const hasFins = form.facadeElements.some((v) => v.includes("vertical fins"));
  const hasSlabs = form.facadeElements.some((v) => v.includes("slab"));
  const remaining = Math.max(0, FREE_LIMIT - used);
  const isLocked = !isPro && used >= FREE_LIMIT;

  // ── Actions ───────────────────────────────────────────────────
  const handleGenerate = () => {
    if (isLocked) {
      if (!userEmail) {
        setShowAuth(true);
      } else {
        setShowModal(true);
      }
      return;
    }

    const prompt = buildPrompt(form);
    setOutput(prompt);

    if (!isPro) {
      const newUsed = used + 1;
      setUsed(newUsed);

      if (userEmail) {
        const sb = getSupabaseBrowser();
        if (sb) {
          sb.from("profiles")
            .update({ prompts_used: newUsed })
            .eq("email", userEmail)
            .then(({ error }: { error: Error | null }) => {
              if (error)
                console.warn("[Supabase] Prompt counter update failed:", error);
            });
        }
      } else if (typeof window !== "undefined") {
        window.localStorage.setItem(ANON_PROMPT_KEY, String(newUsed));
      }
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGenerateOptions = async (section: keyof BuilderOptions) => {
    setGeneratingSection(section);

    try {
      const response = await fetch(`/api/options/generate?section=${section}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch generated options for ${section}`);
      }

      const data = (await response.json()) as Array<{
        label: string;
        value: string;
      }>;

      if (!Array.isArray(data) || data.length === 0) return;

      setOptions((prev) => {
        const current = prev[section] as Array<{
          label: string;
          value: string;
        }>;
        const merged = [...data, ...current];
        const unique = merged.filter(
          (item, index, all) =>
            all.findIndex((candidate) => candidate.value === item.value) ===
            index,
        );

        return {
          ...prev,
          [section]: unique as typeof current,
        };
      });
    } catch (error) {
      console.warn("[Options] generate failed", error);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handlePayment = (plan: string, amount: number) => {
    if (!userEmail) {
      alert(
        "Please sign in before upgrading.\n\nYou must use an account to complete the purchase.",
      );
      setShowAuth(true);
      return;
    }

    const email = payEmail.trim();
    if (!email || !email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey || paystackKey.startsWith("pk_test_xxxx")) {
      // Demo mode — no Paystack configured
      alert(
        "⚙️ Demo Mode\n\nTo accept real payments:\n1. Sign up at paystack.com\n2. Get your Public Key from Settings → API Keys\n3. Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local\n\nSimulating successful payment now...",
      );
      grantAccess(plan, email);
      return;
    }

    // Real Paystack Inline JS popup
    const w = window as unknown as Record<string, unknown>;
    if (typeof w.PaystackPop === "undefined") {
      alert("Paystack script not loaded. Please refresh and try again.");
      return;
    }
    const PaystackPop = w.PaystackPop as {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
    const handler = PaystackPop.setup({
      key: paystackKey,
      email,
      amount: amount * 100, // convert to kobo
      currency: "NGN",
      ref:
        "AP_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      metadata: {
        plan,
        custom_fields: [
          { display_name: "Plan", variable_name: "plan", value: plan },
        ],
      },
      callback: (response: { reference: string }) => {
        console.log("[Paystack] Payment success:", response.reference);
        grantAccess(plan, email);
      },
      onClose: () => {
        console.log("[Paystack] Payment popup closed.");
      },
    });
    handler.openIframe();
  };

  const grantAccess = (plan: string, email: string) => {
    setIsPro(true);
    setShowModal(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 7000);

    // Update profile in Supabase (profile already exists from auth trigger)
    const sb = getSupabaseBrowser();
    if (sb) {
      const planExpiresAt =
        plan === "monthly"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      sb.from("profiles")
        .update({
          plan,
          plan_expires_at: planExpiresAt,
          prompts_used: 0, // reset counter on upgrade
        })
        .eq("email", email)
        .then(({ error }: { error: Error | null }) => {
          if (error) console.warn("[Supabase] Profile update failed:", error);
          else {
            setUsed(0); // sync local state
            console.log("[Supabase] Profile upgraded to", plan);
          }
        });
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <div className="builder-shell">
        <header className="builder-topbar">
          <div className="builder-brand">
            <div className="builder-brand-logo">AP</div>
            <div>
              <div className="builder-brand-name">ArchiPrompts</div>
              <div className="builder-brand-sub">
                Architect AI Prompt Builder
              </div>
            </div>
          </div>

          <div className="builder-topbar-actions">
            <nav className="builder-nav-links">
              <a href="#">Models</a>
              <a href="#">Archive</a>
              <a href="#">Teams</a>
            </nav>
            <button
              className="btn-sm"
              onClick={() => {
                if (!userEmail) {
                  setShowAuth(true);
                  return;
                }
                if (isPro) return;
                setShowModal(true);
              }}
              disabled={isPro}
            >
              {!userEmail
                ? "Sign in to Upgrade"
                : isPro
                  ? "Pro Active"
                  : "Upgrade"}
            </button>
            <div className="profile-container" ref={profileMenuRef} style={{ position: "relative" }}>
              <button
                className="avatar-btn"
                title={userEmail ?? "Continue as guest"}
                onClick={() => {
                  if (!userEmail) {
                    setShowAuth(true);
                  } else {
                    setShowProfileMenu((prev) => !prev);
                  }
                }}
              >
                {userEmail ? userEmail.charAt(0).toUpperCase() : "G"}
              </button>
              {showProfileMenu && userEmail && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-arrow" />
                  <div className="profile-dropdown-user">
                    <div className="profile-dropdown-avatar">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-dropdown-info">
                      <span className="profile-email">{userEmail}</span>
                      <span className="profile-plan-badge">{isPro ? "PRO MEMBER" : "FREE ACCOUNT"}</span>
                    </div>
                  </div>
                  
                  <div className="profile-dropdown-stats">
                    <div className="profile-stat-row">
                      <span>Prompts used</span>
                      <strong>{isPro ? "Unlimited" : `${used} / ${FREE_LIMIT}`}</strong>
                    </div>
                  </div>
                  
                  <button
                    className="profile-dropdown-signout"
                    onClick={() => {
                      setShowProfileMenu(false);
                      const sb = getSupabaseBrowser();
                      if (sb) {
                        sb.auth.signOut().then(() => {
                          setUserEmail(null);
                          setIsPro(false);
                          setUsed(0);
                        });
                      }
                    }}
                  >
                    <svg className="signout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="builder-grid">
          <section className="builder-form-column">
            <div className="builder-summary-card">
              <div className="builder-summary-meta">
                Architecture-first prompt workflow
              </div>
              <h1>Architectural Prompt Engine</h1>
              <p className="builder-summary-copy">
                Build architectural image prompts with a clear
                program-to-massing workflow. Keep the AI aligned to context,
                form, materiality, lighting, and camera in one focused builder.
              </p>
            </div>

            {/* ── MODE SWITCHER ── */}
            <div className="mode-switcher">
              <button
                className={`mode-tab${!isInterior ? ' active' : ''}`}
                onClick={() => updateField('builderMode', 'exterior' as BuilderMode)}
              >
                <span className="mode-tab-icon">🏛️</span>
                <span className="mode-tab-label">
                  <span className="mode-tab-name">Exterior</span>
                  <span className="mode-tab-sub">Facade &amp; Massing</span>
                </span>
              </button>
              <button
                className={`mode-tab${isInterior ? ' active' : ''}`}
                onClick={() => updateField('builderMode', 'interior' as BuilderMode)}
              >
                <span className="mode-tab-icon">🛋️</span>
                <span className="mode-tab-label">
                  <span className="mode-tab-name">Interior</span>
                  <span className="mode-tab-sub">Rooms &amp; Spaces</span>
                </span>
              </button>
            </div>

            {!isInterior && (
              <div className="mode-section-fade">
                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block A / Program &amp; Context</h2>
                      <p>
                        Define the project program, context, style, and scale for a
                        strong architectural prompt foundation.
                      </p>
                    </div>
                  </div>

                  <div className="two-col">
                    <SelectField
                      label="Building Type"
                      value={form.buildingType}
                      onChange={(v) => updateField("buildingType", v)}
                      options={buildingTypes}
                    />
                    <SelectField
                      label="Architectural Style"
                      value={form.archStyle}
                      onChange={(v) => updateField("archStyle", v)}
                      options={archStyles}
                    />
                  </div>

                  <div className="two-col">
                    <SelectField
                      label="Number of Floors"
                      value={form.floors}
                      onChange={(v) => updateField("floors", v)}
                      options={floors}
                    />
                    <div className="fg">
                      <div className="toggle-row">
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={form.revitMode}
                            onChange={(e) =>
                              updateField("revitMode", e.target.checked)
                            }
                          />
                          <span className="toggle-slider" />
                        </label>
                        <div>
                          <div className="toggle-label">Revit Model Mode</div>
                          <div className="toggle-sub">
                            Enhanced geometry processing for Revit-aligned prompts.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block B / Massing &amp; Envelope</h2>
                      <p>
                        Choose the overall massing, organization, and envelope
                        strategy that defines the building form.
                      </p>
                    </div>
                  </div>

                  <div className="fg">
                    <label>Building Form</label>
                    <ChipGroup
                      options={buildingForms}
                      selected={form.buildingForm}
                      onToggle={(v) => toggleChip("buildingForm", v)}
                    />
                  </div>
                  <div className="fg">
                    <label>Geometry Notes</label>
                    <textarea
                      placeholder="e.g. building has a recessed entrance portico, double-height lobby, or cantilevered volume..."
                      value={form.massingNotes}
                      onChange={(e) => updateField("massingNotes", e.target.value)}
                    />
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block C / Materiality &amp; Surface</h2>
                      <p>
                        Define the primary façade palette and accent surfaces for
                        the building envelope.
                      </p>
                    </div>
                  </div>

                  <div className="two-col">
                    <SelectField
                      label="Primary Wall Finish"
                      value={form.wallFinish}
                      onChange={(v) => updateField("wallFinish", v)}
                      options={wallFinishes}
                    />
                    <SelectField
                      label="Accent Material"
                      value={form.accentMat}
                      onChange={(v) => updateField("accentMat", v)}
                      options={accentMaterials}
                    />
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block D / Façade Systems</h2>
                      <p>
                        Choose visible façade systems and tune vertical shading and
                        slab expression.
                      </p>
                    </div>
                  </div>

                  <div className="fg">
                    <label>Select Facade Elements</label>
                    <div className="hint">
                      Vertical fins are locked as SOLID OPAQUE elements to prevent
                      glass misinterpretation.
                    </div>
                    <ChipGroup
                      options={facadeElements}
                      selected={form.facadeElements}
                      onToggle={toggleMultiChip}
                      multi
                    />
                  </div>

                  {hasFins && (
                    <div className="builder-subgrid">
                      <SelectField
                        label="Fin Width"
                        value={form.finWidth}
                        onChange={(v) => updateField("finWidth", v)}
                        options={finWidths}
                      />
                      <SelectField
                        label="Fin Height"
                        value={form.finHeight}
                        onChange={(v) => updateField("finHeight", v)}
                        options={finHeights}
                      />
                      <SelectField
                        label="Fin Material"
                        value={form.finMaterial}
                        onChange={(v) => updateField("finMaterial", v)}
                        options={finMaterials}
                      />
                      <SelectField
                        label="Fin Spacing"
                        value={form.finSpacing}
                        onChange={(v) => updateField("finSpacing", v)}
                        options={finSpacings}
                      />
                    </div>
                  )}

                  {hasSlabs && (
                    <div className="builder-subgrid">
                      <SelectField
                        label="Slab Depth"
                        value={form.slabDepth}
                        onChange={(v) => updateField("slabDepth", v)}
                        options={slabDepths}
                      />
                      <SelectField
                        label="Slab Finish"
                        value={form.slabFinish}
                        onChange={(v) => updateField("slabFinish", v)}
                        options={slabFinishes}
                      />
                    </div>
                  )}
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block E / Glazing &amp; Openings</h2>
                      <p>
                        Define window systems and glazing tint to shape facade
                        transparency and light quality.
                      </p>
                    </div>
                  </div>

                  <div className="two-col">
                    <SelectField
                      label="Window Type"
                      value={form.windows}
                      onChange={(v) => updateField("windows", v)}
                      options={windowTypes}
                    />
                    <SelectField
                      label="Glazing Tint"
                      value={form.glazingTint}
                      onChange={(v) => updateField("glazingTint", v)}
                      options={glazingTints}
                    />
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block F / Roof Form</h2>
                      <p>
                        Choose a roof typology that supports the massing and site
                        strategy.
                      </p>
                    </div>
                  </div>

                  <div className="fg">
                    <ChipGroup
                      options={roofStyles}
                      selected={form.roofStyle}
                      onToggle={(v) => toggleChip("roofStyle", v)}
                    />
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block G / Atmosphere &amp; Optics</h2>
                      <p>
                        Set the lighting mood, landscape context, and camera angle
                        to define the final image atmosphere.
                      </p>
                    </div>
                  </div>

                  <div className="fg">
                    <label>Lighting Mood</label>
                    <ChipGroup
                      options={lightingMoods}
                      selected={form.lightMood}
                      onToggle={(v) => toggleChip("lightMood", v)}
                    />
                  </div>
                  <div className="two-col">
                    <SelectField
                      label="Landscape / Context"
                      value={form.landscape}
                      onChange={(v) => updateField("landscape", v)}
                      options={landscapes}
                    />
                    <SelectField
                      label="Camera Angle"
                      value={form.cameraAngle}
                      onChange={(v) => updateField("cameraAngle", v)}
                      options={cameraAngles}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ INTERIOR FORM BLOCKS ═══════════════ */}
            {isInterior && (
              <div className="mode-section-fade">
                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block I-A / Room &amp; Style</h2>
                      <p>
                        Select the room type and define the interior design
                        direction for this visualization.
                      </p>
                    </div>
                  </div>

                  {form.revitMode && (
                    <div className="interior-model-lock-notice">
                      <strong>⚠ Revit / Model Lock Active</strong>
                      Upload your Revit or SketchUp model screenshot alongside this prompt.
                      The geometry lock instruction will be embedded — the AI will preserve
                      all room proportions, openings, and structural elements exactly as modelled.
                    </div>
                  )}

                  <div className="two-col">
                    <SelectField
                      label="Room Type"
                      value={form.roomType}
                      onChange={(v) => updateField("roomType", v)}
                      options={roomTypes}
                    />
                    <div className="fg">
                      <div className="toggle-row">
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={form.revitMode}
                            onChange={(e) =>
                              updateField("revitMode", e.target.checked)
                            }
                          />
                          <span className="toggle-slider" />
                        </label>
                        <div>
                          <div className="toggle-label">Model Lock Mode</div>
                          <div className="toggle-sub">
                            Geometry locked to uploaded Revit / SketchUp model.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fg">
                    <label>Interior Design Style</label>
                    <ChipGroup
                      options={interiorStyles}
                      selected={form.interiorStyle}
                      onToggle={(v) => toggleChip("interiorStyle", v)}
                    />
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block I-B / Materials &amp; Furniture</h2>
                      <p>
                        Specify interior surfaces and furniture layout to define
                        the material character and spatial composition.
                      </p>
                    </div>
                  </div>

                  <div className="two-col">
                    <SelectField
                      label="Interior Wall Finish"
                      value={form.interiorWallFinish}
                      onChange={(v) => updateField("interiorWallFinish", v)}
                      options={interiorWallFinishes}
                    />
                    <SelectField
                      label="Floor Material"
                      value={form.floorMaterial}
                      onChange={(v) => updateField("floorMaterial", v)}
                      options={floorMaterials}
                    />
                  </div>
                  <div className="fg">
                    <SelectField
                      label="Furniture Layout"
                      value={form.furnitureLayout}
                      onChange={(v) => updateField("furnitureLayout", v)}
                      options={furnitureLayouts}
                    />
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block I-C / Ceiling &amp; Lighting</h2>
                      <p>
                        Configure the ceiling typology, lighting character, and colour
                        temperature to set the mood of the space.
                      </p>
                    </div>
                  </div>

                  <div className="two-col">
                    <SelectField
                      label="Ceiling Type"
                      value={form.ceilingType}
                      onChange={(v) => updateField("ceilingType", v)}
                      options={ceilingTypes}
                    />
                    <SelectField
                      label="Interior Lighting"
                      value={form.interiorLighting}
                      onChange={(v) => updateField("interiorLighting", v)}
                      options={interiorLightings}
                    />
                  </div>
                  <div className="fg">
                    <label>Colour Temperature</label>
                    <ChipGroup
                      options={colorTemps}
                      selected={form.colorTemp}
                      onToggle={(v) => toggleChip("colorTemp", v)}
                    />
                  </div>
                </div>

                <div className="builder-card">
                  <div className="builder-card-header">
                    <div>
                      <h2>Block I-D / Camera &amp; Atmosphere</h2>
                      <p>
                        Set the time of day, camera composition, and exterior
                        view through the windows.
                      </p>
                    </div>
                  </div>

                  <div className="fg">
                    <label>Time of Day</label>
                    <ChipGroup
                      options={timeOfDays}
                      selected={form.timeOfDay}
                      onToggle={(v) => toggleChip("timeOfDay", v)}
                    />
                  </div>
                  <div className="two-col">
                    <SelectField
                      label="Camera Angle"
                      value={form.interiorCameraAngle}
                      onChange={(v) => updateField("interiorCameraAngle", v)}
                      options={interiorCameraAngles}
                    />
                    <SelectField
                      label="Window / Exterior View"
                      value={form.windowView}
                      onChange={(v) => updateField("windowView", v)}
                      options={windowViews}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── SHARED: AI Tool + Design Intent ── */}
            <div className="builder-card">
              <div className="builder-card-header">
                <div>
                  <h2>Block H / Output &amp; AI Target</h2>
                  <p>
                    Choose the output style and target AI tool for the final
                    prompt format.
                  </p>
                </div>
              </div>

              <div className="tools">
                {AI_TOOLS.map((t) => (
                  <ToolCard
                    key={t.id}
                    tool={t}
                    active={form.aiTool === t.id}
                    onClick={() => updateField("aiTool", t.id)}
                  />
                ))}
              </div>
            </div>

            <div className="builder-card">
              <div className="builder-card-header">
                <div>
                  <h2>Design Intent &amp; Notes</h2>
                  <p>
                    Add optional narrative, client requirements, or constraints
                    to sharpen the prompt toward your design goals.
                  </p>
                </div>
              </div>

              <div className="fg">
                <textarea
                  placeholder={isInterior
                    ? "Specify atmosphere, client brief, special material requirements, or spatial sequence notes..."
                    : "Specify atmospheric conditions, context, or site-specific requirements..."
                  }
                  value={form.extraNotes}
                  onChange={(e) => updateField("extraNotes", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <button
              className={`gen-btn${isLocked ? " locked" : ""}`}
              onClick={isLocked ? () => setShowModal(true) : handleGenerate}
            >
              {isLocked
                ? "🔒 Upgrade to Generate More"
                : "✦ Generate Precise Prompt"}
            </button>
          </section>

          <aside className="builder-sidebar">
            <div className="builder-card builder-output-card">
              <div className="builder-card-header">
                <div>
                  <h2>Console / Output</h2>
                  <p>
                    Review the generated prompt and copy it for your AI tool.
                  </p>
                </div>
              </div>

              <OutputPanel
                output={output}
                copied={copied}
                isLocked={isLocked}
                used={used}
                isPro={isPro}
                freeLimit={FREE_LIMIT}
                onCopy={handleCopy}
                onUpgrade={() => {
                  if (!userEmail) {
                    setShowAuth(true);
                    return;
                  }
                  setShowModal(true);
                }}
              />
            </div>

            <div className="builder-status-card">
              <h3>Membership Status</h3>
              <p>
                {isPro
                  ? `Pro account active — unlimited ${isInterior ? 'interior' : 'exterior'} rendering prompts and access to the full command set.`
                  : `Free account — limited to 3 prompts. Upgrade for unlimited prompt generation and premium ${isInterior ? 'interior' : 'facade'} controls.`}
              </p>
              <div className="status-row">
                <span>Prompt allowance</span>
                <strong>
                  {isPro ? "Unlimited" : `${remaining} / ${FREE_LIMIT}`}
                </strong>
              </div>
              <div className="status-row" style={{ marginTop: 10 }}>
                <span>Active mode</span>
                <strong style={{ textTransform: 'capitalize' }}>
                  {form.builderMode} render
                </strong>
              </div>
              {form.revitMode && (
                <div className="builder-warning">
                  ⚠ {isInterior ? 'MODEL LOCK ACTIVE' : 'REVIT MODE ACTIVE'}: Upload your model screenshot alongside
                  this prompt for optimal {isInterior ? 'spatial geometry' : 'structural'} alignment.
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>

      <PricingModal
        open={showModal}
        email={payEmail}
        userEmail={userEmail}
        onEmailChange={setPayEmail}
        onPayment={handlePayment}
        onClose={() => setShowModal(false)}
      />

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSignedIn={(email) => {
          setUserEmail(email);
          setPayEmail(email);
        }}
      />
    </>
  );
}
