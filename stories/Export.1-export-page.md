# Story: Export — Section 1: Export Page (1.5)

**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~25 min

**View:** Export
**Section:** 1 of 1
**Estimate:** 25 min
**Spec refs:** 1.5-export.md
**Objects:** export-back-link, export-header-appname, export-style-thumbnail, export-style-name, export-download-btn, export-copy-btn, export-compatibility-note

---

## Purpose

Build the Export page: focused completion view with editable style name,
Download JSON + Copy JSON actions, and confidence signal.
Map thumbnail is CSS-rendered using demo style_colors (no MapLibre GL needed here).
Exported JSON is the Wemap base style with warm earthy overrides applied.

---

## New utility: src/lib/buildExportStyle.js

Reuses the same color logic from MapLibreMap but runs in JS (no React).

```js
import baseStyle from '../../data/wemap-base-style.json'

const OVERRIDES = {
  background:                 { prop: 'background-color', value: '#efebe6' },
  water:                      { prop: 'fill-color',       value: '#89b4cc' },
  waterway_tunnel:            { prop: 'line-color',       value: '#89b4cc' },
  waterway_river:             { prop: 'line-color',       value: '#89b4cc' },
  waterway_other:             { prop: 'line-color',       value: '#89b4cc' },
  'landcover-park':           { prop: 'fill-color',       value: '#a8c99a' },
  'landcover-wood':           { prop: 'fill-color',       value: '#a8c99a' },
  'landcover-forest':         { prop: 'fill-color',       value: '#a8c99a' },
  'landcover-farmland':       { prop: 'fill-color',       value: '#a8c99a' },
  park:                       { prop: 'fill-color',       value: '#a8c99a' },
  road_trunk_primary:         { prop: 'line-color',       value: '#e0d8ce' },
  bridge_trunk_primary:       { prop: 'line-color',       value: '#e0d8ce' },
  tunnel_trunk_primary:       { prop: 'line-color',       value: '#e0d8ce' },
  road_motorway:              { prop: 'line-color',       value: '#e0d8ce' },
  bridge_motorway:            { prop: 'line-color',       value: '#e0d8ce' },
  tunnel_motorway:            { prop: 'line-color',       value: '#e0d8ce' },
  bridge_motorway_link:       { prop: 'line-color',       value: '#e0d8ce' },
  road_trunk_primary_casing:  { prop: 'line-color',       value: '#c8b9aa' },
  road_motorway_casing:       { prop: 'line-color',       value: '#c8b9aa' },
  bridge_trunk_primary_casing:{ prop: 'line-color',       value: '#c8b9aa' },
  bridge_motorway_casing:     { prop: 'line-color',       value: '#c8b9aa' },
  road_minor:                 { prop: 'line-color',       value: '#ede8e2' },
  road_secondary_tertiary:    { prop: 'line-color',       value: '#ede8e2' },
  road_link:                  { prop: 'line-color',       value: '#ede8e2' },
  water_name_line:            { prop: 'text-color',       value: '#4a7a9b' },
  water_name_point_ocean:     { prop: 'text-color',       value: '#4a7a9b' },
  water_name_point_sea:       { prop: 'text-color',       value: '#4a7a9b' },
}

export function buildExportStyle() {
  const layers = baseStyle.layers.map((layer) => {
    const ov = OVERRIDES[layer.id]
    if (!ov) return layer
    return { ...layer, paint: { ...layer.paint, [ov.prop]: ov.value } }
  })
  return {
    ...baseStyle,
    name: 'wemap-warm-earth',
    layers,
    metadata: {
      ...baseStyle.metadata,
      'wemapstyle:generated': true,
      'wemapstyle:colors': {
        background: '#efebe6',
        water: '#89b4cc',
        green: '#a8c99a',
        road_primary: '#e0d8ce',
        road_minor: '#ede8e2',
      },
    },
  }
}
```

---

## Update Export.jsx

