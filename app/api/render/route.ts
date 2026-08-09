import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sanitizePromptForImageGen, MAX_IMAGE_PROMPT_CHARS } from "@/lib/promptEngine";
import { resolveRenderAccess } from "@/lib/renderAccess";

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
 * When the prompt being rendered belongs to a named project (see
 * lib/history.ts), up to two of the most recent already-rendered images
 * from OTHER prompts in that same project are pulled in as ADDITIONAL
 * reference images — so a new view (e.g. the side elevation) matches the
 * materials, color, and lighting style already established by an earlier
 * view (e.g. the front elevation), instead of only sharing text settings.
 * gpt-image-2 accepts multiple images per edit call via repeated `image[]`
 * fields, confirmed directly against the live API before wiring this in.
 *
 * Gated to Pro accounts server-side (not just in the UI) because every
 * call costs real OpenAI credit — the Bearer token must belong to a
 * session whose profile has an active paid plan.
 */

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_REFERENCE_BYTES = 15 * 1024 * 1024;
const MAX_PROJECT_CONTEXT_IMAGES = 2;

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

  const historyEntryIdRaw = formData.get("historyEntryId");
  const historyEntryId =
    typeof historyEntryIdRaw === "string" && historyEntryIdRaw ? historyEntryIdRaw : null;

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

  const access = await resolveRenderAccess(token);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason, failureType: "plan" },
      { status: 403 },
    );
  }

  let imagePrompt = sanitizePromptForImageGen(rawPrompt).slice(0, MAX_IMAGE_PROMPT_CHARS);

  // Pull in prior renders from the same named project (if any) as extra
  // style/material reference images — best-effort, never blocks the
  // render if the lookup or a fetch fails.
  const projectContextImages: Blob[] = [];
  if (access.supabase && access.userId && historyEntryId) {
    try {
      const { data: currentEntry } = await access.supabase
        .from("prompt_history")
        .select("project_name")
        .eq("id", historyEntryId)
        .eq("user_id", access.userId)
        .single();

      const projectName = currentEntry?.project_name;
      if (projectName) {
        const { data: siblings } = await access.supabase
          .from("prompt_history")
          .select("rendered_image_url")
          .eq("project_name", projectName)
          .eq("user_id", access.userId)
          .neq("id", historyEntryId)
          .not("rendered_image_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(MAX_PROJECT_CONTEXT_IMAGES);

        for (const sibling of siblings || []) {
          if (!sibling.rendered_image_url) continue;
          try {
            const imgRes = await fetch(sibling.rendered_image_url);
            if (imgRes.ok) {
              projectContextImages.push(await imgRes.blob());
            }
          } catch (fetchError) {
            console.warn("[Render] Failed to fetch project context image", fetchError);
          }
        }
      }
    } catch (lookupError) {
      console.warn("[Render] Project context lookup failed", lookupError);
    }
  }

  if (projectContextImages.length > 0) {
    imagePrompt +=
      "\n\nADDITIONAL REFERENCE IMAGES: the other attached image(s) are already-" +
      "rendered views from THIS SAME project. Match their exact materials, " +
      "color palette, lighting mood, and overall finish quality. Do NOT copy " +
      "their camera angle, composition, or contents — render only the view " +
      "described above, with matching style.";
  }

  const usedReference = !!referenceImage;
  const deadline = AbortSignal.timeout(60_000);

  try {
    let response: Response;

    const allImages: { data: Blob; filename: string }[] = [];
    if (referenceImage) {
      allImages.push({ data: referenceImage, filename: referenceImage.name || "reference.png" });
    }
    projectContextImages.forEach((blob, i) => {
      allImages.push({ data: blob, filename: `project-context-${i}.png` });
    });

    if (allImages.length > 0) {
      const openAiForm = new FormData();
      openAiForm.append("model", "gpt-image-2");
      openAiForm.append("prompt", imagePrompt);
      const imageField = allImages.length > 1 ? "image[]" : "image";
      for (const img of allImages) {
        openAiForm.append(imageField, img.data, img.filename);
      }
      openAiForm.append("size", "1536x1024");
      openAiForm.append("quality", "medium");
      openAiForm.append("n", "1");

      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}` },
        body: openAiForm,
        signal: deadline,
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
        signal: deadline,
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "<no body>");
      console.warn("[Render] OpenAI image request failed", response.status, errText);

      let message = "Image rendering failed. Please try again.";
      let parsedError: { code?: string; message?: string } | undefined;
      try {
        const parsed = JSON.parse(errText);
        parsedError = parsed?.error;
        if (parsedError?.message) message = parsedError.message;
      } catch {
        // ignore parse failures, use default message
      }

      // OpenAI flags an unreadable/invalid input image with these codes on
      // the images/edits path — a real, distinguishable failure mode from
      // a generic model error, worth its own recovery copy.
      const isReferenceError =
        usedReference &&
        (parsedError?.code === "invalid_image" ||
          parsedError?.code === "invalid_image_format" ||
          /image/i.test(parsedError?.message || ""));

      return NextResponse.json(
        { error: message, failureType: isReferenceError ? "reference" : "generic" },
        { status: 502 },
      );
    }

    const payload = await response.json();
    const b64 = payload?.data?.[0]?.b64_json;

    if (!b64 || typeof b64 !== "string") {
      return NextResponse.json(
        { error: "Image model returned no image data." },
        { status: 502 },
      );
    }

    // Persist the render as a new variant (not an overwrite) so past
    // versions stay browsable, plus the reference image that produced
    // it, if any. Best-effort — a persistence failure shouldn't stop
    // the user from seeing their image.
    let imageUrl: string | null = null;
    let referenceImageUrl: string | null = null;
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
          console.warn("[Render] Storage upload failed", uploadError);
          variantId = null;
        } else {
          imageUrl = access.supabase.storage.from("renders").getPublicUrl(path)
            .data.publicUrl;
        }

        if (referenceImage) {
          const refExt = referenceImage.type.split("/")[1] || "png";
          const refPath = `${access.userId}/${historyEntryId ?? "unsaved"}-reference.${refExt}`;
          const refBuffer = Buffer.from(await referenceImage.arrayBuffer());
          const { error: refUploadError } = await access.supabase.storage
            .from("renders")
            .upload(refPath, refBuffer, {
              contentType: referenceImage.type,
              upsert: true,
            });

          if (refUploadError) {
            console.warn("[Render] Reference image upload failed", refUploadError);
          } else {
            referenceImageUrl = access.supabase.storage
              .from("renders")
              .getPublicUrl(refPath).data.publicUrl;
          }
        }

        if (historyEntryId && imageUrl && variantId) {
          const { error: variantError } = await access.supabase
            .from("render_variants")
            .insert({
              id: variantId,
              history_id: historyEntryId,
              user_id: access.userId,
              image_url: imageUrl,
              label: "Original",
            });

          if (variantError) {
            console.warn("[Render] Variant insert failed", variantError);
            variantId = null;
          }
        }

        if (historyEntryId && (imageUrl || referenceImageUrl)) {
          const updatePayload: Record<string, string> = {};
          if (imageUrl) updatePayload.rendered_image_url = imageUrl;
          if (referenceImageUrl) updatePayload.reference_image_url = referenceImageUrl;

          const { error: updateError } = await access.supabase
            .from("prompt_history")
            .update(updatePayload)
            .eq("id", historyEntryId)
            .eq("user_id", access.userId);

          if (updateError) {
            console.warn("[Render] History update failed", updateError);
          }
        }
      } catch (persistError) {
        console.warn("[Render] Persisting render failed", persistError);
      }
    }

    return NextResponse.json({
      image: `data:image/png;base64,${b64}`,
      imageUrl,
      referenceImageUrl,
      variantId,
      projectRefsUsed: projectContextImages.length,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        {
          error: "gpt-image-2 did not answer within 60 seconds.",
          failureType: "timeout",
        },
        { status: 504 },
      );
    }
    console.error("[Render] Unexpected error", error);
    return NextResponse.json(
      { error: "Unexpected error while rendering preview.", failureType: "generic" },
      { status: 500 },
    );
  }
}
