import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { resolveRenderAccess } from "@/lib/renderAccess";

/**
 * Render Refinement Endpoint
 *
 * Takes an already-rendered preview image plus a short list of
 * atmospheric instructions (add god rays, add people, apply a warm
 * LUT, etc.) and produces an adjusted version via OpenAI's image-edit
 * endpoint. This is deliberately NOT "reprompting to fix a mistake" —
 * it's post-render staging on a render that's already correct, the
 * same way a photographer adjusts a good shot in post rather than
 * reshooting it. Same Pro gate and cost profile as /api/render.
 */

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function buildRefinementPrompt(instructions: string): string {
  return (
    `${instructions}. IMPORTANT: Do not change the room or building geometry, ` +
    "materials, layout, proportions, or camera angle. Only apply the specific " +
    "additions or adjustments described above — keep everything else in the " +
    "image exactly as it is."
  );
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

  const instructionsRaw = formData.get("instructions");
  if (
    !instructionsRaw ||
    typeof instructionsRaw !== "string" ||
    instructionsRaw.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "Describe what to add or adjust." },
      { status: 400 },
    );
  }

  const imageEntry = formData.get("image");
  const baseImage =
    imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;
  if (!baseImage) {
    return NextResponse.json({ error: "Missing image to refine." }, { status: 400 });
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(baseImage.type)) {
    return NextResponse.json(
      { error: "Image must be PNG, JPEG, or WebP." },
      { status: 400 },
    );
  }
  if (baseImage.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 15MB)." }, { status: 400 });
  }

  const historyEntryIdRaw = formData.get("historyEntryId");
  const historyEntryId =
    typeof historyEntryIdRaw === "string" && historyEntryIdRaw ? historyEntryIdRaw : null;

  const baseVariantIdRaw = formData.get("baseVariantId");
  const baseVariantId =
    typeof baseVariantIdRaw === "string" && baseVariantIdRaw ? baseVariantIdRaw : null;

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const access = await resolveRenderAccess(token);
  if (!access.ok) {
    return NextResponse.json({ error: access.reason }, { status: 403 });
  }

  const refinementPrompt = buildRefinementPrompt(instructionsRaw.trim()).slice(0, 4000);

  try {
    const openAiForm = new FormData();
    openAiForm.append("model", "gpt-image-2");
    openAiForm.append("prompt", refinementPrompt);
    openAiForm.append("image", baseImage, baseImage.name || "render.png");
    openAiForm.append("size", "1536x1024");
    openAiForm.append("quality", "medium");
    openAiForm.append("n", "1");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAiKey}` },
      body: openAiForm,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "<no body>");
      console.warn("[Refine] OpenAI image request failed", response.status, errText);

      let message = "Refinement failed. Please try again.";
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

    // Save as a NEW variant (not an overwrite) so the version being
    // refined FROM is still there to go back to, with the instruction
    // text as the label and a link to its parent variant.
    let imageUrl: string | null = null;
    let variantId: string | null = null;
    if (access.supabase && access.userId) {
      try {
        variantId = randomUUID();
        const path = `${access.userId}/${historyEntryId ?? "unsaved"}/${variantId}.png`;
        const { error: uploadError } = await access.supabase.storage
          .from("renders")
          .upload(path, Buffer.from(b64, "base64"), {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.warn("[Refine] Storage upload failed", uploadError);
          variantId = null;
        } else {
          imageUrl = access.supabase.storage.from("renders").getPublicUrl(path)
            .data.publicUrl;

          if (historyEntryId && imageUrl) {
            const { error: variantError } = await access.supabase
              .from("render_variants")
              .insert({
                id: variantId,
                history_id: historyEntryId,
                user_id: access.userId,
                image_url: imageUrl,
                label: instructionsRaw.trim().slice(0, 200),
                parent_variant_id: baseVariantId,
              });

            if (variantError) {
              console.warn("[Refine] Variant insert failed", variantError);
              variantId = null;
            }

            const { error: updateError } = await access.supabase
              .from("prompt_history")
              .update({ rendered_image_url: imageUrl })
              .eq("id", historyEntryId)
              .eq("user_id", access.userId);

            if (updateError) {
              console.warn("[Refine] History update failed", updateError);
            }
          }
        }
      } catch (persistError) {
        console.warn("[Refine] Persisting refined render failed", persistError);
      }
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}`, imageUrl, variantId });
  } catch (error) {
    console.error("[Refine] Unexpected error", error);
    return NextResponse.json(
      { error: "Unexpected error while refining render." },
      { status: 500 },
    );
  }
}
