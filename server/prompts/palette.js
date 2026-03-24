const LAYER_MAP = `
## Palette fields → MapLibre layers

| Field        | Paint property      | Affected layer groups                                      |
|--------------|---------------------|------------------------------------------------------------|
| background   | background-color    | background (canvas fill)                                   |
| water        | fill-color/line-color | water (polygon), waterway_tunnel/river/other (lines)     |
| green        | fill-color          | landcover-park, landcover-wood, landcover-forest, landcover-farmland, park |
| roadPrimary  | line-color          | road_trunk_primary, road_motorway, bridge_*, tunnel_*      |
| roadCasing   | line-color          | road_trunk_primary_casing, road_motorway_casing, bridge_*_casing |
| roadMinor    | line-color          | road_minor, road_secondary_tertiary, road_link             |
| building     | fill-color          | building-top (visible from z16+)                           |
| border       | line-color          | boundary_3, boundary_2_z0-4, boundary_2_z5- (admin boundaries at all levels) |
| rail         | line-color          | road_major_rail, road_transit_rail + bridge/tunnel variants |
| waterLabel   | text-color          | water_name_line, water_name_point_ocean, water_name_point_sea |
| labelColor   | text-color          | place labels (place_other/village/town/city, country_1/2/3), road labels (road_label_*), poi_z12_poi_label_1 |
| labelHalo    | text-halo-color     | all symbol layers (waterLabel layers + all labelColor layers) |
| labelOpacity | text-opacity        | all symbol layers (0 = hidden, 0.5 = faded, 1 = full)     |
| labelMinZoom | text-opacity (step) | all symbol layers — labels hidden below this zoom level    |
| labelMaxZoom | text-opacity (step) | all symbol layers — labels hidden at and above this zoom level |
| labelHideFrom | text-opacity (step) | all symbol layers — start of suppression range (labels hidden from this zoom) |
| labelHideTo   | text-opacity (step) | all symbol layers — end of suppression range (labels visible again from this zoom) |

## Zoom level semantics
- z0–z4:  country/continent names only
- z5–z7:  country borders, major water bodies
- z8–z11: cities, main roads, rivers
- z12–z14: neighborhoods, secondary roads, parks, POIs
- z15+:  street-level detail, building outlines, all POIs

## Key design rules
- roadCasing sits below roadPrimary visually — make it darker for contrast
- waterLabel must stay legible on the water fill color (pick high-contrast shade)
- labelHalo improves legibility over complex backgrounds — use a light/white halo on dark maps and a dark halo on light maps
- labelColor defaults to whatever the base style defines; only set it when you need a specific override
- labelMinZoom is useful for minimal styles (e.g. show place names only from z10 up)
- Buildings are not in the palette — they inherit the base style's colors`

export function buildGeneratePrompt(userPrompt) {
  return `You are a map style designer for MapLibre GL JS.

The user wants a map with this style: "${userPrompt}"

Return ONLY a JSON object with these exact keys — no explanation, no markdown:
{
  "background": "#hex",
  "water": "#hex",
  "green": "#hex",
  "roadPrimary": "#hex",
  "roadCasing": "#hex",
  "roadMinor": "#hex",
  "building": "#hex",
  "border": "#hex",
  "rail": "#hex",
  "waterLabel": "#hex",
  "labelColor": null,
  "labelHalo": null,
  "labelOpacity": 1,
  "labelMinZoom": null,
  "labelMaxZoom": null,
  "labelHideFrom": null,
  "labelHideTo": null,
  "summary": {
    "headline": "Done — [one sentence outcome].",
    "bullets": [
      "[color decision 1 with hex]",
      "[color decision 2 with hex]",
      "[color decision 3 with hex]",
      "[color decision 4 with hex]"
    ]
  }
}
${LAYER_MAP}

Rules:
- Colors must be valid hex values; use null for labelColor and labelHalo when not needed
- roadCasing should be a darker shade of roadPrimary
- building: choose a color that contrasts gently with the background (default grey is #c1bfbf)
- border: admin boundary lines — default grey (#b2b0b0); darken for political maps, lighten/remove for minimal styles
- rail: rail and transit lines — default white (#ffffff on road, #dedede on bridges); use a distinct color (e.g. dark grey, orange) to highlight transit networks
- waterLabel should be legible on the water color
- labelColor: null = keep base style label color; "#hex" = override place/road/POI text color
- labelHalo: null = keep base style halo; "#hex" = override halo for all labels (great for dark-map legibility)
- labelOpacity: 0 = no labels, 0.5 = faded labels, 1 = full labels (default 1)
- labelMinZoom: null = no min threshold; a number (e.g. 10) = labels only appear at that zoom and above
- labelMaxZoom: null = no max threshold; a number (e.g. 14) = labels hidden at that zoom and above (useful for overview/minimal styles)
- labelHideFrom + labelHideTo: use BOTH together to suppress labels within a zoom range while keeping them visible outside it — e.g. labelHideFrom:10, labelHideTo:14 = labels visible below z10 and from z14+, hidden between z10–z14. When using this pair, set labelMinZoom and labelMaxZoom to null.
- IMPORTANT: when using any zoom range field (labelMinZoom, labelMaxZoom, labelHideFrom, labelHideTo), labelOpacity MUST be > 0 (e.g. 1) otherwise labels will be hidden everywhere instead of only in the specified range
- summary.headline must start with "Done — "
- bullets describe the actual color choices made`
}

