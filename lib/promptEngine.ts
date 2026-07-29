/**
 * ArchiPrompts — Prompt Assembly Engine
 *
 * Pure function that assembles an AI render prompt from form data.
 * Port of the original buildPrompt() from arch-prompt-builder.html.
 *
 * ⚠️  DO NOT CHANGE the prompt assembly order, section naming, or any
 *     tested language (e.g. "SOLID OPAQUE — NOT glass") without discussion.
 *     Architects validated this output through real-world testing.
 */

import { MaterialAssignment, PromptFormData } from './types';

// Renders a zone→material list as an explicit schedule the AI can follow
// per-location, instead of a flat list with no spatial meaning.
function formatMaterialSchedule(assignments: MaterialAssignment[]): string {
  return assignments
    .filter((a) => a.material)
    .map((a) => `• ${a.zone}: ${a.material}.`)
    .join('\n');
}

export function buildPrompt(data: PromptFormData): string {
  // ── Route by mode ─────────────────────────────────────────────
  if (data.builderMode === 'interior') {
    return buildInteriorPrompt(data);
  }
  return buildExteriorPrompt(data);
}

// ─── EXTERIOR PROMPT ENGINE ──────────────────────────────────────

function buildExteriorPrompt(data: PromptFormData): string {
  const {
    buildingType,
    archStyle,
    floors,
    revitMode,
    buildingForm,
    massingNotes,
    facadeMaterials,
    facadeElements,
    finWidth,
    finHeight,
    finMaterial,
    finSpacing,
    slabDepth,
    slabFinish,
    windows,
    glazingTint,
    roofStyle,
    lightMood,
    landscape,
    cameraAngle,
    aiTool,
    extraNotes,
  } = data;

  const bt = buildingType || 'commercial building';

  const hasFins = facadeElements.some((v) => v.includes('vertical fins'));
  const hasSlabs = facadeElements.some((v) => v.includes('slab'));

  // ── 1. Tool prefix ────────────────────────────────────────────
  let toolPre = '';
  let toolSuf = '';
  let neg = '';

  if (aiTool === 'midjourney') {
    toolPre = '/imagine ';
    toolSuf = '\n\n--ar 16:9 --v 6.1 --style raw --q 2';
  }

  if (aiTool === 'nanobanana') {
    // Nano Banana / Gemini specific formatting if needed
    // Currently following master prompt standard
  }

  if (aiTool === 'stable') {
    neg =
      '\n\nNEGATIVE PROMPT:\n' +
      'cartoon, illustration, sketch, drawing, blurry, distorted windows, ' +
      'floating elements, unrealistic proportions, extra floors added, ' +
      'watermark, text, flat lighting, grey background, plastic materials, ' +
      'video game graphics, anime, wrong building shape, curved when should ' +
      'be rectangular, rectangular when should be curved';
  }

  // ── 3. Revit Geometry Lock block ──────────────────────────────
  let revitBlock = '';
  if (revitMode) {
    revitBlock =
      '\n\nCRITICAL — REVIT MODEL GEOMETRY LOCK:\n' +
      "This prompt is based on an architect's Revit model reference image that " +
      'is uploaded alongside this prompt. You MUST faithfully render the building ' +
      'shown in the reference image. Do NOT redesign, simplify, or invent any new ' +
      'massing. Do NOT add floors, wings, or volumes that are not in the reference. ' +
      'Do NOT change the building silhouette. Treat the Revit screenshot as the ' +
      'absolute geometric authority — your job is only to add materials, lighting, ' +
      'and context to exactly what is shown.';
  }

  // ── Materials: per-zone facade material schedule ──────────────
  const materialSchedule = formatMaterialSchedule(facadeMaterials);

  // ── 7. Facade Elements block ──────────────────────────────────
  let facadeElsBlock = '';
  if (facadeElements.length > 0) {
    facadeElsBlock = '\nFACADE ELEMENTS (read carefully — distinguish each element type):\n';
    facadeElements.forEach((el) => {
      facadeElsBlock += `• ${el}\n`;
    });
  }

  // ── 8. Vertical Fin Specification block ───────────────────────
  let finBlock = '';
  if (hasFins) {
    finBlock =
      '\nVERTICAL FIN SPECIFICATION (IMPORTANT):\n' +
      'The vertical fins on this building are SOLID OPAQUE architectural fins — ' +
      'they are NOT glass, NOT curtain wall, NOT glazing. Do not render them as ' +
      'transparent or reflective glass. They are physical solid projections from ' +
      'the facade.\n' +
      `• Fin material: ${finMaterial}\n` +
      `• Fin width: ${finWidth}\n` +
      `• Fin height: ${finHeight}\n` +
      `• Fin spacing: ${finSpacing}\n` +
      'Render fins casting their own shadows onto the wall surface behind them. ' +
      'The fins sit IN FRONT of the glazing/wall, projecting outward.';
  }

  // ── 9. Floor Slab Expression block ────────────────────────────
  let slabBlock = '';
  if (hasSlabs) {
    slabBlock =
      '\nFLOOR SLAB EXPRESSION:\n' +
      'The floor slabs are expressed as visible horizontal bands on the facade.\n' +
      `• Slab depth/height: ${slabDepth}\n` +
      `• Slab finish: ${slabFinish}\n` +
      'The expressed slab bands should cast deep horizontal shadow lines across ' +
      'the facade. Each slab band should be clearly readable as a distinct horizontal element.';
  }

  // ── Assemble the full prompt (exact 20-step order) ────────────
  const prompt = `${toolPre}Photorealistic architectural rendering of a ${archStyle} ${floors} ${bt}, ${cameraAngle}, professional architectural photography composition, 35mm lens, correct perspective, no distortion.${revitBlock}

ARCHITECTURE STYLE:
${archStyle} architecture, ${floors}, premium construction quality, correct building scale and proportions.

BUILDING FORM & SILHOUETTE:
${buildingForm}.${massingNotes ? '\nAdditional massing notes: ' + massingNotes : ''}
IMPORTANT: Maintain exactly this building form — do not alter or simplify the silhouette.

FACADE & MATERIALS (apply each material only to its named zone — do not blend zones into one uniform material):
${materialSchedule}
Clean crisp edges, realistic surface roughness and material depth.
${facadeElsBlock}${finBlock}${slabBlock}
GLAZING:
${windows}, ${glazingTint}, correct window reveals and realistic shadows inside reveals.

ROOF:
${roofStyle}.

LIGHTING:
${lightMood}. Physically accurate light simulation, balanced contrast, no overexposure. Realistic light spill and shadow cast by all facade elements.

ENVIRONMENT:
${landscape}. Clean, well-maintained site. Realistic shadows from trees and building elements.

CAMERA:
${cameraAngle}. Correct perspective, no distortion, professional architectural photography composition.

RENDERING QUALITY:
Ultra-realistic, PBR textures, global illumination, ambient occlusion, soft shadows, ray-traced reflections. V-Ray / Corona Renderer style. 8K resolution, cinematic realism.

MOOD: Luxury, refined, aspirational. Professional architectural visualization studio quality.

ABSOLUTE RULES:
• Do NOT redesign or change the building massing
• Do NOT add extra floors, windows, doors, or volumes
• Do NOT change curved elements to straight or vice versa
• Fins are SOLID — do not render as glass
• No cartoon or illustration style
• No watermarks or text in the image${extraNotes ? '\n\nADDITIONAL NOTES:\n' + extraNotes : ''}${neg}${toolSuf}`;

  return prompt;
}

