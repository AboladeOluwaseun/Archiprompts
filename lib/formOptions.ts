import { SelectOption, ChipOption } from "./types";

export interface BuilderOptions {
  buildingTypes: SelectOption[];
  archStyles: SelectOption[];
  floors: SelectOption[];
  buildingForms: ChipOption[];
  wallFinishes: SelectOption[];
  accentMaterials: SelectOption[];
  facadeElements: ChipOption[];
  finWidths: SelectOption[];
  finHeights: SelectOption[];
  finMaterials: SelectOption[];
  finSpacings: SelectOption[];
  slabDepths: SelectOption[];
  slabFinishes: SelectOption[];
  windowTypes: SelectOption[];
  glazingTints: SelectOption[];
  roofStyles: ChipOption[];
  lightingMoods: ChipOption[];
  landscapes: SelectOption[];
  cameraAngles: SelectOption[];
}

// ─── Section 01 — Project Basics ────────────────────────────────

export const BUILDING_TYPES: SelectOption[] = [
  { label: "— Select —", value: "" },
  { label: "Residential Bungalow", value: "residential bungalow" },
  { label: "Two-Storey Duplex", value: "two-storey duplex" },
  { label: "Luxury Villa", value: "luxury villa" },
  { label: "Apartment Block", value: "apartment block" },
  { label: "Commercial Office Building", value: "commercial office building" },
  { label: "Mixed-Use Development", value: "mixed-use development" },
  { label: "Retail Building", value: "retail building" },
  { label: "Hospitality / Hotel", value: "hospitality / hotel" },
  { label: "Institutional Building", value: "institutional building" },
];

export const ARCH_STYLES: SelectOption[] = [
  {
    label: "Modern-Classic Nigerian",
    value: "modern-classic Nigerian residential",
  },
  {
    label: "Contemporary West African Commercial",
    value: "contemporary West African commercial",
  },
  { label: "Contemporary Minimalist", value: "contemporary minimalist" },
  { label: "Tropical Modern", value: "tropical modern" },
  { label: "Afro-Contemporary", value: "Afro-contemporary" },
  { label: "Neo-Colonial", value: "neo-colonial" },
  { label: "Brutalist Modern", value: "brutalist modern" },
  { label: "Luxury Art Deco", value: "luxury art deco" },
  { label: "Mediterranean", value: "mediterranean" },
];

export const FLOOR_OPTIONS: SelectOption[] = [
  { label: "1 Storey", value: "single storey" },
  { label: "2 Storeys", value: "two storey" },
  { label: "3 Storeys", value: "three storey" },
  { label: "4 Storeys", value: "four storey" },
  { label: "5 Storeys", value: "five storey" },
  { label: "6 Storeys", value: "six storey" },
  { label: "7 Storeys", value: "seven storey" },
  { label: "8+ Storeys", value: "eight or more storey" },
];

// ─── Section 02 — Building Form & Silhouette ────────────────────

export const BUILDING_FORMS: ChipOption[] = [
  {
    label: "Rectangular / Box",
    value: "rectangular box massing, straight orthogonal facades on all sides",
  },
  {
    label: "Curved / Rounded Corner",
    value:
      "curved facade on the primary corner elevation, sweeping arc from one side to the other, no sharp corners on main face",
  },
  {
    label: "L-Shaped",
    value: "L-shaped massing, two wings meeting at 90 degrees",
  },
  {
    label: "Stepped / Terraced",
    value:
      "stepped massing, each floor stepping back from the one below, creating terraces",
  },
  {
    label: "Angular / Faceted",
    value: "angular / faceted facade, diagonal cuts and angled planes",
  },
  {
    label: "Cylindrical / Round",
    value: "cylindrical tower form, circular floor plan",
  },
  {
    label: "Organic / Freeform",
    value: "irregular organic curved form, flowing non-orthogonal massing",
  },
];

// ─── Section 03 — Materials & Facade ────────────────────────────

export const WALL_FINISHES: SelectOption[] = [
  { label: "Off-White Render", value: "smooth off-white painted render" },
  { label: "Light Grey Plaster", value: "light grey smooth plaster" },
  { label: "Fair-Faced Concrete", value: "exposed fair-faced concrete" },
  { label: "White Brick", value: "white painted brick" },
  {
    label: "White Concrete Frame",
    value: "smooth white reinforced concrete frame",
  },
  { label: "Sand-Finish Plaster", value: "textured sand-finished plaster" },
];

export const ACCENT_MATERIALS: SelectOption[] = [
  { label: "Natural Stone", value: "natural stone cladding" },
  {
    label: "Gold Aluminium Fins",
    value: "warm gold anodised aluminium vertical fins",
  },
  { label: "Wood Panels", value: "warm wood-textured panels" },
  { label: "Aluminium Composite", value: "dark aluminium composite panels" },
  { label: "Curtain Wall Only", value: "glazed curtain wall" },
  { label: "Red Brick", value: "exposed red brick" },
  { label: "Terracotta Panels", value: "terracotta rainscreen panels" },
  {
    label: "Perforated Metal Screen",
    value: "perforated metal screen cladding",
  },
];

