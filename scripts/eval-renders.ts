/**
 * Batch-generates renders for the test matrix in eval-cases.ts, so a
 * promptEngine.ts change can be checked against real model output
 * instead of just "sounds reasonable." Saves each prompt + image into
 * a timestamped run folder, plus an index.html gallery for fast manual
 * review — open it, look at ten images, decide if a change helped.
 *
 * This is the smallest useful version: batch generation + a gallery
 * for manual scoring. No automated judge yet — see the README note
 * printed at the end for what a v2 (scored, diffable) would add.
 *
 * Usage:
 *   npm run eval:renders            — dry run, prints prompts, no API calls, no cost
 *   npm run eval:renders -- --live  — actually calls the image API (costs real money)
 *   npm run eval:renders -- --live --only=church-dome,warehouse-portal-frame
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { buildPrompt, sanitizePromptForImageGen, MAX_IMAGE_PROMPT_CHARS } from "../lib/promptEngine";
import { EVAL_CASES, buildCaseFormData } from "./eval-cases";

const args = process.argv.slice(2);
const isLive = args.includes("--live");
const onlyArg = args.find((a) => a.startsWith("--only="));
const onlyIds = onlyArg ? onlyArg.replace("--only=", "").split(",") : null;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (isLive && !OPENAI_API_KEY) {
  console.error(
    "OPENAI_API_KEY is not set. Run with `node --env-file=.env.local` " +
      "(see the npm script) or export it in your shell.",
  );
  process.exit(1);
}

const cases = onlyIds
  ? EVAL_CASES.filter((c) => onlyIds.includes(c.id))
  : EVAL_CASES;

if (cases.length === 0) {
  console.error("No matching cases. Check --only= against the ids in eval-cases.ts.");
  process.exit(1);
}

const runId = new Date().toISOString().replace(/[:.]/g, "-");
const runDir = join(__dirname, "..", "eval-runs", runId);
mkdirSync(runDir, { recursive: true });

async function generateImage(prompt: string): Promise<Buffer> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt,
      size: "1536x1024",
      quality: "medium",
      n: 1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "<no body>");
    throw new Error(`OpenAI ${response.status}: ${errText}`);
  }

  const payload = await response.json();
  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data in response.");
  return Buffer.from(b64, "base64");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RunResult {
  id: string;
  note: string;
  promptChars: number;
  truncated: boolean;
  imageFile: string | null;
  error: string | null;
}

async function main() {
  console.log(`Eval run ${runId} — ${cases.length} case(s), ${isLive ? "LIVE (costs money)" : "DRY RUN (no API calls)"}\n`);

  const results: RunResult[] = [];

  for (const evalCase of cases) {
    const formData = buildCaseFormData(evalCase);
    const fullPrompt = buildPrompt(formData);
    const sanitized = sanitizePromptForImageGen(fullPrompt);
    const imagePrompt = sanitized.slice(0, MAX_IMAGE_PROMPT_CHARS);
    const wasTruncated = sanitized.length > MAX_IMAGE_PROMPT_CHARS;

    const caseDir = join(runDir, evalCase.id);
    mkdirSync(caseDir, { recursive: true });
    writeFileSync(join(caseDir, "prompt.txt"), fullPrompt, "utf-8");

    console.log(`[${evalCase.id}] ${evalCase.note}`);
    console.log(`  ${imagePrompt.length} chars sent to the model`);
    if (wasTruncated) {
      console.log(
        `  ⚠ TRUNCATED — full prompt is ${sanitized.length} chars, ${sanitized.length - MAX_IMAGE_PROMPT_CHARS} char(s) were cut off the end`,
      );
    }

    if (!isLive) {
      results.push({ id: evalCase.id, note: evalCase.note, promptChars: imagePrompt.length, truncated: wasTruncated, imageFile: null, error: null });
      continue;
    }

    try {
      const imageBuffer = await generateImage(imagePrompt);
      const imageFile = "render.png";
      writeFileSync(join(caseDir, imageFile), imageBuffer);
      results.push({ id: evalCase.id, note: evalCase.note, promptChars: imagePrompt.length, truncated: wasTruncated, imageFile, error: null });
      console.log(`  ✓ saved render.png`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ id: evalCase.id, note: evalCase.note, promptChars: imagePrompt.length, truncated: wasTruncated, imageFile: null, error: message });
      console.log(`  ✗ ${message}`);
    }

    // Stay well under OpenAI's rate limits for sequential image calls.
    if (isLive) await sleep(1500);
  }

  writeFileSync(join(runDir, "results.json"), JSON.stringify({ runId, isLive, results }, null, 2), "utf-8");
  writeFileSync(join(runDir, "index.html"), buildGalleryHtml(runId, results), "utf-8");

  console.log(`\nRun saved to eval-runs/${runId}/`);
  if (isLive) {
    console.log(`Open eval-runs/${runId}/index.html in a browser to review.`);
  } else {
    console.log(
      "This was a dry run — no images were generated, nothing was charged.\n" +
        "Re-run with --live to actually generate renders (~$0.04-0.05 per image).",
    );
  }
  console.log(
    "\nNext step beyond this v1 (manual review): add an automated scoring pass — " +
      "feed each render + the case's form data to a vision-capable model with a " +
      "rubric (floor count matches? material on the right element? no invented " +
      "openings?) and get a number back instead of eyeballing every image. That's " +
      "what turns this into something you can diff before/after a promptEngine.ts " +
      "change, not just a one-off gallery.",
  );
}

function buildGalleryHtml(runId: string, results: RunResult[]): string {
  const cards = results
    .map((r) => {
      const img = r.imageFile
        ? `<img src="${r.id}/${r.imageFile}" alt="${r.id}" />`
        : `<div class="no-image">${r.error ? "FAILED: " + escapeHtml(r.error) : "dry run — no image"}</div>`;
      return `
        <div class="card">
          <h2>${escapeHtml(r.id)} ${r.truncated ? '<span class="warn">TRUNCATED</span>' : ""}</h2>
          <p class="note">${escapeHtml(r.note)}</p>
          ${img}
          <p class="meta">${r.promptChars} chars · <a href="${r.id}/prompt.txt">prompt.txt</a></p>
        </div>`;
    })
    .join("\n");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Eval run ${escapeHtml(runId)}</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #111; color: #eee; margin: 0; padding: 32px; }
  h1 { font-size: 18px; font-weight: 600; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
  .card { border: 1px solid #333; padding: 14px; background: #1a1a1a; }
  .card h2 { font-size: 13px; margin: 0 0 6px; color: #e9c176; }
  .card .note { font-size: 12px; color: #999; margin: 0 0 10px; line-height: 1.4; }
  .card img { width: 100%; display: block; border: 1px solid #333; }
  .card .no-image { padding: 40px 12px; text-align: center; font-size: 12px; color: #f66; border: 1px dashed #444; }
  .card .meta { font-size: 11px; color: #666; margin: 8px 0 0; font-family: monospace; }
  .card .meta a { color: #e9c176; }
  .card h2 .warn { color: #f66; font-size: 10px; border: 1px solid #f66; padding: 2px 5px; margin-left: 6px; }
</style>
</head>
<body>
  <h1>Eval run ${escapeHtml(runId)} — ${results.length} case(s)</h1>
  <div class="grid">${cards}</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

main();
