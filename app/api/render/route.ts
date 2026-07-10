import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { sanitizePromptForImageGen } from "@/lib/promptEngine";

/**
 * Preview Render Endpoint
 *
 * Turns a generated prompt into an actual image via OpenAI's image model,
 * so users see a render instead of only a copy-pasteable prompt string.
 *
 * When a Revit/SketchUp/3ds Max reference screenshot is attached, this
 * calls the images/edits endpoint instead of images/generations so the
 * render is conditioned on that reference image rather than text alone —
 * this is what actually backs the "Revit Model Lock" prompt language in
 * lib/promptEngine.ts, which previously had no real image behind it.
 *
 * Gated to Pro accounts server-side (not just in the UI) because every
 * call costs real OpenAI credit — the Bearer token must belong to a
 * session whose profile has an active paid plan.
 */

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_REFERENCE_BYTES = 15 * 1024 * 1024;

async function resolveIsPro(token: string | null): Promise<{ ok: boolean; reason?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { ok: false, reason: "Rendering requires a configured account backend." };
  }
  if (!token) {
    return { ok: false, reason: "Sign in with a Pro account to render previews." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return { ok: false, reason: "Your session has expired — please sign in again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    return { ok: false, reason: "Upgrade to Pro to render preview images." };
  }

  if (profile.plan === "free" || !profile.plan) {
    return { ok: false, reason: "Upgrade to Pro to render preview images." };
  }

  if (profile.plan === "monthly" && profile.plan_expires_at) {
    if (new Date(profile.plan_expires_at) < new Date()) {
      return { ok: false, reason: "Your Pro plan has expired — renew to keep rendering previews." };
    }
  }

  return { ok: true };
}

export async function POST(req: NextRequest) {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return NextResponse.json(
      { error: "Image rendering is not configured on this server." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawPrompt = formData.get("prompt");
  if (!rawPrompt || typeof rawPrompt !== "string" || rawPrompt.trim().length === 0) {
    return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
  }

  const imageEntry = formData.get("image");
  const referenceImage =
    imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;

  if (referenceImage) {
    if (!ACCEPTED_IMAGE_TYPES.includes(referenceImage.type)) {
      return NextResponse.json(
        { error: "Reference image must be PNG, JPEG, or WebP." },
        { status: 400 },
      );
    }
    if (referenceImage.size > MAX_REFERENCE_BYTES) {
      return NextResponse.json(
        { error: "Reference image is too large (max 15MB)." },
        { status: 400 },
      );
    }
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const access = await resolveIsPro(token);
  if (!access.ok) {
    return NextResponse.json({ error: access.reason }, { status: 403 });
  }

  const imagePrompt = sanitizePromptForImageGen(rawPrompt).slice(0, 4000);

  try {
    let response: Response;

    if (referenceImage) {
      const openAiForm = new FormData();
      openAiForm.append("model", "gpt-image-2");
      openAiForm.append("prompt", imagePrompt);
      openAiForm.append("image", referenceImage, referenceImage.name || "reference.png");
      openAiForm.append("size", "1536x1024");
      openAiForm.append("quality", "medium");
      openAiForm.append("n", "1");

      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}` },
        body: openAiForm,
      });
    } else {
      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: imagePrompt,
          size: "1536x1024",
          quality: "medium",
          n: 1,
        }),
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "<no body>");
      console.warn("[Render] OpenAI image request failed", response.status, errText);

      let message = "Image rendering failed. Please try again.";
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) message = parsed.error.message;
      } catch {
        // ignore parse failures, use default message
      }

      return NextResponse.json({ error: message }, { status: 502 });
    }

    const payload = await response.json();
    const b64 = payload?.data?.[0]?.b64_json;

    if (!b64 || typeof b64 !== "string") {
      return NextResponse.json(
        { error: "Image model returned no image data." },
        { status: 502 },
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (error) {
    console.error("[Render] Unexpected error", error);
    return NextResponse.json(
      { error: "Unexpected error while rendering preview." },
      { status: 500 },
    );
  }
}
