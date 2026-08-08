import { SelectOption, ChipOption } from "./types";

// Maps a long descriptive field value back to its short dropdown label
// (e.g. "front elevation view, straight-on..." -> "Front Elevation"), so
// summaries stay readable instead of showing the full prompt-length value.
export function shortLabel(value: string, options: SelectOption[]): string {
  const match = options.find((o) => o.value === value);
  if (match) return match.label;
  return value.split(",")[0].trim();
}

export interface BuilderOptions {
  // Exterior options
  buildingTypes: SelectOption[];
  archStyles: SelectOption[];
  floors: SelectOption[];
  buildingForms: ChipOption[];
  wallFinishes: SelectOption[];
  accentMaterials: SelectOption[];
  facadeMaterialOptions: SelectOption[];
  facadeZones: SelectOption[];
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
  // Interior options
  roomTypes: SelectOption[];
  interiorStyles: ChipOption[];
  furnitureLayouts: SelectOption[];
  interiorWallFinishes: SelectOption[];
  interiorWallZones: SelectOption[];
  floorMaterials: SelectOption[];
  ceilingTypes: SelectOption[];
  interiorLightings: SelectOption[];
  colorTemps: SelectOption[];
  interiorCameraAngles: SelectOption[];
  timeOfDays: ChipOption[];
  windowViews: SelectOption[];
}

// ─── Section 01 — Project Basics ────────────────────────────────

