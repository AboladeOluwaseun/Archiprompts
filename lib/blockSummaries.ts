import { PromptFormData } from "./types";
import { BuilderOptions, shortLabel } from "./formOptions";

export function summarizeProgramContext(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  const type = shortLabel(form.buildingType, options.buildingTypes);
  const style = shortLabel(form.archStyle, options.archStyles);
  const floors = shortLabel(form.floors, options.floors);
  return [type, style, floors].filter(Boolean).join(" · ") || "Not configured";
}

export function summarizeMassing(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  return shortLabel(form.buildingForm, options.buildingForms) || "No massing selected";
}

export function summarizeMateriality(form: PromptFormData): string {
  const count = form.facadeMaterials.length;
  if (count === 0) return "No materials assigned";
  const first = form.facadeMaterials[0];
  return count === 1
    ? `${first.zone}: ${first.material}`
    : `${first.material} +${count - 1} more zone${count - 1 === 1 ? "" : "s"}`;
}

export function summarizeFacadeSystems(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  if (form.facadeElements.length === 0) return "No facade systems selected";
  return form.facadeElements
    .map((v) => shortLabel(v, options.facadeElements))
    .join(", ");
}

export function summarizeGlazing(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  const win = shortLabel(form.windows, options.windowTypes);
  const tint = shortLabel(form.glazingTint, options.glazingTints);
  return [win, tint].filter(Boolean).join(" · ");
}

export function summarizeRoof(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  return shortLabel(form.roofStyle, options.roofStyles) || "No roof style selected";
}

export function summarizeAtmosphere(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  const mood = shortLabel(form.lightMood, options.lightingMoods);
  const landscape = shortLabel(form.landscape, options.landscapes);
  const camera = shortLabel(form.cameraAngle, options.cameraAngles);
  return [mood, landscape, camera].filter(Boolean).join(" · ");
}

export function summarizeRoomStyle(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  const room = shortLabel(form.roomType, options.roomTypes);
  const style = shortLabel(form.interiorStyle, options.interiorStyles);
  return [room, style].filter(Boolean).join(" · ") || "Not configured";
}

export function summarizeInteriorMaterials(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  const wallCount = form.interiorWallMaterials.length;
  const wallPart =
    wallCount === 0
      ? "No wall materials"
      : wallCount === 1
        ? form.interiorWallMaterials[0].material
        : `${form.interiorWallMaterials[0].material} +${wallCount - 1} more`;
  const floor = shortLabel(form.floorMaterial, options.floorMaterials);
  return [wallPart, floor].filter(Boolean).join(" · ");
}

export function summarizeCeilingLighting(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  const ceiling = shortLabel(form.ceilingType, options.ceilingTypes);
  const lighting = shortLabel(form.interiorLighting, options.interiorLightings);
  return [ceiling, lighting].filter(Boolean).join(" · ");
}

export function summarizeCameraAtmosphere(
  form: PromptFormData,
  options: BuilderOptions,
): string {
  const time = shortLabel(form.timeOfDay, options.timeOfDays);
  const camera = shortLabel(form.interiorCameraAngle, options.interiorCameraAngles);
  return [time, camera].filter(Boolean).join(" · ");
}

export function summarizeNotes(form: PromptFormData): string {
  const trimmed = form.extraNotes.trim();
  if (!trimmed) return "No notes added";
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
}
