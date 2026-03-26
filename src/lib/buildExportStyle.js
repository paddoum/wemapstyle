// Builds the export-ready MapLibre GL style — mirrors buildStyle() in MapLibreMap.jsx exactly.
// Any change to runtime rendering in MapLibreMap must be reflected here too.
import baseStyle from '../../data/wemap-base-style.json'

const GLYPH_URL = 'https://tiles.getwemap.com/fonts/{fontstack}/{range}.pbf'

const WATER_LABEL_LAYERS = [
  'water_name_line', 'water_name_point_ocean', 'water_name_point_sea',
]

const PLACE_LABEL_LAYERS = [
  'poi_z12_poi_label_1',
  'road_label', 'road_label_small', 'road_label_medium', 'road_label_large',
  'place_other', 'place_village', 'place_town', 'place_city',
  'country_3', 'country_2', 'country_1',
]

const LABEL_LAYERS = [...WATER_LABEL_LAYERS, ...PLACE_LABEL_LAYERS]

const FONT_STACKS = {
  'Open Sans':        ['Open_Sans_Regular',        'Open_Sans_Regular'],
  'Noto Sans':        ['Noto Sans Regular',         'Noto Sans Regular'],
  'Roboto':           ['Roboto Regular',            'Roboto Regular'],
  'Manrope':          ['Manrope Regular',           'Manrope Regular'],
  'Myriad Pro':       ['Myriad Pro Regular',        'Myriad Pro Regular'],
  'Cheltenham':       ['Cheltenham ITC Pro Book',   'Cheltenham ITC Pro Book'],
  'Zurich':           ['Zurich TL Roman',           'Zurich TL Roman'],
}
const DEFAULT_FONT_STACK = FONT_STACKS['Open Sans']

function fontStackFromPalette(palette) {
  return FONT_STACKS[palette.font] ?? DEFAULT_FONT_STACK
}

function getPaintOverrides(palette) {
  const { background, water, green, roadPrimary, roadCasing, roadMinor, waterLabel, building, border, rail } = palette
  return {
    background:                   { prop: 'background-color', value: background },
    water:                        { prop: 'fill-color',       value: water },
    waterway_tunnel:              { prop: 'line-color',       value: water },
    waterway_river:               { prop: 'line-color',       value: water },
    waterway_other:               { prop: 'line-color',       value: water },
    'landcover-park':             { prop: 'fill-color',       value: green },
    'landcover-wood':             { prop: 'fill-color',       value: green },
    'landcover-forest':           { prop: 'fill-color',       value: green },
    'landcover-farmland':         { prop: 'fill-color',       value: green },
    park:                         { prop: 'fill-color',       value: green },
    road_trunk_primary:           { prop: 'line-color',       value: roadPrimary },
    bridge_trunk_primary:         { prop: 'line-color',       value: roadPrimary },
    tunnel_trunk_primary:         { prop: 'line-color',       value: roadPrimary },
    road_motorway:                { prop: 'line-color',       value: roadPrimary },
    bridge_motorway:              { prop: 'line-color',       value: roadPrimary },
    tunnel_motorway:              { prop: 'line-color',       value: roadPrimary },
    bridge_motorway_link:         { prop: 'line-color',       value: roadPrimary },
    road_trunk_primary_casing:    { prop: 'line-color',       value: roadCasing },
    road_motorway_casing:         { prop: 'line-color',       value: roadCasing },
    bridge_trunk_primary_casing:  { prop: 'line-color',       value: roadCasing },
    bridge_motorway_casing:       { prop: 'line-color',       value: roadCasing },
    road_minor:                   { prop: 'line-color',       value: roadMinor },
    road_secondary_tertiary:      { prop: 'line-color',       value: roadMinor },
    road_link:                    { prop: 'line-color',       value: roadMinor },
    ...(building ? { 'building-top': { prop: 'fill-color', value: building } } : {}),
    ...(border ? {
      boundary_3:         { prop: 'line-color', value: border },
      'boundary_2_z0-4':  { prop: 'line-color', value: border },
      'boundary_2_z5-':   { prop: 'line-color', value: border },
    } : {}),
    ...(rail ? {
      road_major_rail:     { prop: 'line-color', value: rail },
      road_transit_rail:   { prop: 'line-color', value: rail },
      tunnel_major_rail:   { prop: 'line-color', value: rail },
      tunnel_transit_rail: { prop: 'line-color', value: rail },
      bridge_major_rail:   { prop: 'line-color', value: rail },
      bridge_transit_rail: { prop: 'line-color', value: rail },
    } : {}),
    water_name_line:        { prop: 'text-color', value: waterLabel },
    water_name_point_ocean: { prop: 'text-color', value: waterLabel },
    water_name_point_sea:   { prop: 'text-color', value: waterLabel },
  }
}

function labelOpacityValue(palette) {
  const opacity  = Math.max(0, Math.min(1, palette.labelOpacity ?? 1))
  const minZoom  = palette.labelMinZoom  ?? null
  const maxZoom  = palette.labelMaxZoom  ?? null
  const hideFrom = palette.labelHideFrom ?? null
  const hideTo   = palette.labelHideTo   ?? null

  if ((hideFrom !== null) !== (hideTo !== null)) {
    // partial pair — fall through to flat opacity
  } else if (hideFrom !== null && hideTo !== null) {
    const from = Math.min(hideFrom, hideTo)
    const to   = Math.max(hideFrom, hideTo)
    if (from === to) return opacity
    return ['step', ['zoom'], opacity, from, 0, to, opacity]
  }

  if (minZoom !== null && maxZoom !== null) {
    const lo = Math.min(minZoom, maxZoom)
    const hi = Math.max(minZoom, maxZoom)
    return ['step', ['zoom'], 0, lo, opacity, hi, 0]
  }
  if (minZoom !== null) return ['step', ['zoom'], 0, minZoom, opacity]
  if (maxZoom !== null) return ['step', ['zoom'], opacity, maxZoom, 0]
  return opacity
}

export function buildExportStyle(palette, styleName = 'wemapstyle-export') {
  const overrides    = getPaintOverrides(palette)
  const labelOpacity = labelOpacityValue(palette)
  const labelColor   = palette.labelColor ?? null
  const labelHalo    = palette.labelHalo  ?? null
  const fontStack    = fontStackFromPalette(palette)

  const layers = baseStyle.layers.map((layer) => {
    let updated = layer
    const ov = overrides[layer.id]
    if (ov) updated = { ...updated, paint: { ...updated.paint, [ov.prop]: ov.value } }

    if (layer.layout?.['text-font']) {
      updated = { ...updated, layout: { ...updated.layout, 'text-font': fontStack } }
    }

    if (LABEL_LAYERS.includes(layer.id)) {
      const paint = { ...updated.paint, 'text-opacity': labelOpacity }
      if (labelHalo)  paint['text-halo-color'] = labelHalo
      if (labelColor && PLACE_LABEL_LAYERS.includes(layer.id)) paint['text-color'] = labelColor
      updated = { ...updated, paint }
    }

    return updated
  })

  return {
    ...baseStyle,
    name: styleName,
    glyphs: GLYPH_URL,
    layers,
    metadata: {
      ...baseStyle.metadata,
      'wemapstyle:generated': true,
      'wemapstyle:colors': {
        background:   palette.background,
        water:        palette.water,
        green:        palette.green,
        road_primary: palette.roadPrimary,
        road_minor:   palette.roadMinor,
      },
    },
  }
}
