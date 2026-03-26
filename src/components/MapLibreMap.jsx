// Map panel — real MapLibre GL JS with Wemap tile source + palette-driven colors
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import baseStyle from '../../data/wemap-base-style.json'
import { PALETTES } from '@/lib/palettes'

const AREA_COORDS = {
  'city-centre': { center: [2.3488, 48.8534], zoom: 14 },
  'small-town':  { center: [3.0800, 50.6300], zoom: 13 },
  'countryside': { center: [1.8000, 47.5000], zoom: 10 },
}

const ZOOM_VALUES = { z5: 5, z10: 10, z14: 14, z17: 17 }

// Water labels (semantic blue family — styled separately from place/road labels)
const WATER_LABEL_LAYERS = [
  'water_name_line', 'water_name_point_ocean', 'water_name_point_sea',
]

// Place, road, and POI labels — controlled by labelColor
const PLACE_LABEL_LAYERS = [
  'poi_z12_poi_label_1',
  'road_label', 'road_label_small', 'road_label_medium', 'road_label_large',
  'place_other', 'place_village', 'place_town', 'place_city',
  'country_3', 'country_2', 'country_1',
]

// All symbol layers — used for labelOpacity and labelHalo
const LABEL_LAYERS = [...WATER_LABEL_LAYERS, ...PLACE_LABEL_LAYERS]

// Base paint values — used to reset nullable overrides in applyPalette (P-1)
const BASE_PAINT = Object.fromEntries(
  baseStyle.layers.filter(l => l.paint).map(l => [l.id, l.paint])
)

// Font family → OpenMapTiles fontstack (with Noto Sans fallback for broad glyph coverage)
const GLYPH_URL = 'https://tiles.getwemap.com/fonts/{fontstack}/{range}.pbf'

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
  const { background, water, green, roadPrimary, roadCasing, roadMinor, waterLabel, building, border, rail, landuse } = palette
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
    landuse_cemetery:             { prop: 'fill-color',       value: green },
    ...(landuse ? {
      landuse_hospital: { prop: 'fill-color', value: landuse },
      landuse_school:   { prop: 'fill-color', value: landuse },
    } : {}),
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
      road_major_rail:          { prop: 'line-color', value: rail },
      road_transit_rail:        { prop: 'line-color', value: rail },
      tunnel_major_rail:        { prop: 'line-color', value: rail },
      tunnel_transit_rail:      { prop: 'line-color', value: rail },
      bridge_major_rail:        { prop: 'line-color', value: rail },
      bridge_transit_rail:      { prop: 'line-color', value: rail },
    } : {}),
    water_name_line:              { prop: 'text-color',       value: waterLabel },
    water_name_point_ocean:       { prop: 'text-color',       value: waterLabel },
    water_name_point_sea:         { prop: 'text-color',       value: waterLabel },
  }
}

// Build a text-opacity value: flat number or zoom step expression
function labelOpacityValue(palette) {
  const opacity    = Math.max(0, Math.min(1, palette.labelOpacity ?? 1))
  const minZoom    = palette.labelMinZoom    ?? null
  const maxZoom    = palette.labelMaxZoom    ?? null
  const hideFrom   = palette.labelHideFrom   ?? null
  const hideTo     = palette.labelHideTo     ?? null

  // P-4: partial pair — warn and fall through to flat opacity
  if ((hideFrom !== null) !== (hideTo !== null)) {
    console.warn('[MapLibreMap] labelHideFrom and labelHideTo must both be set; ignoring partial pair')
  } else if (hideFrom !== null && hideTo !== null) {
    // P-3: ensure stops are in ascending order
    const from = Math.min(hideFrom, hideTo)
    const to   = Math.max(hideFrom, hideTo)
    if (from === to) {
      console.warn('[MapLibreMap] labelHideFrom === labelHideTo; returning flat opacity')
      return opacity
    }
    // P-2: opacity 0 defeats the range — labels hidden everywhere
    if (opacity === 0) console.warn('[MapLibreMap] labelOpacity is 0 with hide range; labels will be hidden everywhere')
    if (from === 0) console.warn('[MapLibreMap] labelHideFrom=0 hides labels from zoom 0; labels hidden from the very start')
    return ['step', ['zoom'], opacity, from, 0, to, opacity]
  }

  // Show only within a zoom range
  if (minZoom !== null && maxZoom !== null) {
    if (opacity === 0) console.warn('[MapLibreMap] labelOpacity is 0 with zoom range; labels will be hidden everywhere')
    const lo = Math.min(minZoom, maxZoom)
    const hi = Math.max(minZoom, maxZoom)
    return ['step', ['zoom'], 0, lo, opacity, hi, 0]
  }
  if (minZoom !== null) {
    if (opacity === 0) console.warn('[MapLibreMap] labelOpacity is 0 with labelMinZoom; labels will be hidden everywhere')
    return ['step', ['zoom'], 0, minZoom, opacity]
  }
  if (maxZoom !== null) {
    if (opacity === 0) console.warn('[MapLibreMap] labelOpacity is 0 with labelMaxZoom; labels will be hidden everywhere')
    return ['step', ['zoom'], opacity, maxZoom, 0]
  }
  return opacity
}