export const BUILDING_TYPES: SelectOption[] = [
  { label: "— Select —", value: "" },
  { label: "Residential Bungalow", value: "residential bungalow" },
  { label: "Two-Storey Duplex", value: "two-storey duplex" },
  { label: "Terrace / Row House", value: "terrace row house, one of a matching attached row" },
  { label: "Luxury Villa", value: "luxury villa" },
  { label: "Apartment Block", value: "apartment block" },
  { label: "Commercial Office Building", value: "commercial office building" },
  { label: "Mixed-Use Development", value: "mixed-use development" },
  { label: "Retail Building", value: "retail building" },
  { label: "Hospitality / Hotel", value: "hospitality / hotel" },
  { label: "Institutional Building", value: "institutional building" },
  { label: "Church / Chapel", value: "church, Christian place of worship" },
  { label: "Mosque", value: "mosque, Islamic place of worship" },
  { label: "School / Educational Building", value: "school building, educational institution" },
  { label: "Healthcare Facility / Clinic", value: "healthcare facility, hospital or clinic building" },
  { label: "Industrial / Warehouse", value: "industrial warehouse and logistics building" },
  { label: "Event Centre / Banquet Hall", value: "event centre, banquet and function hall" },
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
  {
    label: "Single-Volume Hall",
    value:
      "single large-span column-free volume, one continuous roof over the whole footprint, tall proportions relative to footprint — not broken into separate wings or storeys",
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
  {
    label: "Natural Stone Cladding",
    value: "natural stone cladding walls, textured stone surface",
  },
  { label: "Red Brick", value: "exposed red brick walls" },
  { label: "Timber Cladding", value: "natural timber cladding panels" },
  {
    label: "Terracotta Painted Render",
    value: "terracotta-painted smooth render",
  },
  {
    label: "Charcoal Painted Render",
    value: "charcoal dark grey painted render",
  },
  {
    label: "Deep Blue Painted Render",
    value: "deep navy blue painted render",
  },
  {
    label: "Warm Sand Painted Render",
    value: "warm sand-toned painted render",
  },
  { label: "Olive Green Painted Render", value: "olive green painted render" },
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

// Combined pool for the facade material-zone assignment rows — a zone
// might reasonably take either a "wall finish" or an "accent" material.
export const FACADE_MATERIAL_OPTIONS: SelectOption[] = [
  ...WALL_FINISHES,
  ...ACCENT_MATERIALS,
];

// Where a facade material can be applied — mirrors how a 3D rendering
// tool lets you assign a material to a specific face/element, adapted
// to a text-prompt tool (no real geometry to click on).
export const FACADE_ZONES: SelectOption[] = [
  { label: "Front / Primary Facade", value: "Front / Primary Facade" },
  { label: "Side Elevations", value: "Side Elevations" },
  { label: "Rear Elevation", value: "Rear Elevation" },
  { label: "Ground Floor / Base", value: "Ground Floor / Base" },
  { label: "Upper Floors", value: "Upper Floors" },
  { label: "Accent / Feature Areas", value: "Accent / Feature Areas" },
  { label: "Roof Fascia / Parapet", value: "Roof Fascia / Parapet" },
  { label: "Window Surrounds / Reveals", value: "Window Surrounds / Reveals" },
  { label: "Columns / Structural Piers", value: "Columns / Structural Piers" },
  { label: "Balcony Fronts", value: "Balcony Fronts" },
  { label: "Entrance Feature", value: "Entrance Feature" },
];

// Where an interior wall material can be applied.
export const INTERIOR_WALL_ZONES: SelectOption[] = [
  { label: "Main Walls", value: "Main Walls" },
  { label: "Accent / Feature Wall", value: "Accent / Feature Wall" },
  { label: "Wall Behind TV / Media Unit", value: "Wall Behind TV / Media Unit" },
  { label: "Headboard Wall (Behind Bed)", value: "Headboard Wall (Behind Bed)" },
  { label: "Wainscoting / Lower Wall Band", value: "Wainscoting / Lower Wall Band" },
  { label: "Wet Wall (Kitchen / Bath Splashback)", value: "Wet Wall (Kitchen / Bath Splashback)" },
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
  {
    label: "Domed Roof",
    value:
      "central dome roof, smooth curved profile, clearly a dome silhouette against the sky — not a flat or pitched roof",
  },
  {
    label: "Spire / Steeple",
    value:
      "tall pointed spire or steeple rising from the roofline, clearly the tallest element of the building, slender and vertical",
  },
  {
    label: "Minaret Tower",
    value:
      "slender minaret tower adjacent to the main roof, distinct from the main massing, topped with a small dome or crown",
  },
  {
    label: "Large-Span Portal Frame",
    value:
      "large-span portal frame roof (warehouse/hall type), long uninterrupted ridge line, corrugated metal cladding, no internal columns visible from outside",
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

// ─── Section I-01 — Interior: Room Type ─────────────────────────

export const ROOM_TYPES: SelectOption[] = [
  { label: "— Select —", value: "" },
  { label: "Luxury Living Room", value: "luxury living room" },
  { label: "Master Bedroom", value: "master bedroom suite" },
  { label: "Open-Plan Kitchen & Dining", value: "open-plan kitchen and dining area" },
  { label: "Home Office / Study", value: "executive home office and study" },
  { label: "Master Bathroom", value: "master ensuite bathroom" },
  { label: "Children's Bedroom", value: "children's bedroom" },
  { label: "Dining Room", value: "formal dining room" },
  { label: "Entrance Lobby / Foyer", value: "grand entrance lobby and foyer" },
  { label: "Cinema Room", value: "private home cinema room" },
  { label: "Gym / Wellness Room", value: "home gym and wellness room" },
  { label: "Library / Reading Lounge", value: "private library and reading lounge" },
];

// ─── Section I-01 — Interior: Style ─────────────────────────────

export const INTERIOR_STYLES: ChipOption[] = [
  { label: "Minimal Warm Contemporary", value: "minimal warm contemporary" },
  { label: "Luxury Maximalist", value: "luxury maximalist" },
  { label: "Japandi / Wabi-Sabi", value: "japandi wabi-sabi" },
  { label: "Afro-Contemporary", value: "afro-contemporary" },
  { label: "Industrial Loft", value: "industrial loft" },
  { label: "Classic Traditional", value: "classic traditional" },
  { label: "Tropical Luxe", value: "tropical luxe" },
  { label: "Scandinavian Minimal", value: "scandinavian minimal" },
];

// ─── Section I-02 — Interior: Furniture Layout ──────────────────

export const FURNITURE_LAYOUTS: SelectOption[] = [
  { label: "Open-Plan Seating", value: "open-plan seating arrangement, modular sofa, low coffee table, accent armchair" },
  { label: "Symmetrical Formal", value: "symmetrical formal arrangement, matching sofas facing each other, central console table" },
  { label: "Conversation Cluster", value: "intimate conversation cluster, L-shaped sofa, two accent chairs, round coffee table" },
  { label: "Minimal Floating", value: "minimal floating furniture layout, generous negative space, single-piece statement sofa" },
  { label: "Dining-Focused", value: "dining-focused layout, long statement table, upholstered dining chairs, buffet sideboard" },
  { label: "Bed-Centred Suite", value: "bed-centred suite layout, upholstered platform bed, matching side tables, dresser" },
  { label: "Study / Desk Setup", value: "dedicated study setup, large L-shaped desk, ergonomic chair, built-in shelving wall" },
];

// ─── Section I-02 — Interior: Wall Finish ───────────────────────

export const INTERIOR_WALL_FINISHES: SelectOption[] = [
  { label: "Smooth Lime Plaster", value: "smooth lime plaster, micro-texture variation, warm white tone" },
  { label: "Venetian Plaster", value: "venetian plaster, polished reflective surface, marble-like depth" },
  { label: "Textured Concrete Panel", value: "raw textured concrete panel cladding, grey industrial tone" },
  { label: "Warm Timber Slats", value: "warm timber vertical slat cladding, natural grain, linear rhythm" },
  { label: "Painted Plaster — Deep Colour", value: "smooth painted plaster walls in a deep saturated colour (forest green / navy / terracotta)" },
  { label: "Stone Feature Wall", value: "natural stone feature wall, rough-hewn texture, organic pattern" },
  { label: "White Painted Plaster", value: "clean white smooth painted plaster walls" },
  { label: "Fabric Panels", value: "upholstered fabric wall panels in neutral linen texture" },
];

// ─── Section I-02 — Interior: Floor Material ────────────────────

export const FLOOR_MATERIALS: SelectOption[] = [
  { label: "Natural Oak Hardwood", value: "natural oak hardwood flooring, wide planks, matte finish, subtle grain variation" },
  { label: "Polished Concrete", value: "polished concrete floor, smooth reflective surface, light grey tone" },
  { label: "Large-Format Marble Tiles", value: "large-format white marble tiles (900×900mm+), polished surface, subtle grey veining" },
  { label: "Walnut Herringbone Parquet", value: "walnut herringbone parquet flooring, warm dark brown tones, satin lacquer finish" },
  { label: "Porcelain Stone-Effect", value: "large-format porcelain tiles with stone texture effect, beige-grey tone, matt finish" },
  { label: "Travertine", value: "natural travertine stone floor tiles, warm cream tones, slightly textured surface" },
  { label: "Terrazzo", value: "terrazzo floor, light base with warm aggregate chips visible" },
  { label: "Dark Smoked Oak", value: "dark smoked oak hardwood planks, deep grey-brown tone, brushed matte finish" },
];

// ─── Section I-03 — Interior: Ceiling Type ──────────────────────

export const CEILING_TYPES: SelectOption[] = [
  { label: "Flat Plastered + Cove LED", value: "smooth plastered flat ceiling with recessed LED cove lighting" },
  { label: "Coffered Ceiling", value: "deep coffered ceiling with geometric grid pattern and recessed lighting in each coffer" },
  { label: "Timber Slat Ceiling", value: "warm timber slat suspended ceiling, linear strips with hidden LED strips between" },
  { label: "Exposed Concrete", value: "exposed raw concrete ceiling with visible form-board texture" },
  { label: "Vaulted / Arched", value: "vaulted barrel-arch ceiling in smooth plaster, central pendant fitting" },
  { label: "High Ceiling + Pendant", value: "double-height soaring ceiling, large architectural pendant light as centrepiece" },
  { label: "Acoustic Panels", value: "acoustic ceiling panels in a geometric pattern, off-white colour, flush grid" },
];

// ─── Section I-03 — Interior: Lighting ──────────────────────────

export const INTERIOR_LIGHTINGS: SelectOption[] = [
  { label: "Natural Daylight + Warm Downlights", value: "soft natural daylight from full-height windows supplemented by warm recessed LED downlights" },
  { label: "Dramatic Artificial — Evening", value: "dramatic evening artificial lighting, warm amber downlights, accent uplights, glowing pendant" },
  { label: "Bright Overcast Natural", value: "bright overcast natural light flooding through large glazing, soft uniform diffused light" },
  { label: "Golden Hour Warm", value: "golden hour sunlight raking through windows, warm patches of sunlight on floors and walls" },
  { label: "Candlelit / Moody Low", value: "moody low-key lighting, soft candlelit ambience, pools of warm light in darkness" },
  { label: "Daylight + Cove LED", value: "balanced daylight supplemented by warm cove LED indirect lighting on ceiling perimeter" },
];

// ─── Section I-03 — Interior: Colour Temperature ────────────────

export const COLOR_TEMPS: SelectOption[] = [
  { label: "Mixed Daylight + Warm (3000–3500K)", value: "mixed daylight + warm artificial (3000K–3500K)" },
  { label: "Warm White (2700K)", value: "warm white 2700K lighting, amber-toned, intimate atmosphere" },
  { label: "Natural White (4000K)", value: "natural white 4000K lighting, balanced neutral tone" },
  { label: "Cool Daylight (5500K+)", value: "cool daylight 5500K+, crisp bright atmosphere" },
  { label: "Candlelight (1800–2200K)", value: "candlelight tone 1800–2200K, deep amber, very warm and intimate" },
];

// ─── Section I-04 — Interior: Camera Angle ──────────────────────

export const INTERIOR_CAMERA_ANGLES: SelectOption[] = [
  { label: "Eye-Level Interior — Wide", value: "eye-level interior view, 24–35mm lens, 1.2–1.5m camera height, verticals perfectly straight" },
  { label: "Corner View — Showing Two Walls", value: "interior corner view showing two walls and ceiling, 24mm lens, wide angle perspective" },
  { label: "Long-Axis View", value: "long-axis view down the length of the room, 35mm lens, centred composition" },
  { label: "Looking Towards Window Wall", value: "interior view looking directly towards the main window wall, backlighting silhouette" },
  { label: "High Angle / Overhead", value: "high angle overhead view looking down into space, isometric feel, 45-degree down tilt" },
  { label: "Low Angle — Drama", value: "low camera angle (0.5m height), exaggerates ceiling height, dramatic perspective" },
];

// ─── Section I-04 — Interior: Time of Day ───────────────────────

export const TIME_OF_DAYS: ChipOption[] = [
  { label: "Soft Morning Light", value: "soft morning daylight" },
  { label: "Bright Midday", value: "bright midday natural light" },
  { label: "Golden Afternoon", value: "warm golden afternoon light" },
  { label: "Dusk / Blue Hour", value: "dusk blue hour, warm interior lights activating" },
  { label: "Night — Artificial Only", value: "night render, all artificial interior lights on, no natural light" },
];

// ─── Section I-04 — Interior: Window View ───────────────────────

export const WINDOW_VIEWS: SelectOption[] = [
  { label: "Lush Tropical Garden", value: "lush tropical garden visible through floor-to-ceiling glazing" },
  { label: "Urban Skyline", value: "urban city skyline view through large windows, blurred background" },
  { label: "Infinity Pool & Ocean", value: "infinity pool edge and ocean horizon visible through full-height glazing" },
  { label: "Manicured Private Garden", value: "manicured private garden with lawn and hedges visible beyond" },
  { label: "Dense Green Forest", value: "dense green forest / jungle visible beyond the glazing, immersive greenery" },
  { label: "Courtyard", value: "private internal courtyard visible through glazed wall" },
  { label: "No View / Solid Wall", value: "no window view — solid wall on this elevation" },
];

export const DEFAULT_BUILDER_OPTIONS: BuilderOptions = {
  // Exterior
  buildingTypes: BUILDING_TYPES,
  archStyles: ARCH_STYLES,
  floors: FLOOR_OPTIONS,
  buildingForms: BUILDING_FORMS,
  wallFinishes: WALL_FINISHES,
  accentMaterials: ACCENT_MATERIALS,
  facadeMaterialOptions: FACADE_MATERIAL_OPTIONS,
  facadeZones: FACADE_ZONES,
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
  // Interior
  roomTypes: ROOM_TYPES,
  interiorStyles: INTERIOR_STYLES,
  furnitureLayouts: FURNITURE_LAYOUTS,
  interiorWallFinishes: INTERIOR_WALL_FINISHES,
  interiorWallZones: INTERIOR_WALL_ZONES,
  floorMaterials: FLOOR_MATERIALS,
  ceilingTypes: CEILING_TYPES,
  interiorLightings: INTERIOR_LIGHTINGS,
  colorTemps: COLOR_TEMPS,
  interiorCameraAngles: INTERIOR_CAMERA_ANGLES,
  timeOfDays: TIME_OF_DAYS,
  windowViews: WINDOW_VIEWS,
};
