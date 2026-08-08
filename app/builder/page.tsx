"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { PromptFormData, AiTool, BuilderMode, DEFAULT_FORM_DATA } from "@/lib/types";
import { buildPrompt } from "@/lib/promptEngine";
import { getSupabaseBrowser } from "@/lib/supabase";
import { DEFAULT_BUILDER_OPTIONS, BuilderOptions } from "@/lib/formOptions";
import { PRESETS, applyPreset, Preset } from "@/lib/presets";

import SelectField from "@/components/SelectField";
import ChipGroup from "@/components/ChipGroup";
import OutputPanel from "@/components/OutputPanel";
import AuthModal from "@/components/AuthModal";
import ModelUpload from "@/components/ModelUpload";
import MaterialAssignmentList from "@/components/MaterialAssignmentList";
import CollapsibleBlock from "@/components/CollapsibleBlock";
import {
  saveHistoryEntry,
  updateHistoryProjectName,
  hydrateFormSnapshot,
  fetchHistoryEntryById,
  HistoryEntry,
} from "@/lib/history";
import { fetchRenderVariants, RenderVariant } from "@/lib/renderVariants";
import {
  summarizeProgramContext,
  summarizeMassing,
  summarizeMateriality,
  summarizeFacadeSystems,
  summarizeGlazing,
  summarizeRoof,
  summarizeAtmosphere,
  summarizeRoomStyle,
  summarizeInteriorMaterials,
  summarizeCeilingLighting,
  summarizeCameraAtmosphere,
  summarizeNotes,
} from "@/lib/blockSummaries";

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
  return (
    <Suspense fallback={null}>
      <BuilderPage />
    </Suspense>
  );
}

function BuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<PromptFormData>(DEFAULT_FORM_DATA);
  const [output, setOutput] = useState("");
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [failureType, setFailureType] = useState<
    "timeout" | "reference" | "plan" | "cancelled" | "generic" | null
  >(null);
  const [renderStage, setRenderStage] = useState(0);
  const [renderElapsed, setRenderElapsed] = useState(0);
  const [projectRefsUsed, setProjectRefsUsed] = useState(0);
  const renderAbortRef = useRef<AbortController | null>(null);
  const renderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [variants, setVariants] = useState<RenderVariant[]>([]);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectNameSaved, setProjectNameSaved] = useState<
    "attached" | "pending" | "failed" | null
  >(null);
  const historyEntryIdRef = useRef<string | null>(null);
  const pendingHistorySaveRef = useRef<Promise<string | null> | null>(null);
  const [used, setUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
  const outputPanelRef = useRef<HTMLElement | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [expandSignal, setExpandSignal] = useState<number | undefined>(undefined);
  const [collapseSignal, setCollapseSignal] = useState<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
      renderAbortRef.current?.abort();
    };
  }, []);

  const toggleAllBlocks = () => {
    if (allOpen) {
      setCollapseSignal((n) => (n ?? 0) + 1);
    } else {
      setExpandSignal((n) => (n ?? 0) + 1);
    }
    setAllOpen((prev) => !prev);
  };

  const {
    buildingTypes,
    archStyles,
    floors,
    buildingForms,
    facadeMaterialOptions,
    facadeZones,
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
    interiorWallZones,
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

  // ── Presets ───────────────────────────────────────────────────
  const handleApplyPreset = useCallback(
    (preset: Preset) => {
      setForm((prev) => applyPreset(preset, prev.aiTool));
      setSelectedPresetId(preset.id);
      setReferenceImage(null);
      setOutput("");
      setRenderedImage(null);
      setRenderError(null);
      setFailureType(null);
      setRefineError(null);
    },
    [],
  );

  // Attaching a reference switches the prompt from text-to-image to
  // image-to-image and adds the GEOMETRY LOCK clause — there's no
  // separate manual toggle, the attachment itself is the switch.
  const handleReferenceChange = useCallback((file: File | null) => {
    setReferenceImage(file);
    setForm((prev) => ({ ...prev, revitMode: !!file }));
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

  const toggleArrayField = useCallback(
    (key: "facadeElements", value: string) => {
      setForm((prev) => {
        const arr = prev[key];
        return {
          ...prev,
          [key]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
        };
      });
    },
    [],
  );

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
        router.push("/pricing");
      }
      return;
    }

    const prompt = buildPrompt(form);
    setOutput(prompt);
    setRenderedImage(null);
    setRenderError(null);
    setFailureType(null);
    setRefineError(null);
    setVariants([]);
    setActiveVariantId(null);
    historyEntryIdRef.current = null;
    pendingHistorySaveRef.current = null;

    if (userEmail) {
      const savePromise = saveHistoryEntry(form, prompt, projectName)
        .then((id) => {
          historyEntryIdRef.current = id;
          return id;
        })
        .catch((error) => {
          console.warn("[History] save failed", error);
          return null;
        });
      pendingHistorySaveRef.current = savePromise;
    }

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

  const persistProjectName = async () => {
    if (historyEntryIdRef.current) {
      const ok = await updateHistoryProjectName(
        historyEntryIdRef.current,
        projectName,
      );
      setProjectNameSaved(ok ? "attached" : "failed");
    } else {
      // Nothing generated in this session (or the page was reloaded and
      // the tracked entry was lost) — there's no row to attach to yet.
      // Say so explicitly rather than claiming a save that didn't happen;
      // it'll apply automatically the next time Generate runs.
      setProjectNameSaved("pending");
    }
    setTimeout(() => setProjectNameSaved(null), 2500);
  };

  const handleRestoreFromHistory = async (entry: HistoryEntry, makeActiveVariantId?: string) => {
    setForm(hydrateFormSnapshot(entry.form_snapshot));
    setOutput(entry.prompt_text);
    setRenderedImage(entry.rendered_image_url || null);
    setRenderError(null);
    setFailureType(null);
    setRefineError(null);
    setReferenceImage(null);
    setProjectName(entry.project_name || "");
    historyEntryIdRef.current = entry.id;
    pendingHistorySaveRef.current = null;
    outputPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (entry.reference_image_url) {
      try {
        const response = await fetch(entry.reference_image_url);
        const blob = await response.blob();
        const filename = entry.reference_image_url.split("/").pop() || "reference.png";
        setReferenceImage(new File([blob], filename, { type: blob.type || "image/png" }));
      } catch (error) {
        console.warn("[History] Failed to restore reference image", error);
      }
    }

    // Bring in the full version history for this entry so past renders
    // stay browsable, not just the latest one.
    const historyVariants = await fetchRenderVariants(entry.id);
    setVariants(historyVariants);
    const chosen = makeActiveVariantId
      ? historyVariants.find((v) => v.id === makeActiveVariantId)
      : historyVariants[historyVariants.length - 1];
    setActiveVariantId(chosen ? chosen.id : null);
    if (chosen) {
      setRenderedImage(chosen.image_url);
    }
  };

  // Deep-linked from the Projects page: either restore a specific saved
  // prompt ("Load" there), or start a blank render already tagged to a
  // project ("+ New Render for X"). The query param is cleared right
  // after so a refresh/back-navigation doesn't re-trigger it.
  useEffect(() => {
    const restoreId = searchParams.get("restore");
    const variantId = searchParams.get("variant");
    const newForProject = searchParams.get("newForProject");

    if (restoreId) {
      fetchHistoryEntryById(restoreId).then((entry) => {
        if (entry) handleRestoreFromHistory(entry, variantId || undefined);
      });
      router.replace("/builder");
    } else if (newForProject) {
      setProjectName(newForProject);
      router.replace("/builder");
    }
    // Intentionally run once on mount — searchParams/router change on
    // every navigation, which would re-fire this and loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateAndReveal = () => {
    if (isLocked) {
      router.push("/pricing");
      return;
    }
    handleGenerate();
    outputPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const clearRenderTimer = () => {
    if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current);
      renderTimerRef.current = null;
    }
  };

  const handleCancelRender = () => {
    renderAbortRef.current?.abort();
  };

  const handleRenderPreview = async () => {
    if (!output || rendering) return;

    if (!userEmail) {
      setShowAuth(true);
      return;
    }
    if (!isPro) {
      router.push("/pricing");
      return;
    }

    setRendering(true);
    setRenderError(null);
    setFailureType(null);
    setRenderStage(0);
    setRenderElapsed(0);

    const controller = new AbortController();
    renderAbortRef.current = controller;

    // Cosmetic stage labels over a real in-flight request — advances on
    // elapsed time, but is cleared and finalized the instant the actual
    // fetch resolves rather than on a fixed fake duration.
    renderTimerRef.current = setInterval(() => {
      setRenderElapsed((prev) => {
        const next = prev + 1;
        setRenderStage(Math.min(3, Math.floor(next / 4)));
        return next;
      });
    }, 1000);

    try {
      const sb = getSupabaseBrowser();
      const { data: { session } = { session: null } } = sb
        ? await sb.auth.getSession()
        : { data: { session: null } };

      // The history save from Generate is async — if Render Preview is
      // clicked before it resolves, wait for it rather than silently
      // rendering an image that never gets attached to the saved entry.
      let entryId = historyEntryIdRef.current;
      if (!entryId && pendingHistorySaveRef.current) {
        entryId = await pendingHistorySaveRef.current;
      }

      const body = new FormData();
      body.append("prompt", output);
      if (entryId) {
        body.append("historyEntryId", entryId);
      }
      if (form.revitMode && referenceImage) {
        body.append("image", referenceImage);
      }

      const response = await fetch("/api/render", {
        method: "POST",
        headers: {
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body,
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        setRenderError(data?.error || "Rendering failed. Please try again.");
        setFailureType(data?.failureType || "generic");
        return;
      }

      setRenderedImage(data.image);
      setProjectRefsUsed(data.projectRefsUsed || 0);

      if (data.variantId && data.imageUrl && entryId) {
        const newVariant: RenderVariant = {
          id: data.variantId,
          history_id: entryId,
          image_url: data.imageUrl,
          label: "Original",
          parent_variant_id: null,
          created_at: new Date().toISOString(),
        };
        setVariants((prev) => [...prev, newVariant]);
        setActiveVariantId(newVariant.id);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setFailureType("cancelled");
        setRenderError(null);
      } else {
        console.warn("[Render] request failed", error);
        setRenderError("Rendering failed. Please try again.");
        setFailureType("generic");
      }
    } finally {
      clearRenderTimer();
      renderAbortRef.current = null;
      setRendering(false);
    }
  };

  const handleRefine = async (instructions: string) => {
    if (!renderedImage || refining) return;

    if (!userEmail) {
      setShowAuth(true);
      return;
    }
    if (!isPro) {
      router.push("/pricing");
      return;
    }

    setRefining(true);
    setRefineError(null);

    try {
      const sb = getSupabaseBrowser();
      const { data: { session } = { session: null } } = sb
        ? await sb.auth.getSession()
        : { data: { session: null } };

      const imageBlob = await (await fetch(renderedImage)).blob();

      let entryId = historyEntryIdRef.current;
      if (!entryId && pendingHistorySaveRef.current) {
        entryId = await pendingHistorySaveRef.current;
      }

      const body = new FormData();
      body.append("instructions", instructions);
      body.append("image", imageBlob, "render.png");
      if (entryId) {
        body.append("historyEntryId", entryId);
      }
      if (activeVariantId) {
        body.append("baseVariantId", activeVariantId);
      }

      const response = await fetch("/api/render/refine", {
        method: "POST",
        headers: {
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        setRefineError(data?.error || "Refinement failed. Please try again.");
        return;
      }

      setRenderedImage(data.image);

      if (data.variantId && data.imageUrl && entryId) {
        const newVariant: RenderVariant = {
          id: data.variantId,
          history_id: entryId,
          image_url: data.imageUrl,
          label: instructions.slice(0, 200),
          parent_variant_id: activeVariantId,
          created_at: new Date().toISOString(),
        };
        setVariants((prev) => [...prev, newVariant]);
        setActiveVariantId(newVariant.id);
      }
    } catch (error) {
      console.warn("[Refine] request failed", error);
      setRefineError("Refinement failed. Please try again.");
    } finally {
      setRefining(false);
    }
  };

  const handleSelectVariant = (variant: RenderVariant) => {
    setRenderedImage(variant.image_url);
    setActiveVariantId(variant.id);
    setRefineError(null);
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

  const quotaLabel = isPro
    ? "Pro · unlimited prompts"
    : `${remaining} / ${FREE_LIMIT} free prompts left`;

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <div className="builder-shell">
        <header className="builder-topbar">
          <div className="builder-brand">
            <span className="builder-brand-name">ArchiPrompts</span>
            <span className="builder-brand-dot" />
          </div>

          <nav className="builder-topbar-nav">
            <a className="active">Builder</a>
            <a
              onClick={() => {
                if (!userEmail) {
                  setShowAuth(true);
                  return;
                }
                router.push("/builder/projects");
              }}
            >
              Projects
            </a>
            <a
              onClick={() => {
                if (!userEmail) {
                  setShowAuth(true);
                  return;
                }
                router.push("/builder/archive");
              }}
            >
              Archive
            </a>
          </nav>

          <div className="builder-topbar-project">
            <span>PROJECT</span>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={persistProjectName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  persistProjectName();
                  e.currentTarget.blur();
                }
              }}
              placeholder="Untitled project"
            />
          </div>

          <span className="builder-topbar-quota">{quotaLabel}</span>

          <div className="builder-topbar-actions">
            <button
              className="btn-sm"
              onClick={() => {
                if (!userEmail) {
                  setShowAuth(true);
                  return;
                }
                if (isPro) return;
                router.push("/pricing");
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
                    router.push("/builder/account");
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
            {/* ── MODE SWITCHER ── */}
            <div className="mode-switcher">
              <button
                className={`mode-tab${!isInterior ? ' active' : ''}`}
                onClick={() => updateField('builderMode', 'exterior' as BuilderMode)}
              >
                Exterior
              </button>
              <button
                className={`mode-tab${isInterior ? ' active' : ''}`}
                onClick={() => updateField('builderMode', 'interior' as BuilderMode)}
              >
                Interior
              </button>
            </div>

            {/* ── QUICK START PRESETS ── */}
            <div className="preset-bar">
              <div className="preset-bar-head">
                <span className="preset-bar-label">Quick start</span>
                <span className="preset-bar-hint">Fills every field. Two clicks to a result.</span>
              </div>
              <div className="preset-bar-row">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-card${selectedPresetId === preset.id ? ' selected' : ''}`}
                    onClick={() => handleApplyPreset(preset)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="preset-card-img" src={preset.img} alt="" />
                    <span className="preset-card-body">
                      <span className="preset-card-label">{preset.label}</span>
                      <span className="preset-card-desc">{preset.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── REFERENCE GEOMETRY ── */}
            <div className="ref-geometry-block">
              <div className="ref-geometry-head">
                <span className="ref-geometry-label">
                  Reference geometry <span>· optional</span>
                </span>
                <span className="ref-geometry-mode">
                  {referenceImage ? "Rendering image-to-image" : "Rendering text-to-image"}
                </span>
              </div>
              <ModelUpload
                file={referenceImage}
                onChange={handleReferenceChange}
                refStrength={form.referenceStrength}
                onRefStrengthChange={(v) => updateField("referenceStrength", v)}
              />
            </div>

            <div className="design-intent-header">
              <span className="design-intent-label">
                DESIGN INTENT · {isInterior ? 5 : 8} BLOCKS
              </span>
              <button type="button" className="toggle-all-btn" onClick={toggleAllBlocks}>
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {!isInterior && (
              <div className="mode-section-fade design-intent-blocks">
                <CollapsibleBlock
                  index="01"
                  title="Program & Context"
                  summary={summarizeProgramContext(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
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
                  </div>
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="02"
                  title="Massing & Envelope"
                  summary={summarizeMassing(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
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
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="03"
                  title="Materiality & Surface"
                  summary={summarizeMateriality(form)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
                  <div className="fg">
                    <label>Facade Materials</label>
                    <div className="hint">
                      Assign a material to each part of the building — like
                      applying materials to specific faces in a 3D renderer.
                      Add as many zones as you need.
                    </div>
                    <MaterialAssignmentList
                      assignments={form.facadeMaterials}
                      onChange={(next) => updateField("facadeMaterials", next)}
                      zoneOptions={facadeZones}
                      materialOptions={facadeMaterialOptions}
                    />
                  </div>
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="04"
                  title="Façade Systems"
                  summary={summarizeFacadeSystems(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
                  <div className="fg">
                    <label>Select Facade Elements</label>
                    <div className="hint">
                      Vertical fins are locked as SOLID OPAQUE elements to prevent
                      glass misinterpretation.
                    </div>
                    <ChipGroup
                      options={facadeElements}
                      selected={form.facadeElements}
                      onToggle={(v) => toggleArrayField("facadeElements", v)}
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
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="05"
                  title="Glazing & Openings"
                  summary={summarizeGlazing(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
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
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="06"
                  title="Roof Form"
                  summary={summarizeRoof(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
                  <div className="fg">
                    <ChipGroup
                      options={roofStyles}
                      selected={form.roofStyle}
                      onToggle={(v) => toggleChip("roofStyle", v)}
                    />
                  </div>
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="07"
                  title="Atmosphere & Optics"
                  summary={summarizeAtmosphere(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
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
                </CollapsibleBlock>
              </div>
            )}

            {/* ═══════════════ INTERIOR FORM BLOCKS ═══════════════ */}
            {isInterior && (
              <div className="mode-section-fade design-intent-blocks">
                <CollapsibleBlock
                  index="01"
                  title="Room & Style"
                  summary={summarizeRoomStyle(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
                  <div className="two-col">
                    <SelectField
                      label="Room Type"
                      value={form.roomType}
                      onChange={(v) => updateField("roomType", v)}
                      options={roomTypes}
                    />
                  </div>

                  <div className="fg">
                    <label>Interior Design Style</label>
                    <ChipGroup
                      options={interiorStyles}
                      selected={form.interiorStyle}
                      onToggle={(v) => toggleChip("interiorStyle", v)}
                    />
                  </div>
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="02"
                  title="Materials & Furniture"
                  summary={summarizeInteriorMaterials(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
                  <div className="fg">
                    <label>Interior Wall Materials</label>
                    <div className="hint">
                      Assign a material to each wall or zone — e.g. a
                      different material for an accent wall than the rest
                      of the room.
                    </div>
                    <MaterialAssignmentList
                      assignments={form.interiorWallMaterials}
                      onChange={(next) =>
                        updateField("interiorWallMaterials", next)
                      }
                      zoneOptions={interiorWallZones}
                      materialOptions={interiorWallFinishes}
                    />
                  </div>
                  <div className="fg">
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
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="03"
                  title="Ceiling & Lighting"
                  summary={summarizeCeilingLighting(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
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
                </CollapsibleBlock>

                <CollapsibleBlock
                  index="04"
                  title="Camera & Atmosphere"
                  summary={summarizeCameraAtmosphere(form, options)}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                >
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
                </CollapsibleBlock>
              </div>
            )}

            {/* ── SHARED: Design Intent Notes ── */}
            <CollapsibleBlock
              index={isInterior ? "05" : "08"}
              title="Design Intent & Notes"
              summary={summarizeNotes(form)}
              expandSignal={expandSignal}
              collapseSignal={collapseSignal}
            >
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
            </CollapsibleBlock>
          </section>

          <aside className="builder-sidebar" ref={outputPanelRef}>
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
                router.push("/pricing");
              }}
              renderedImage={renderedImage}
              rendering={rendering}
              renderError={renderError}
              failureType={failureType}
              renderStage={renderStage}
              renderElapsed={renderElapsed}
              onCancelRender={handleCancelRender}
              onRetryRender={handleRenderPreview}
              onRenderPreview={handleRenderPreview}
              referenceImageName={form.revitMode ? referenceImage?.name ?? null : null}
              projectRefsUsed={projectRefsUsed}
              historyEntryId={historyEntryIdRef.current}
              refining={refining}
              refineError={refineError}
              onRefine={handleRefine}
              variants={variants}
              activeVariantId={activeVariantId}
              onSelectVariant={handleSelectVariant}
              aiTools={AI_TOOLS}
              aiTool={form.aiTool}
              onAiToolChange={(id) => updateField("aiTool", id as AiTool)}
              onGenerate={isLocked ? () => router.push("/pricing") : handleGenerate}
              onSave={persistProjectName}
              saveLabel={
                projectNameSaved === "attached"
                  ? "Saved"
                  : projectNameSaved === "pending"
                    ? "Will apply next"
                    : projectNameSaved === "failed"
                      ? "Save failed"
                      : "Save"
              }
            />
          </aside>
        </main>
      </div>

      <div className="mobile-generate-fab">
        <div className="mobile-generate-info">
          <span className="mobile-generate-chars">
            {output ? `${output.length} chars ready` : "Not generated yet"}
          </span>
          <span className="mobile-generate-project">
            {projectName || "Untitled project"}
          </span>
        </div>
        <button
          className={`gen-btn${isLocked ? " locked" : ""}`}
          onClick={handleGenerateAndReveal}
        >
          {isLocked ? "Upgrade" : "Generate prompt"}
        </button>
      </div>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSignedIn={(email) => {
          setUserEmail(email);
        }}
      />
    </>
  );
}