function buildStyle(palette) {
  const overrides    = getPaintOverrides(palette)
  const labelOpacity = labelOpacityValue(palette)
  const labelColor   = palette.labelColor ?? null
  const labelHalo    = palette.labelHalo  ?? null
  const fontStack    = fontStackFromPalette(palette)

  const layers = baseStyle.layers.map((layer) => {
    let updated = layer
    const ov = overrides[layer.id]
    if (ov) updated = { ...updated, paint: { ...updated.paint, [ov.prop]: ov.value } }
    // Override text-font on all symbol layers — switches glyph format and applies chosen font
    if (layer.layout?.['text-font']) {
      updated = { ...updated, layout: { ...updated.layout, 'text-font': fontStack } }
    }
    if (LABEL_LAYERS.includes(layer.id)) {
      const paint = { ...updated.paint, 'text-opacity': labelOpacity }
      if (labelHalo) paint['text-halo-color'] = labelHalo
      if (labelColor && PLACE_LABEL_LAYERS.includes(layer.id)) paint['text-color'] = labelColor
      updated = { ...updated, paint }
    }
    return updated
  })
  return { ...baseStyle, glyphs: GLYPH_URL, layers }
}

function applyPalette(map, palette) {
  const overrides    = getPaintOverrides(palette)
  const labelOpacity = labelOpacityValue(palette)
  const labelColor   = palette.labelColor ?? null
  const labelHalo    = palette.labelHalo  ?? null
  const building     = palette.building   ?? null
  const border       = palette.border     ?? null
  const rail         = palette.rail       ?? null
  const fontStack    = fontStackFromPalette(palette)

  Object.entries(overrides).forEach(([id, { prop, value }]) => {
    if (map.getLayer(id)) map.setPaintProperty(id, prop, value)
  })

  // P-1: always reset nullable fill/line overrides so live map doesn't stay dirty
  if (map.getLayer('building-top')) {
    map.setPaintProperty('building-top', 'fill-color',
      building ?? BASE_PAINT['building-top']?.['fill-color'] ?? null)
  }
  ;['boundary_3', 'boundary_2_z0-4', 'boundary_2_z5-'].forEach(id => {
    if (map.getLayer(id))
      map.setPaintProperty(id, 'line-color', border ?? BASE_PAINT[id]?.['line-color'] ?? null)
  })
  ;['road_major_rail', 'road_transit_rail', 'tunnel_major_rail', 'tunnel_transit_rail',
    'bridge_major_rail', 'bridge_transit_rail'].forEach(id => {
    if (map.getLayer(id))
      map.setPaintProperty(id, 'line-color', rail ?? BASE_PAINT[id]?.['line-color'] ?? null)
  })

  LABEL_LAYERS.forEach(id => {
    if (!map.getLayer(id)) return
    map.setPaintProperty(id, 'text-opacity', labelOpacity)
    // P-1: always set halo — reset to base when null
    map.setPaintProperty(id, 'text-halo-color',
      labelHalo ?? BASE_PAINT[id]?.['text-halo-color'] ?? null)
  })

  // P-1: always set label color for place layers — reset to base when null
  PLACE_LABEL_LAYERS.forEach(id => {
    if (!map.getLayer(id)) return
    map.setPaintProperty(id, 'text-color',
      labelColor ?? BASE_PAINT[id]?.['text-color'] ?? null)
  })

  // F-1: always update font — reset to default when palette.font is null/unknown
  LABEL_LAYERS.forEach(id => {
    if (!map.getLayer(id)) return
    map.setLayoutProperty(id, 'text-font', fontStack)
  })
}

function snapCanvas(map) {
  try {
    return map.getCanvas().toDataURL('image/jpeg', 0.85)
  } catch (_) {
    return null
  }
}

const MapLibreMap = forwardRef(function MapLibreMap({
  palette  = PALETTES.warmEarth,
  zoomId   = 'z14',
  areaType = 'city-centre',
}, ref) {
  const containerRef   = useRef(null)
  const mapRef         = useRef(null)
  const paletteRef     = useRef(palette)
  const thumbnailRef   = useRef(null)   // holds the latest captured data URL

  // Expose capture() — returns the pre-captured thumbnail, or snaps live if not yet ready
  useImperativeHandle(ref, () => ({
    capture: () => thumbnailRef.current ?? snapCanvas(mapRef.current),
  }))

  // Init on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const { center, zoom } = AREA_COORDS[areaType] ?? AREA_COORDS['city-centre']
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(palette),
      center,
      zoom,
      attributionControl: false,
      preserveDrawingBuffer: true,
    })
    mapRef.current = map
    paletteRef.current = palette

    // Pre-capture once tiles are fully rendered
    map.once('idle', () => {
      thumbnailRef.current = snapCanvas(map)
    })

    return () => { map.remove(); mapRef.current = null; thumbnailRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Palette changes — apply colors, then recapture on next idle
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const prevFont = paletteRef.current?.font ?? null
    const nextFont = palette?.font ?? null
    paletteRef.current = palette

    const apply = () => {
      if (prevFont !== nextFont) {
        // Font changed — full style reload required to fetch new glyph tiles
        map.setStyle(buildStyle(palette), { diff: false })
        map.once('idle', () => { thumbnailRef.current = snapCanvas(map) })
      } else {
        applyPalette(map, palette)
        map.once('idle', () => { thumbnailRef.current = snapCanvas(map) })
      }
    }

    if (map.isStyleLoaded()) {
      apply()
    } else {
      map.once('load', apply)
    }
  }, [palette])

  // Zoom changes
  useEffect(() => {
    const map = mapRef.current
    const z = ZOOM_VALUES[zoomId]
    if (map && z !== undefined) map.setZoom(z)
  }, [zoomId])

  // Area type changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const { center, zoom } = AREA_COORDS[areaType] ?? AREA_COORDS['city-centre']
    map.flyTo({ center, zoom, duration: 800 })
  }, [areaType])

  return (
    <div
      id="workspace-preview-map"
      ref={containerRef}
      className="absolute inset-0"
    />
  )
})

export default MapLibreMap
