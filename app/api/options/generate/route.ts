import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

const SECTIONS: Record<string, "select" | "chip"> = {
  buildingTypes: "select",
  archStyles: "select",
  floors: "select",
  buildingForms: "chip",
  wallFinishes: "select",
  accentMaterials: "select",
  facadeElements: "chip",
  finWidths: "select",
  finHeights: "select",
  finMaterials: "select",
  finSpacings: "select",
  slabDepths: "select",
  slabFinishes: "select",
  windowTypes: "select",
  glazingTints: "select",
  roofStyles: "chip",
  lightingMoods: "chip",
  landscapes: "select",
  cameraAngles: "select",
};

const SECTION_LABELS: Record<string, string> = {
  buildingTypes: "Building Type",
  archStyles: "Architectural Style",
  floors: "Number of Floors",
  buildingForms: "Building Form",
  wallFinishes: "Primary Wall Finish",
  accentMaterials: "Accent Material",
  facadeElements: "Facade Elements",
  finWidths: "Fin Width",
  finHeights: "Fin Height",
  finMaterials: "Fin Material",
  finSpacings: "Fin Spacing",
  slabDepths: "Slab Depth",
  slabFinishes: "Slab Finish",
  windowTypes: "Window Type",
  glazingTints: "Glazing Tint",
  roofStyles: "Roof Style",
  lightingMoods: "Lighting Mood",
  landscapes: "Landscape Context",
  cameraAngles: "Camera Angle",
};

// Simple in-memory cache & rate-limit (per server instance)
const CACHE = new Map<string, { ts: number; items: any[] }>();
const LAST_CALL = new Map<string, number>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const RATE_LIMIT_MS = 1000; // 1 second per section
const QUOTA_LOCK_TTL = 1000 * 60 * 15; // 15 minutes
let quotaLockExpiresAt = 0;

function parseJsonArray(text: string) {
  const jsonStart = text.indexOf("[");
  const jsonEnd = text.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON array found in assistant response.");
  }
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

function fallbackOptions(section: string) {
  const label = SECTION_LABELS[section] ?? section;
  return Array.from({ length: 4 }, (_, index) => ({
    label: `${label} idea ${index + 1}`,
    value: `additional ${label.toLowerCase()} option ${index + 1}`,
  }));
}

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section") || "";
  const q = request.nextUrl.searchParams.get("q") || "";
  const optionType = SECTIONS[section];

  if (!optionType) {
    return NextResponse.json(
      { error: "Missing or invalid section parameter." },
      { status: 400 },
    );
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return NextResponse.json(fallbackOptions(section));
  }

  // Rate-limit: if last call was very recent and we have cache, return it.
  const key = `${section}:${q}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.items);
  }

  if (quotaLockExpiresAt > Date.now()) {
    return NextResponse.json(fallbackOptions(section));
  }

  const last = LAST_CALL.get(section) || 0;
  if (Date.now() - last < RATE_LIMIT_MS && !cached) {
    // Too many requests; return fallback until cache available
    return NextResponse.json(fallbackOptions(section));
  }
  LAST_CALL.set(section, Date.now());

  let prompt =
    `Generate four extra architecturally accurate choices for the ${
      SECTION_LABELS[section] ?? section
    } section. ` +
    `Return only valid JSON, with an array of objects containing \"label\" and \"value\". ` +
    `Use concise labels and prompt-ready descriptive values suitable for ${
      optionType === "chip" ? "tag-style UI" : "a select menu"
    }. Do not include any markdown or explanation.`;

  if (q) {
    prompt += ` Include the query context: \"${q}\" and prioritize suggestions that match or expand on it.`;
  }

  try {
    // If Supabase is configured, attempt a retrieval step using embeddings
    const sb = getSupabaseServer();
    let retrieved: Array<{
      label: string;
      value: string;
      source?: string;
    }> | null = null;

    if (sb) {
      try {
        // Create an embedding for the query (or section label when query is empty)
        const embedText = q || SECTION_LABELS[section] || section;
        const embRes = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: embedText,
          }),
        });

        if (!embRes.ok) {
          const errorText = await embRes.text().catch(() => "<no body>");
          console.warn(
            "[Options Generate] embeddings request failed",
            embRes.status,
            errorText,
          );
        } else {
          const embPayload = await embRes.json();
          const embedding = embPayload?.data?.[0]?.embedding;

          if (Array.isArray(embedding)) {
            // Call a small RPC that performs a vector similarity search in Postgres.
            // The database must have a `specs` table and `match_spec_items` function.
            const rpc = await sb.rpc("match_spec_items", {
              query_embedding: embedding,
              p_field: section,
              p_limit: 6,
            });

            if (rpc && Array.isArray(rpc)) {
              retrieved = rpc.map((r: any) => ({
                label: r.label,
                value: r.value,
                source: r.source,
              }));
            }
          }
        }
      } catch (e) {
        console.warn("[Options Generate] retrieval step failed:", e);
        retrieved = null;
      }
    }

    // If we have retrieval results, include them as context for the generation prompt
    let generationPrompt = prompt;
    if (retrieved && retrieved.length) {
      const ctx = retrieved
        .map((r, i) => `${i + 1}. ${r.label} — ${r.value}`)
        .join("\n");
      generationPrompt += `\n\nContext from specs (most relevant first):\n${ctx}`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that returns only a JSON array of short option objects with label and value.",
          },
          { role: "user", content: generationPrompt },
        ],
        temperature: 0.7,
        max_tokens: 260,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "<no body>");
      console.warn(
        "[Options Generate] OpenAI request error",
        response.status,
        errText,
      );
      try {
        const json = JSON.parse(errText);
        if (json?.error?.code === "insufficient_quota") {
          quotaLockExpiresAt = Date.now() + QUOTA_LOCK_TTL;
        }
      } catch {
        // ignore parse failures
      }
      return NextResponse.json(fallbackOptions(section));
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("OpenAI response missing content.");
    }

    const parsed = parseJsonArray(content);
    if (!Array.isArray(parsed)) {
      throw new Error("OpenAI response is not a JSON array.");
    }

    const items = parsed
      .filter(
        (item: unknown) =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as any).label === "string" &&
          typeof (item as any).value === "string",
      )
      .map((item: any) => ({ label: item.label, value: item.value }));

    if (items.length === 0) {
      throw new Error("OpenAI returned no valid options.");
    }

    // cache result
    CACHE.set(key, { ts: Date.now(), items });

    return NextResponse.json(items);
  } catch (error) {
    console.warn("[Options Generate] OpenAI fallback:", error);
    return NextResponse.json(fallbackOptions(section));
  }
}