```jsx
// 1.5 — Export
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLang } from '@/context/LangContext'
import { buildExportStyle } from '@/lib/buildExportStyle'
import { cn } from '@/lib/utils'

export default function Export() {
  const { t, lang, data } = useLang()
  const navigate = useNavigate()

  const colors = data.demo_conversation.style_colors
  const defaultName = data.export.default_name[lang]

  const [styleName, setStyleName] = useState(defaultName)
  const [editingName, setEditingName] = useState(false)
  const [copyState, setCopyState] = useState('idle')  // idle | copied
  const [downloadState, setDownloadState] = useState('idle')  // idle | downloaded

  const getStyleJson = () => JSON.stringify(buildExportStyle(), null, 2)

  const handleDownload = () => {
    const json = getStyleJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${styleName}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDownloadState('downloaded')
    setTimeout(() => setDownloadState('idle'), 2000)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getStyleJson())
    setCopyState('copied')
    setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* Navigation bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
        <button
          id="export-back-link"
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('back_to_workspace')}
        </button>
        <span id="export-header-appname" className="text-sm font-semibold text-foreground">
          {t('app_name')}
        </span>
      </div>

      {/* Content — centered */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-md space-y-5">

          {/* Export card */}
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">

            {/* Map thumbnail */}
            <div
              id="export-style-thumbnail"
              className="w-full h-36 relative"
              style={{ backgroundColor: colors.background }}
            >
              {/* Water */}
              <div className="absolute inset-x-0 bottom-0 h-12" style={{ backgroundColor: colors.water, opacity: 0.85 }} />
              {/* Green patch */}
              <div className="absolute top-4 left-8 w-16 h-10 rounded-sm" style={{ backgroundColor: colors.green, opacity: 0.7 }} />
              {/* Primary road */}
              <div className="absolute top-1/2 inset-x-0 h-2 -translate-y-1/2" style={{ backgroundColor: colors.road_primary }} />
              {/* Secondary road */}
              <div className="absolute left-1/3 inset-y-0 w-1.5" style={{ backgroundColor: colors.road_secondary, opacity: 0.6 }} />
            </div>

            {/* Style name */}
            <div className="px-4 py-3 flex items-center gap-2 border-t">
              {editingName ? (
                <input
                  id="export-style-name"
                  autoFocus
                  className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-foreground"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                />
              ) : (
                <span
                  id="export-style-name"
                  className="flex-1 text-sm font-medium text-foreground cursor-text"
                  onClick={() => setEditingName(true)}
                >
                  {styleName}
                </span>
              )}
              <button
                onClick={() => setEditingName(true)}
                className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                aria-label="Edit style name"
              >
                ✏
              </button>
            </div>

          </div>

          {/* Export action buttons */}
          <div className="flex gap-3">
            <Button
              id="export-download-btn"
              className="flex-1"
              onClick={handleDownload}
            >
              {downloadState === 'downloaded' ? t('downloaded') : t('download_json')}
            </Button>
            <Button
              id="export-copy-btn"
              variant="secondary"
              className="flex-1"
              onClick={handleCopy}
            >
              {copyState === 'copied' ? t('copied') : t('copy_json')}
            </Button>
          </div>

          {/* Confidence signal */}
          <p
            id="export-compatibility-note"
            className="text-xs text-muted-foreground text-center"
          >
            {t('wemap_ready')}
          </p>

        </div>
      </div>

    </div>
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `id="export-back-link"` navigates back to workspace
- [ ] `id="export-header-appname"` shows "WemapStyle"
- [ ] `id="export-style-thumbnail"` shows CSS map with demo colors
- [ ] `id="export-style-name"` editable inline, default "Style · Mar 23"
- [ ] `id="export-download-btn"` downloads `[styleName].json`
- [ ] `id="export-copy-btn"` copies JSON, shows "✓ Copied" for 2s
- [ ] `id="export-compatibility-note"` always visible
- [ ] Build passes

### User-evaluable
- [ ] Export feels like a completion screen — clean, focused, one task
- [ ] Thumbnail confirms the warm earthy style being exported
- [ ] Renaming the style and downloading uses the new name as filename
- [ ] Copy JSON button feedback is instant and satisfying
- [ ] "← Back to workspace" feels safe — not a commitment to export