// ─── Section 04 — Facade Elements (multi-select) ────────────────

export const FACADE_ELEMENTS: ChipOption[] = [
  {
    label: "Vertical Fins (Solid)",
    value:
      "vertical fins (IMPORTANT: these are SOLID opaque fins, NOT glass, NOT curtain wall — do not render them as glazing)",
  },
  {
    label: "Horizontal Brise-Soleil",
    value:
      "horizontal brise-soleil fins (IMPORTANT: SOLID concrete or metal horizontal projections, NOT glass)",
  },
  {
    label: "Curtain Wall Glazing",
    value:
      "full-height curtain wall glazing with dark tinted glass and aluminium mullions",
  },
  {
    label: "Punched Windows",
    value: "punched window openings set into solid walls",
  },
  {
    label: "Expressed Floor Slabs",
    value:
      "expressed horizontal floor slab bands with deep slab edge visible between floors",
  },
  {
    label: "Louvre Screens",
    value:
      "aluminium louvre screens (angled blades, semi-transparent, not solid)",
  },
  {
    label: "Spandrel Panels",
    value: "solid opaque spandrel panels between window bands",
  },
  {
    label: "Recessed Balconies",
    value: "recessed balconies cut into the facade volume",
  },
  {
    label: "Cantilevered Balconies",
    value: "cantilevered balconies projecting out from the facade",
  },
];

// ─── Section 04 — Fin Details (conditional) ─────────────────────

export const FIN_WIDTHS: SelectOption[] = [
  {
    label: "Narrow (100-150mm)",
    value: "narrow fins (approximately 100-150mm wide each)",
  },
  {
    label: "Medium (200-250mm)",
    value: "medium fins (approximately 200-250mm wide each)",
  },
  {
    label: "Wide (300-400mm)",
    value: "wide fins (approximately 300-400mm wide each)",
  },
];

export const FIN_HEIGHTS: SelectOption[] = [
  {
    label: "Single Floor Height",
    value: "fins spanning exactly one floor height",
  },
  {
    label: "Taller Than Floor Height",
    value:
      "fins spanning taller than one floor — extending through the full slab-to-slab height plus the slab depth above, creating fins that are visibly taller than a standard storey",
  },
  {
    label: "Full Building Height",
    value: "fins spanning full building height from ground to roof",
  },
];

export const FIN_MATERIALS: SelectOption[] = [
  { label: "Gold Aluminium", value: "warm gold anodised aluminium fins" },
  { label: "White Concrete", value: "white painted concrete fins" },
  { label: "Dark Grey Aluminium", value: "dark grey aluminium fins" },
  { label: "Bronze Aluminium", value: "bronze anodised aluminium fins" },
  { label: "Timber", value: "natural timber fins" },
  { label: "Raw Concrete", value: "raw concrete fins" },
];

export const FIN_SPACINGS: SelectOption[] = [
  {
    label: "Closely Spaced (tight rhythm)",
    value: "closely spaced fins with narrow gaps between each fin",
  },
  {
    label: "Regularly Spaced",
    value:
      "regularly spaced fins with equal gaps between each fin, gaps approximately same width as fins",
  },
  {
    label: "Widely Spaced",
    value: "widely spaced fins with large gaps between each fin",
  },
];

// ─── Section 04 — Slab Details (conditional) ────────────────────

export const SLAB_DEPTHS: SelectOption[] = [
  {
    label: "Shallow (300-400mm)",
    value:
      "shallow slab bands (approximately 300-400mm deep), creating thin horizontal lines between floors",
  },
  {
    label: "Medium (500-700mm)",
    value:
      "medium slab bands (approximately 500-700mm deep), clearly visible between floors",
  },
  {
    label: "Deep / Dramatic (800mm-1.2m)",
    value:
      "deep expressed slab bands (approximately 800mm-1.2m deep), dramatically taller than standard, creating strong horizontal shadow lines — these slab bands are notably taller than the window bands between them",
  },
];

export const SLAB_FINISHES: SelectOption[] = [
  { label: "White Painted", value: "white smooth painted concrete slab edges" },
  {
    label: "Off-White Plaster",
    value: "off-white smooth plastered slab edges",
  },
  {
    label: "Exposed Concrete",
    value: "fair-faced exposed concrete slab edges",
  },
  { label: "Dark Grey", value: "dark grey painted slab edges" },
];

// ─── Section 05 — Glazing & Openings ────────────────────────────

export const WINDOW_TYPES: SelectOption[] = [
  {
    label: "Dark Aluminium Casement",
    value: "dark grey aluminium casement windows, reflective double glazing",
  },
  {
    label: "Full Curtain Wall",
    value:
      "floor-to-ceiling curtain wall glazing, dark tinted glass, dark aluminium mullions",
  },
  {
    label: "Ribbon Windows",
    value:
      "horizontal ribbon windows spanning full facade width, dark aluminium frames",
  },
  { label: "White Timber Frame", value: "white timber framed windows" },
  { label: "Black Steel Frame", value: "slim black steel framed windows" },
  {
    label: "Bronze Aluminium",
    value: "bronze anodised aluminium framed windows",
  },
];

