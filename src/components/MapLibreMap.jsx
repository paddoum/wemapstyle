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

const LABEL_LAYERS = [
  'water_name_line', 'water_name_point_ocean', 'water_name_point_sea',
  'poi_z12_poi_label_1', 'road_label', 'road_label_small', 'road_label_medium',
  'road_label_large', 'place_other', 'place_village', 'place_town',
  'place_city', 'country_3', 'country_2', 'country_1',
]

function getPaintOverrides(palette) {
  const { background, water, green, roadPrimary, roadCasing, roadMinor, waterLabel } = palette
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
    water_name_line:              { prop: 'text-color',       value: waterLabel },
    water_name_point_ocean:       { prop: 'text-color',       value: waterLabel },
    water_name_point_sea:         { prop: 'text-color',       value: waterLabel },
  }
}

// Build a text-opacity value from palette label settings.
// labelOpacity: 0–1 flat opacity (default 1)
// labelMinZoom: if set, labels are hidden below this zoom level
function labelOpacityValue(palette) {
  const opacity   = palette.labelOpacity  ?? 1
  const minZoom   = palette.labelMinZoom  ?? null
  if (minZoom !== null) {
    // Step expression: 0 below minZoom, opacity at and above minZoom
    return ['step', ['zoom'], 0, minZoom, opacity]
  }
  return opacity
}

function buildStyle(palette) {
  const overrides     = getPaintOverrides(palette)
  const labelOpacity  = labelOpacityValue(palette)
  const layers = baseStyle.layers.map((layer) => {
    let updated = layer
    const ov = overrides[layer.id]
    if (ov) updated = { ...updated, paint: { ...updated.paint, [ov.prop]: ov.value } }
    if (LABEL_LAYERS.includes(layer.id)) {
      updated = { ...updated, paint: { ...updated.paint, 'text-opacity': labelOpacity } }
    }
    return updated
  })
  return { ...baseStyle, layers }
}

function applyPalette(map, palette) {
  const overrides    = getPaintOverrides(palette)
  const labelOpacity = labelOpacityValue(palette)
  Object.entries(overrides).forEach(([id, { prop, value }]) => {
    if (map.getLayer(id)) map.setPaintProperty(id, prop, value)
  })
  LABEL_LAYERS.forEach(id => {
    if (map.getLayer(id)) map.setPaintProperty(id, 'text-opacity', labelOpacity)
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
    paletteRef.current = palette

    const apply = () => {
      applyPalette(map, palette)
      // Re-capture after the next idle so thumbnail reflects new colors
      map.once('idle', () => {
        thumbnailRef.current = snapCanvas(map)
      })
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