// ─── IMAGE-GEN SANITIZER ──────────────────────────────────────────
// Strips tool-specific syntax (Midjourney params, SD negative-prompt
// blocks) that would otherwise show up as literal noise if fed
// straight into an image model instead of copy-pasted elsewhere.

export function sanitizePromptForImageGen(prompt: string): string {
  return prompt
    .replace(/^\/imagine\s+/, '')
    .replace(/\n\n--ar[\s\S]*$/, '')
    .replace(/\n\nNEGATIVE PROMPT:[\s\S]*?(?=\n\n[A-Z]|$)/, '')
    .trim();
}

// ─── INTERIOR PROMPT ENGINE ──────────────────────────────────────
// Implements the Page 10 interior residential model lock render system.

function buildInteriorPrompt(data: PromptFormData): string {
  const {
    roomType,
    interiorStyle,
    interiorWallMaterials,
    floorMaterial,
    furnitureLayout,
    ceilingType,
    interiorLighting,
    colorTemp,
    interiorCameraAngle,
    timeOfDay,
    windowView,
    revitMode,
    aiTool,
    extraNotes,
  } = data;

  // ── Tool prefix / suffix ──────────────────────────────────────
  let toolPre = '';
  let toolSuf = '';
  let neg = '';

  if (aiTool === 'midjourney') {
    toolPre = '/imagine ';
    toolSuf = '\n\n--ar 16:9 --v 6.1 --style raw --q 2';
  }

  if (aiTool === 'stable') {
    neg =
      '\n\nNEGATIVE PROMPT:\n' +
      'cartoon, illustration, sketch, blurry, plastic surfaces, flat lighting, ' +
      'overexposed, grey muddy render, watermark, text, unrealistic proportions, ' +
      'video game graphics, anime style, distorted perspective, tilted verticals';
  }

  // ── Revit model lock (interior version) ──────────────────────
  let revitBlock = '';
  if (revitMode) {
    revitBlock =
      '\n\nCRITICAL — INTERIOR MODEL GEOMETRY LOCK:\n' +
      "This prompt is based on an architect's Revit interior model reference image " +
      'uploaded alongside this prompt. You MUST faithfully render the room geometry ' +
      'shown in the reference. Do NOT redesign the spatial layout, ceiling heights, ' +
      'window positions, or room proportions. Treat the Revit screenshot as the ' +
      'absolute geometric authority — your job is only to apply materials, furniture, ' +
      'lighting and atmosphere to exactly the space shown.';
  }

  // ── Assemble interior prompt ──────────────────────────────────
  const prompt = `${toolPre}Photorealistic interior architectural rendering of a ${interiorStyle} ${roomType}. ${interiorCameraAngle}. Professional interior photography composition, correct perspective, no distortion, verticals perfectly straight.${revitBlock}

INTERIOR STYLE DIRECTION:
${interiorStyle} design language. Premium interior quality, curated material palette, architectural detail and craftsmanship clearly visible.

SPACE & ROOM TYPE:
${roomType}. Correct spatial proportions and ceiling height for this room type. No items added that do not belong in a ${roomType}.

MATERIAL APPLICATION (apply each wall material only to its named zone — do not blend zones into one uniform material):

Walls:
${formatMaterialSchedule(interiorWallMaterials)}

Floor: ${floorMaterial}. Correctly rendered material texture, joints, reflection, and surface quality.

Ceiling: ${ceilingType}. Ceiling height correctly proportioned to room type and style.

FURNITURE & LAYOUT:
${furnitureLayout}. All furniture correctly scaled to room dimensions. Premium materials — no cheap or plastic-looking surfaces.

LIGHTING — TIME OF DAY: ${timeOfDay}
${interiorLighting}. Colour temperature: ${colorTemp}. Physically accurate light simulation — correct light falloff, ambient occlusion, soft shadows, no overexposed surfaces.

WINDOW VIEW:
${windowView}. View visible through glazing adds depth and context.

CAMERA COMPOSITION:
${interiorCameraAngle}. No lens distortion. Verticals perfectly straight and parallel. No perspective keystoning.

RENDERING QUALITY:
Ultra-realistic, PBR material textures, global illumination, ambient occlusion, ray-traced reflections, soft natural shadows. V-Ray / Corona Interior Renderer style. 8K resolution, professional architectural photography quality.

MOOD: ${interiorStyle} — luxury, refined, aspirational. High-end interior design studio visualization quality.

ABSOLUTE RULES:
• Do NOT change the room type or spatial layout
• Do NOT add items that do not belong in a ${roomType}
• Do NOT use cheap-looking or plastic materials
• Verticals MUST be perfectly straight — no lens distortion
• No cartoon, illustration, or sketch style
• No watermarks or text in the image
• Lighting must be physically plausible — no overexposed flat lighting${extraNotes ? '\n\nADDITIONAL NOTES:\n' + extraNotes : ''}${neg}${toolSuf}`;

  return prompt;
}