export function buildRefinePrompt(userPrompt, currentPalette, refinementPrompt) {
  return `You are a map style designer for MapLibre GL JS.

The user previously requested: "${userPrompt}"

The current map palette is:
${JSON.stringify(currentPalette, null, 2)}

The user now wants to refine it: "${refinementPrompt}"

Return ONLY a JSON object with these exact keys — no explanation, no markdown:
{
  "background": "#hex",
  "water": "#hex",
  "green": "#hex",
  "roadPrimary": "#hex",
  "roadCasing": "#hex",
  "roadMinor": "#hex",
  "building": "#hex",
  "border": "#hex",
  "rail": "#hex",
  "waterLabel": "#hex",
  "labelColor": null,
  "labelHalo": null,
  "labelOpacity": 1,
  "labelMinZoom": null,
  "labelMaxZoom": null,
  "labelHideFrom": null,
  "labelHideTo": null,
  "summary": {
    "headline": "Done — [one sentence describing the change].",
    "bullets": [
      "[what changed and why, with hex]",
      "[what changed and why, with hex]",
      "[what stayed the same and why]",
      "[overall effect of the change]"
    ]
  }
}
${LAYER_MAP}

Rules:
- Colors must be valid hex values; use null for labelColor and labelHalo when not needed
- roadCasing should be a darker shade of roadPrimary
- building: choose a color that contrasts gently with the background (default grey is #c1bfbf)
- border: admin boundary lines — default grey (#b2b0b0); darken for political maps, lighten/remove for minimal styles
- rail: rail and transit lines — default white (#ffffff on road, #dedede on bridges); use a distinct color (e.g. dark grey, orange) to highlight transit networks
- waterLabel should be legible on the water color
- labelColor: null = keep base style label color; "#hex" = override place/road/POI text color
- labelHalo: null = keep base style halo; "#hex" = override halo for all labels (great for dark-map legibility)
- labelOpacity: 0 = no labels, 0.5 = faded labels, 1 = full labels (default 1)
- labelMinZoom: null = no min threshold; a number (e.g. 10) = labels only appear at that zoom and above
- labelMaxZoom: null = no max threshold; a number (e.g. 14) = labels hidden at that zoom and above (useful for overview/minimal styles)
- labelHideFrom + labelHideTo: use BOTH together to suppress labels within a zoom range while keeping them visible outside it — e.g. labelHideFrom:10, labelHideTo:14 = labels visible below z10 and from z14+, hidden between z10–z14. When using this pair, set labelMinZoom and labelMaxZoom to null.
- IMPORTANT: when using any zoom range field (labelMinZoom, labelMaxZoom, labelHideFrom, labelHideTo), labelOpacity MUST be > 0 (e.g. 1) otherwise labels will be hidden everywhere instead of only in the specified range
- summary.headline must start with "Done — "
- Only change what the refinement prompt calls for; keep other values stable`
}
