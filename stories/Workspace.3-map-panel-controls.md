# Story: Workspace — Section 3: Map Panel Controls (1.3/1.4)

**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~20 min
**View:** Workspace (B2, B3)
**Section:** 3 of 5
**Estimate:** 20 min
**Spec refs:** 1.3-workspace-preview.md, 1.4-workspace-iteration.md
**Objects:** workspace-preview-map, workspace-preview-zoom, workspace-preview-area-type, workspace-export-btn

---

## Purpose

Build the real map panel using MapLibre GL JS with the Wemap tile source.
Add ZoomSelector and AreaTypeTabs controls, wired to the live map.
Controls are hidden in WorkspaceGenerate, visible in WorkspacePreview + WorkspaceIteration.
Export button navigates to /export.

---

## Prerequisites

```bash
npm install maplibre-gl
```

Add to `src/index.css` (top of file):
```css
@import 'maplibre-gl/dist/maplibre-gl.css';
```

---

## Data: data/wemap-base-style.json

Already saved — full Wemap v2 style JSON (89 layers, Wemap tile source).

---

## Color Override Strategy

The base style has default Wemap colors. We apply a warm earthy palette and a
`waterColor` prop to swap between initial (`#b0c4de`) and refined (`#89b4cc`).

Layer targets and their demo overrides:

| Layer IDs | Property | Demo value |
|---|---|---|
| `background` | `background-color` | `#efebe6` |
| `water` | `fill-color` | `waterColor` prop |
| `waterway_tunnel`, `waterway_river`, `waterway_other` | `line-color` | `waterColor` prop |
| `landcover-park`, `landcover-wood`, `landcover-forest`, `landcover-farmland`, `park` | `fill-color` | `#a8c99a` |
| `road_trunk_primary`, `bridge_trunk_primary`, `tunnel_trunk_primary` | `line-color` | `#e0d8ce` |
| `road_motorway`, `bridge_motorway`, `tunnel_motorway` | `line-color` | `#e0d8ce` |
| `road_trunk_primary_casing`, `road_motorway_casing`, `bridge_trunk_primary_casing`, `bridge_motorway_casing` | `line-color` | `#c8b9aa` |
| `road_minor`, `road_secondary_tertiary`, `road_link` | `line-color` | `#ede8e2` |

Water labels (`water_name_*`) → `#4a7a9b` (to match warm palette).
Place/road labels → keep default.

---

## New Component: src/components/MapLibreMap.jsx

```jsx
// src/components/MapLibreMap.jsx
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import baseStyle from '@/../data/wemap-base-style.json'

// Area type → center coordinates [lng, lat] + zoom
const AREA_COORDS = {
  'city-centre': { center: [2.3488, 48.8534], zoom: 14 },
  'small-town':  { center: [3.0800, 50.6300], zoom: 13 },
  'countryside': { center: [1.8000, 47.5000], zoom: 10 },
}

// Zoom level id → numeric zoom
const ZOOM_VALUES = { z5: 5, z10: 10, z14: 14, z17: 17 }

// Build a patched copy of the base style with demo colors
function buildDemoStyle(waterColor) {
  const green = '#a8c99a'
  const roadPrimary = '#e0d8ce'
  const roadPrimaryCasing = '#c8b9aa'
  const roadMinor = '#ede8e2'

  const overrides = {
    background:                   { prop: 'background-color', value: '#efebe6' },
    water:                        { prop: 'fill-color',       value: waterColor },
    waterway_tunnel:              { prop: 'line-color',       value: waterColor },
    waterway_river:               { prop: 'line-color',       value: waterColor },
    waterway_other:               { prop: 'line-color',       value: waterColor },
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
    road_trunk_primary_casing:    { prop: 'line-color',       value: roadPrimaryCasing },
    road_motorway_casing:         { prop: 'line-color',       value: roadPrimaryCasing },
    bridge_trunk_primary_casing:  { prop: 'line-color',       value: roadPrimaryCasing },
    bridge_motorway_casing:       { prop: 'line-color',       value: roadPrimaryCasing },
    road_minor:                   { prop: 'line-color',       value: roadMinor },
    road_secondary_tertiary:      { prop: 'line-color',       value: roadMinor },
    road_link:                    { prop: 'line-color',       value: roadMinor },
    water_name_line:              { prop: 'text-color',       value: '#4a7a9b' },
    water_name_point_ocean:       { prop: 'text-color',       value: '#4a7a9b' },
    water_name_point_sea:         { prop: 'text-color',       value: '#4a7a9b' },
  }

  // Deep-clone and patch layers
  const layers = baseStyle.layers.map((layer) => {
    const override = overrides[layer.id]
    if (!override) return layer
    const { prop, value } = override
    return {
      ...layer,
      paint: { ...layer.paint, [prop]: value },
    }
  })

  return { ...baseStyle, layers }
}

export default function MapLibreMap({ waterColor = '#b0c4de', zoomId = 'z14', areaType = 'city-centre' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  // Init map on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const { center, zoom } = AREA_COORDS[areaType] ?? AREA_COORDS['city-centre']
    const style = buildDemoStyle(waterColor)

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      attributionControl: false,
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // React to waterColor changes — repaint water layers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const waterLayers = ['water', 'waterway_tunnel', 'waterway_river', 'waterway_other']
    waterLayers.forEach((id) => {
      const layer = map.getLayer(id)
      if (!layer) return
      const prop = id === 'water' ? 'fill-color' : 'line-color'
      map.setPaintProperty(id, prop, waterColor)
    })
  }, [waterColor])

  // React to zoom changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const z = ZOOM_VALUES[zoomId]
    if (z !== undefined) map.setZoom(z)
  }, [zoomId])

  // React to area type changes
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
      className="flex-1 w-full h-full"
    />
  )
}
```

