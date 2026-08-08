// ─── Builder Mode ────────────────────────────────────────────────
export type BuilderMode = 'exterior' | 'interior';

// ─── AI Tool Types ──────────────────────────────────────────────
export type AiTool = 'chatgpt' | 'midjourney' | 'stable' | 'firefly' | 'nanobanana';

// ─── Option Types ───────────────────────────────────────────────
export interface SelectOption {
  label: string;
  value: string;
}

export interface ChipOption {
  label: string;
  value: string;
}

// ─── Material Zone Assignment ───────────────────────────────────
// Ties a material to a specific part of the building — the closest a
// text-prompt tool can get to "select a face, apply a material" from
// traditional 3D rendering software (Corona/3ds Max/SketchUp).
export interface MaterialAssignment {
  zone: string;
  material: string;
}

// ─── Facade Element Keys ────────────────────────────────────────
export type FacadeElementKey =
  | 'verticalFins'
  | 'horizontalBriseSoleil'
  | 'curtainWall'
  | 'punchedWindows'
  | 'expressedSlabs'
  | 'louvreScreens'
  | 'spandrelPanels'
  | 'recessedBalconies'
  | 'cantileveredBalconies';

// ─── Form Data ──────────────────────────────────────────────────
export interface PromptFormData {
  // ── Shared ──────────────────────────────────────────────────
  builderMode: BuilderMode;
  revitMode: boolean;
  referenceStrength: 'strict' | 'balanced' | 'loose';
  aiTool: AiTool;
  extraNotes: string;

  // ── Exterior: Section 01 — Project Basics ───────────────────
  buildingType: string;
  archStyle: string;
  floors: string;

  // ── Exterior: Section 02 — Building Form & Silhouette ───────
  buildingForm: string;
  massingNotes: string;

  // ── Exterior: Section 03 — Materials & Facade (zone assignment) ─
  facadeMaterials: MaterialAssignment[];

  // ── Exterior: Section 04 — Facade Elements (multi-select) ───
  facadeElements: string[];

  // ── Exterior: Section 04 — Fin Details (conditional) ────────
  finWidth: string;
  finHeight: string;
  finMaterial: string;
  finSpacing: string;

  // ── Exterior: Section 04 — Slab Details (conditional) ───────
  slabDepth: string;
  slabFinish: string;

  // ── Exterior: Section 05 — Glazing & Openings ───────────────
  windows: string;
  glazingTint: string;

  // ── Exterior: Section 06 — Roof ─────────────────────────────
  roofStyle: string;

  // ── Exterior: Section 07 — Lighting & Environment ───────────
  lightMood: string;
  landscape: string;
  cameraAngle: string;

  // ── Interior: Section 01 — Room & Style ─────────────────────
  roomType: string;
  interiorStyle: string;

  // ── Interior: Section 02 — Materials & Furniture ────────────
  interiorWallMaterials: MaterialAssignment[];
  floorMaterial: string;
  furnitureLayout: string;

  // ── Interior: Section 03 — Ceiling & Lighting ───────────────
  ceilingType: string;
  interiorLighting: string;
  colorTemp: string;

  // ── Interior: Section 04 — Camera & Atmosphere ──────────────
  interiorCameraAngle: string;
  timeOfDay: string;
  windowView: string;
}

// ─── Defaults ───────────────────────────────────────────────────
export const DEFAULT_FORM_DATA: PromptFormData = {
  // Shared
  builderMode: 'exterior',
  revitMode: true,
  referenceStrength: 'strict',
  aiTool: 'chatgpt',
  extraNotes: '',

  // Exterior
  buildingType: '',
  archStyle: 'modern-classic Nigerian residential',
  floors: 'two storey',
  buildingForm: 'rectangular box massing, straight orthogonal facades on all sides',
  massingNotes: '',
  facadeMaterials: [
    { zone: 'Front / Primary Facade', material: 'smooth off-white painted render' },
    { zone: 'Accent / Feature Areas', material: 'natural stone cladding' },
  ],
  facadeElements: [],
  finWidth: 'narrow fins (approximately 100-150mm wide each)',
  finHeight: 'fins spanning exactly one floor height',
  finMaterial: 'warm gold anodised aluminium fins',
  finSpacing: 'closely spaced fins with narrow gaps between each fin',
  slabDepth: 'shallow slab bands (approximately 300-400mm deep), creating thin horizontal lines between floors',
  slabFinish: 'white smooth painted concrete slab edges',
  windows: 'dark grey aluminium casement windows, reflective double glazing',
  glazingTint: 'dark tinted reflective glass showing sky and tree reflections on exterior surface',
  roofStyle: 'flat concrete roof with clean white painted parapet walls, no visible rooftop clutter',
  lightMood: 'bright West African midday sun, clear blue tropical sky, sharp crisp shadows cast by facade elements',
  landscape: 'urban Lagos / Accra commercial district street context, clean wide concrete pavement, mature tropical trees lining the street (slightly blurred), parked premium vehicles on street (slightly blurred), other commercial buildings in background (soft focus)',
  cameraAngle: 'front elevation view, straight-on composition, eye-level, 35mm lens',

  // Interior
  roomType: 'luxury living room',
  interiorStyle: 'Minimal Warm Contemporary',
  interiorWallMaterials: [
    { zone: 'Main Walls', material: 'smooth lime plaster, micro-texture variation, warm white tone' },
  ],
  floorMaterial: 'natural oak hardwood flooring, wide planks, matte finish, subtle grain variation',
  furnitureLayout: 'open-plan seating arrangement, modular sofa, low coffee table, accent armchair',
  ceilingType: 'smooth plastered flat ceiling with recessed LED cove lighting',
  interiorLighting: 'soft natural daylight from full-height windows supplemented by warm recessed LED downlights',
  colorTemp: 'mixed daylight + warm artificial (3000K–3500K)',
  interiorCameraAngle: 'eye-level interior view, 24–35mm lens, 1.2–1.5m camera height, verticals perfectly straight',
  timeOfDay: 'soft daylight',
  windowView: 'lush tropical garden visible through floor-to-ceiling glazing',
};
