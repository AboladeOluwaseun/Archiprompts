import { PromptFormData, DEFAULT_FORM_DATA } from "../lib/types";

/**
 * The test matrix for the eval loop. Deliberately small (8-10 cases,
 * not exhaustive) — this is meant to be run often (before/after a
 * promptEngine.ts change) rather than be a one-time comprehensive
 * suite. Add cases here as specific failure modes get reported.
 */
export interface EvalCase {
  id: string;
  note: string; // what this case is specifically checking
  overrides: Partial<PromptFormData>;
}

export const EVAL_CASES: EvalCase[] = [
  {
    id: "duplex-baseline",
    note: "Existing default case — the known-working baseline to catch regressions.",
    overrides: {},
  },
  {
    id: "office-fins",
    note: "Vertical fins — checks the SOLID/NOT-glass instruction actually holds.",
    overrides: {
      buildingType: "commercial office building",
      floors: "six storey",
      facadeElements: [
        "vertical fins (IMPORTANT: these are SOLID opaque fins, NOT glass, NOT curtain wall — do not render them as glazing)",
      ],
      facadeMaterials: [
        { zone: "Front / Primary Facade", material: "glazed curtain wall" },
      ],
    },
  },
  {
    id: "office-deep-slabs",
    note: "Deep expressed slabs — checks the slab-depth-in-mm instruction reads as a band, not a line.",
    overrides: {
      buildingType: "commercial office building",
      floors: "eight or more storey",
      facadeElements: [
        "expressed horizontal floor slab bands with deep slab edge visible between floors",
      ],
      slabDepth:
        "deep expressed slab bands (approximately 800mm-1.2m deep), dramatically taller than standard, creating strong horizontal shadow lines — these slab bands are notably taller than the window bands between them",
    },
  },
  {
    id: "church-dome",
    note: "New building type + new roof option — checks the model actually renders a dome, not a generic hall.",
    overrides: {
      buildingType: "church, Christian place of worship",
      buildingForm:
        "single large-span column-free volume, one continuous roof over the whole footprint, tall proportions relative to footprint — not broken into separate wings or storeys",
      roofStyle:
        "central dome roof, smooth curved profile, clearly a dome silhouette against the sky — not a flat or pitched roof",
      floors: "single storey",
    },
  },
  {
    id: "warehouse-portal-frame",
    note: "New building type — checks a totally different typology (industrial) doesn't just get residential vocabulary.",
    overrides: {
      buildingType: "industrial warehouse and logistics building",
      buildingForm: "rectangular box massing, straight orthogonal facades on all sides",
      roofStyle:
        "large-span portal frame roof (warehouse/hall type), long uninterrupted ridge line, corrugated metal cladding, no internal columns visible from outside",
      floors: "single storey",
      archStyle: "contemporary minimalist",
    },
  },
  {
    id: "multi-zone-materials",
    note: "Four facade zones with different materials — the highest-risk case for material bleeding across zones.",
    overrides: {
      facadeMaterials: [
        { zone: "Front / Primary Facade", material: "smooth off-white painted render" },
        { zone: "Ground Floor / Base", material: "natural stone cladding" },
        { zone: "Accent / Feature Areas", material: "warm gold anodised aluminium vertical fins" },
        { zone: "Roof Fascia / Parapet", material: "dark aluminium composite panels" },
      ],
    },
  },
  {
    id: "curved-form",
    note: "Curved facade — checks curved-vs-straight isn't flattened out by the model.",
    overrides: {
      buildingForm:
        "curved facade on the primary corner elevation, sweeping arc from one side to the other, no sharp corners on main face",
      floors: "four storey",
    },
  },
  {
    id: "interior-living-room",
    note: "Interior baseline — the known-working interior case.",
    overrides: { builderMode: "interior" },
  },
  {
    id: "interior-kitchen-multi-material",
    note: "Interior with multiple wall-zone materials — the interior equivalent of multi-zone-materials.",
    overrides: {
      builderMode: "interior",
      roomType: "open-plan kitchen and dining area",
      interiorWallMaterials: [
        { zone: "Main Walls", material: "smooth lime plaster, micro-texture variation, warm white tone" },
        { zone: "Accent / Feature Wall", material: "warm timber vertical slat cladding, natural grain, linear rhythm" },
        { zone: "Wet Wall (Kitchen / Bath Splashback)", material: "natural travertine stone floor tiles, warm cream tones, slightly textured surface" },
      ],
    },
  },
];

export function buildCaseFormData(evalCase: EvalCase): PromptFormData {
  return { ...DEFAULT_FORM_DATA, ...evalCase.overrides, revitMode: false };
}
