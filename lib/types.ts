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
  // Section 01 — Project Basics
  buildingType: string;
  archStyle: string;
  floors: string;
  revitMode: boolean;

  // Section 02 — Building Form & Silhouette
  buildingForm: string;
  massingNotes: string;

  // Section 03 — Materials & Facade
  wallFinish: string;
  accentMat: string;

  // Section 04 — Facade Elements (multi-select)
  facadeElements: string[];

  // Section 04 — Fin Details (conditional)
  finWidth: string;
  finHeight: string;
  finMaterial: string;
  finSpacing: string;

  // Section 04 — Slab Details (conditional)
  slabDepth: string;
  slabFinish: string;

  // Section 05 — Glazing & Openings
  windows: string;
  glazingTint: string;

  // Section 06 — Roof
  roofStyle: string;

  // Section 07 — Lighting & Environment
  lightMood: string;
  landscape: string;
  cameraAngle: string;

  // Section 08 — AI Tool
  aiTool: AiTool;

  // Section 09 — Additional Notes
  extraNotes: string;
}

// ─── Defaults ───────────────────────────────────────────────────
export const DEFAULT_FORM_DATA: PromptFormData = {
  buildingType: '',
  archStyle: 'modern-classic Nigerian residential',
  floors: 'two storey',
  revitMode: false,
  buildingForm: 'rectangular box massing, straight orthogonal facades on all sides',
  massingNotes: '',
  wallFinish: 'smooth off-white painted render',
  accentMat: 'natural stone cladding',
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
  aiTool: 'chatgpt',
  extraNotes: '',
};