export const GLAZING_TINTS: SelectOption[] = [
  {
    label: "Dark Tinted Reflective",
    value:
      "dark tinted reflective glass showing sky and tree reflections on exterior surface",
  },
  {
    label: "Clear / Transparent",
    value: "clear float glass, interior visible through glass",
  },
  { label: "Blue Tinted", value: "blue-tinted reflective glass" },
  { label: "Bronze Tinted", value: "bronze tinted glass" },
  { label: "Grey Tinted", value: "grey tinted glass" },
];

// ─── Section 06 — Roof ──────────────────────────────────────────

export const ROOF_STYLES: ChipOption[] = [
  {
    label: "Flat Roof — Clean",
    value:
      "flat concrete roof with clean white painted parapet walls, no visible rooftop clutter",
  },
  {
    label: "Flat Roof + Plant Room",
    value:
      "flat roof with visible rooftop plant room enclosures, water tanks and lift overrun boxes",
  },
  {
    label: "Hip Roof — Charcoal",
    value: "large dark charcoal hip roof with steep pitch, stone-coated tiles",
  },
  {
    label: "Gable — Terracotta",
    value: "gable roof with terracotta clay tiles",
  },
  {
    label: "Butterfly Roof",
    value: "butterfly roof with dark metal standing seam cladding",
  },
  {
    label: "Mono-Pitch",
    value: "mono-pitch roof sloping in one direction, dark steel finish",
  },
];

// ─── Section 07 — Lighting & Environment ────────────────────────

export const LIGHTING_MOODS: ChipOption[] = [
  {
    label: "Midday — West African Sun",
    value:
      "bright West African midday sun, clear blue tropical sky, sharp crisp shadows cast by facade elements",
  },
  {
    label: "Golden Hour",
    value:
      "golden hour sunset, warm orange-pink sky gradient, long cinematic shadows, warm architectural wall lights",
  },
  {
    label: "Overcast / Moody",
    value:
      "overcast soft diffused lighting, moody grey sky, no harsh shadows, cool ambient light",
  },
  {
    label: "Dusk / Blue Hour",
    value:
      "dusk blue hour, deep blue-purple sky, warm interior lights glowing through all windows, exterior lights activated",
  },
  {
    label: "Night Render",
    value:
      "night render, dark sky, all exterior lights on, interior warm glow through windows, dramatic facade uplighting",
  },
];

export const LANDSCAPES: SelectOption[] = [
  {
    label: "Urban Commercial — Lagos/Accra",
    value:
      "urban Lagos / Accra commercial district street context, clean wide concrete pavement, mature tropical trees lining the street (slightly blurred), parked premium vehicles on street (slightly blurred), other commercial buildings in background (soft focus)",
  },
  {
    label: "Tropical Nigerian Residential",
    value:
      "lush tropical Nigerian residential garden context, mature palm trees, ornamental shrubs, manicured lawn, flower beds, clean interlocking paved driveway",
  },
  {
    label: "Minimalist Garden",
    value:
      "minimalist landscaping, manicured hedges, clean gravel pathways, ornamental grasses",
  },
  {
    label: "Dense Tropical",
    value: "dense tropical vegetation, natural site, exotic planting",
  },
  {
    label: "Savanna / Arid",
    value:
      "arid savanna landscape, dry grasses, sparse planting, laterite soil",
  },
];

export const CAMERA_ANGLES: SelectOption[] = [
  {
    label: "Front Elevation",
    value:
      "front elevation view, straight-on composition, eye-level, 35mm lens",
  },
  {
    label: "3/4 View (Street)",
    value:
      "three-quarter 45-degree view showing front and side facades simultaneously, eye-level, 35mm lens, slight upward tilt to emphasise height",
  },
  {
    label: "Aerial / Drone",
    value:
      "aerial bird's eye drone view, 60-degree angle looking down, full site and roof visible",
  },
  {
    label: "Worm's Eye",
    value:
      "worm's eye view, low angle looking up at building, dramatic perspective",
  },
  {
    label: "Interior Looking Out",
    value:
      "interior view looking outward through large windows to the exterior context",
  },
];

export const DEFAULT_BUILDER_OPTIONS: BuilderOptions = {
  buildingTypes: BUILDING_TYPES,
  archStyles: ARCH_STYLES,
  floors: FLOOR_OPTIONS,
  buildingForms: BUILDING_FORMS,
  wallFinishes: WALL_FINISHES,
  accentMaterials: ACCENT_MATERIALS,
  facadeElements: FACADE_ELEMENTS,
  finWidths: FIN_WIDTHS,
  finHeights: FIN_HEIGHTS,
  finMaterials: FIN_MATERIALS,
  finSpacings: FIN_SPACINGS,
  slabDepths: SLAB_DEPTHS,
  slabFinishes: SLAB_FINISHES,
  windowTypes: WINDOW_TYPES,
  glazingTints: GLAZING_TINTS,
  roofStyles: ROOF_STYLES,
  lightingMoods: LIGHTING_MOODS,
  landscapes: LANDSCAPES,
  cameraAngles: CAMERA_ANGLES,
};