---

## New Component: src/components/ZoomSelector.jsx

```jsx
// src/components/ZoomSelector.jsx
import { cn } from '@/lib/utils'
import { useLang } from '@/context/LangContext'

export default function ZoomSelector({ activeZoom, onChange }) {
  const { data } = useLang()
  const levels = data.zoom_levels

  return (
    <div id="workspace-preview-zoom" className="flex gap-1">
      {levels.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'px-2 py-1 text-xs rounded font-mono transition-colors',
            activeZoom === id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

---

## New Component: src/components/AreaTypeTabs.jsx

```jsx
// src/components/AreaTypeTabs.jsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLang } from '@/context/LangContext'

export default function AreaTypeTabs({ activeArea, onChange }) {
  const { lang, data } = useLang()
  const areas = data.area_types

  return (
    <Tabs
      id="workspace-preview-area-type"
      value={activeArea}
      onValueChange={onChange}
    >
      <TabsList className="h-7">
        {areas.map(({ id, label }) => (
          <TabsTrigger key={id} value={id} className="text-xs px-2 py-0.5">
            {label[lang]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
```

---

## Update WorkspaceLayout.jsx

Add `showMapControls`, `waterColor`, and `onExport` props.
When `showMapControls` is true: render MapLibreMap with ZoomSelector + AreaTypeTabs toolbar and Export button.
When false: show the `mapPanel` slot (used for loading state in WorkspaceGenerate).

```jsx
// src/components/WorkspaceLayout.jsx
import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import MapLibreMap from '@/components/MapLibreMap'
import ZoomSelector from '@/components/ZoomSelector'
import AreaTypeTabs from '@/components/AreaTypeTabs'
import { useLang } from '@/context/LangContext'

export default function WorkspaceLayout({
  chatContent,
  inputZone,
  mapPanel = null,
  showMapControls = false,
  waterColor = '#b0c4de',
  onExport,
}) {
  const { t } = useLang()
  const [sessionName, setSessionName] = useState(t('session_default_name'))
  const [editing, setEditing] = useState(false)
  const [activeZoom, setActiveZoom] = useState('z14')
  const [activeArea, setActiveArea] = useState('city-centre')

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">

        {/* Left — Conversation panel (40%) */}
        <div className="w-[40%] flex flex-col border-r">

          {/* Session name */}
          <div className="px-4 py-3 border-b">
            {editing ? (
              <input
                id="workspace-session-name"
                autoFocus
                className="text-sm font-medium bg-transparent border-none outline-none w-full"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              />
            ) : (
              <span
                id="workspace-session-name"
                className="text-sm font-medium text-foreground cursor-text hover:text-muted-foreground transition-colors"
                onClick={() => setEditing(true)}
              >
                {sessionName}
              </span>
            )}
          </div>

          {/* Chat history */}
          <ScrollArea className="flex-1 px-4 py-3">
            {chatContent}
          </ScrollArea>

          {/* Input zone */}
          <div className="border-t p-4">
            {inputZone}
          </div>

        </div>

        {/* Right — Map panel (60%) */}
        <div className="w-[60%] flex flex-col relative">
          {showMapControls ? (
            <>
              {/* Map fills panel */}
              <div className="flex-1 relative overflow-hidden">
                <MapLibreMap
                  waterColor={waterColor}
                  zoomId={activeZoom}
                  areaType={activeArea}
                />
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ZoomSelector activeZoom={activeZoom} onChange={setActiveZoom} />
                  <AreaTypeTabs activeArea={activeArea} onChange={setActiveArea} />
                </div>
                <Button
                  id="workspace-export-btn"
                  size="sm"
                  variant="secondary"
                  onClick={onExport}
                >
                  {t('export_btn')}
                </Button>
              </div>
            </>
          ) : (
            mapPanel ?? (
              <div className="flex-1 bg-muted/20 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Map preview</span>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `maplibre-gl` in `package.json` dependencies
- [ ] `@import 'maplibre-gl/dist/maplibre-gl.css'` in `src/index.css`
- [ ] `src/components/MapLibreMap.jsx` exists
- [ ] `src/components/ZoomSelector.jsx` exists
- [ ] `src/components/AreaTypeTabs.jsx` exists
- [ ] `data/wemap-base-style.json` exists with Wemap tile source
- [ ] `id="workspace-preview-map"` in DOM on `/workspace/preview`
- [ ] `id="workspace-preview-zoom"` in DOM on `/workspace/preview`
- [ ] `id="workspace-preview-area-type"` in DOM on `/workspace/preview`
- [ ] `id="workspace-export-btn"` in DOM on `/workspace/preview`
- [ ] Map controls hidden on `/workspace/generate`
- [ ] Map controls visible on `/workspace/preview`
- [ ] Export button navigates to `/export`
- [ ] Build passes

### User-evaluable
- [ ] Real Wemap map tiles load with warm earthy palette
- [ ] Z5/Z10/Z14/Z17 buttons change map zoom level
- [ ] City Centre / Small Town / Countryside tabs fly the map to different areas
- [ ] Export button visible in map panel, bottom-right area
- [ ] Controls absent on the Generate state (clean map placeholder)
