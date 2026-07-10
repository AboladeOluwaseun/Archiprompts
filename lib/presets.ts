import { AiTool, PromptFormData, BuilderMode, DEFAULT_FORM_DATA } from "./types";

/**
 * Quick Start Presets
 *
 * One-click, fully-configured starting points so a new user can go from
 * landing on /builder to seeing a real generated prompt (and render) in
 * two clicks instead of filling 7-8 blocks first. Each preset overrides
 * the fields relevant to it; anything unspecified falls back to
 * DEFAULT_FORM_DATA. aiTool is intentionally left to the caller so
 * switching presets doesn't undo a user's chosen output tool.
 */

export interface Preset {
  id: string;
  label: string;
  mode: BuilderMode;
  icon: string;
  description: string;
  overrides: Partial<PromptFormData>;
}

export const PRESETS: Preset[] = [
  {
    id: "glass-tower-dusk",
    label: "Modern Glass Tower — Dusk",
    mode: "exterior",
    icon: "🏙️",
    description: "Curtain-wall tower, blue hour, 3/4 street view",
    overrides: {
      buildingType: "commercial office building",
      archStyle: "contemporary minimalist",
      floors: "eight or more storey",
      buildingForm: "cylindrical tower form, circular floor plan",
      massingNotes: "",
      wallFinish: "smooth white reinforced concrete frame",
      accentMat: "glazed curtain wall",
      facadeElements: [
        "full-height curtain wall glazing with dark tinted glass and aluminium mullions",
      ],
      windows:
        "floor-to-ceiling curtain wall glazing, dark tinted glass, dark aluminium mullions",
      glazingTint:
        "dark tinted reflective glass showing sky and tree reflections on exterior surface",
      roofStyle:
        "flat concrete roof with clean white painted parapet walls, no visible rooftop clutter",
      lightMood:
        "dusk blue hour, deep blue-purple sky, warm interior lights glowing through all windows, exterior lights activated",
      landscape:
        "urban Lagos / Accra commercial district street context, clean wide concrete pavement, mature tropical trees lining the street (slightly blurred), parked premium vehicles on street (slightly blurred), other commercial buildings in background (soft focus)",
      cameraAngle:
        "three-quarter 45-degree view showing front and side facades simultaneously, eye-level, 35mm lens, slight upward tilt to emphasise height",
    },
  },
  {
    id: "brutalist-overcast",
    label: "Brutalist Concrete — Overcast",
    mode: "exterior",
    icon: "🏛️",
    description: "Raw concrete, deep expressed slabs, worm's-eye drama",
    overrides: {
      buildingType: "institutional building",
      archStyle: "brutalist modern",
      floors: "four storey",
      buildingForm: "angular / faceted facade, diagonal cuts and angled planes",
      massingNotes: "",
      wallFinish: "exposed fair-faced concrete",
      accentMat: "dark aluminium composite panels",
      facadeElements: [
        "expressed horizontal floor slab bands with deep slab edge visible between floors",
      ],
      slabDepth:
        "deep expressed slab bands (approximately 800mm-1.2m deep), dramatically taller than standard, creating strong horizontal shadow lines — these slab bands are notably taller than the window bands between them",
      slabFinish: "fair-faced exposed concrete slab edges",
      windows: "slim black steel framed windows",
      glazingTint: "grey tinted glass",
      roofStyle:
        "flat roof with visible rooftop plant room enclosures, water tanks and lift overrun boxes",
      lightMood:
        "overcast soft diffused lighting, moody grey sky, no harsh shadows, cool ambient light",
      landscape:
        "minimalist landscaping, manicured hedges, clean gravel pathways, ornamental grasses",
      cameraAngle:
        "worm's eye view, low angle looking up at building, dramatic perspective",
    },
  },
  {
    id: "scandi-living-daylight",
    label: "Scandinavian Living Room — Daylight",
    mode: "interior",
    icon: "🛋️",
    description: "Minimal, airy, bright natural light",
    overrides: {
      roomType: "luxury living room",
      interiorStyle: "scandinavian minimal",
      interiorWallFinish: "clean white smooth painted plaster walls",
      floorMaterial:
        "natural oak hardwood flooring, wide planks, matte finish, subtle grain variation",
      furnitureLayout:
        "minimal floating furniture layout, generous negative space, single-piece statement sofa",
      ceilingType: "smooth plastered flat ceiling with recessed LED cove lighting",
      interiorLighting:
        "soft natural daylight from full-height windows supplemented by warm recessed LED downlights",
      colorTemp: "natural white 4000K lighting, balanced neutral tone",
      interiorCameraAngle:
        "eye-level interior view, 24–35mm lens, 1.2–1.5m camera height, verticals perfectly straight",
      timeOfDay: "bright midday natural light",
      windowView: "manicured private garden with lawn and hedges visible beyond",
    },
  },
  {
    id: "kitchen-golden-hour",
    label: "Open-Plan Kitchen — Golden Hour",
    mode: "interior",
    icon: "🍽️",
    description: "Warm contemporary, statement pendant, raking light",
    overrides: {
      roomType: "open-plan kitchen and dining area",
      interiorStyle: "minimal warm contemporary",
      interiorWallFinish: "smooth lime plaster, micro-texture variation, warm white tone",
      floorMaterial:
        "large-format porcelain tiles with stone texture effect, beige-grey tone, matt finish",
      furnitureLayout:
        "dining-focused layout, long statement table, upholstered dining chairs, buffet sideboard",
      ceilingType:
        "double-height soaring ceiling, large architectural pendant light as centrepiece",
      interiorLighting:
        "golden hour sunlight raking through windows, warm patches of sunlight on floors and walls",
      colorTemp: "warm white 2700K lighting, amber-toned, intimate atmosphere",
      interiorCameraAngle:
        "long-axis view down the length of the room, 35mm lens, centred composition",
      timeOfDay: "warm golden afternoon light",
      windowView: "lush tropical garden visible through floor-to-ceiling glazing",
    },
  },
];

export function applyPreset(preset: Preset, currentAiTool: AiTool): PromptFormData {
  return {
    ...DEFAULT_FORM_DATA,
    ...preset.overrides,
    builderMode: preset.mode,
    revitMode: false,
    extraNotes: "",
    aiTool: currentAiTool,
  };
}
