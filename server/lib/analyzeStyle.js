// Paint property to sample as representative color for each layer type
const PAINT_PROP_FOR_TYPE = {
  background: 'background-color',
  fill: 'fill-color',
  line: 'line-color',
  symbol: 'text-color',
  circle: 'circle-color',
  'fill-extrusion': 'fill-extrusion-color',
}

// Standard OSM base-style classification rules (order matters — first match wins per layer)
const STANDARD_RULES = [
  {
    field: 'background',
    description: 'Map canvas fill color',
    paintProperty: 'background-color',
    match: (_id, _sl, type) => type === 'background',
  },
  {
    field: 'water',
    description: 'Water bodies and waterways (fill + line)',
    paintProperty: 'fill-color',
    match: (_id, sl, type) =>
      sl && (sl === 'water' || sl === 'waterway') && (type === 'fill' || type === 'line'),
  },
  {
    field: 'green',
    description: 'Parks, forests, and landcover',
    paintProperty: 'fill-color',
    match: (id, sl, type) =>
      type === 'fill' &&
      sl &&
      (sl === 'landcover' || sl === 'landuse' || sl === 'park') &&
      /park|wood|forest|farm|green|cemetery|grass/i.test(id),
  },
  {
    field: 'roadPrimary',
    description: 'Primary roads, motorways, trunks (fill)',
    paintProperty: 'line-color',
    match: (id, sl, type) =>
      type === 'line' &&
      sl === 'transportation' &&
      /motorway|trunk|primary/i.test(id) &&
      !/casing/i.test(id),
  },
  {
    field: 'roadCasing',
    description: 'Road casing outlines (drawn below road fill)',
    paintProperty: 'line-color',
    match: (id, sl, type) =>
      type === 'line' && sl === 'transportation' && /casing/i.test(id),
  },
  {
    field: 'roadMinor',
    description: 'Secondary, tertiary, and minor roads',
    paintProperty: 'line-color',
    match: (id, sl, type) =>
      type === 'line' &&
      sl === 'transportation' &&
      /secondary|tertiary|minor|link|service|road/i.test(id) &&
      !/casing|motorway|trunk|primary/i.test(id),
  },
  {
    field: 'building',
    description: 'Building footprints',
    paintProperty: 'fill-color',
    match: (_id, sl, type) =>
      (type === 'fill' || type === 'fill-extrusion') && sl === 'building',
  },
  {
    field: 'landuse',
    description: 'Special landuse areas (hospital, school, retail)',
    paintProperty: 'fill-color',
    match: (id, sl, type) =>
      type === 'fill' &&
      sl === 'landuse' &&
      /hospital|school|university|college|retail|commercial/i.test(id),
  },
  {
    field: 'border',
    description: 'Administrative boundaries',
    paintProperty: 'line-color',
    match: (_id, sl, type) =>
      type === 'line' && sl && (sl === 'boundary' || sl === 'admin'),
  },
  {
    field: 'rail',
    description: 'Rail and transit lines',
    paintProperty: 'line-color',
    match: (id, sl, type) =>
      type === 'line' && sl === 'transportation' && /rail|transit/i.test(id),
  },
  {
    field: 'waterLabel',
    description: 'Water body label text color',
    paintProperty: 'text-color',
    match: (id, _sl, type) => type === 'symbol' && /water.*name|waterway.*label/i.test(id),
  },
  {
    field: 'labelColor',
    description: 'Place, road, and POI label text color',
    paintProperty: 'text-color',
    match: (_id, _sl, type) => type === 'symbol',
  },
]

function extractFirstColor(value) {
  if (!value) return null
  if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) return value
  if (Array.isArray(value)) {
    for (const v of value) {
      const c = extractFirstColor(v)
      if (c) return c
    }
  }
  return null
}

function getCurrentValue(layer, paintProperty) {
  const isLayout = paintProperty === 'text-font'
  const source = isLayout ? (layer.layout || {}) : (layer.paint || {})
  return extractFirstColor(source[paintProperty])
}

// Convert a kebab/snake-case layer-id fragment to camelCase field name
function toFieldName(str) {
  return str
    .toLowerCase()
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
}

// Extract unique font families referenced in the style
function extractFontFamilies(layers) {
  const families = new Set()
  for (const layer of layers) {
    const tf = layer.layout?.['text-font']
    if (!tf) continue
    const names = Array.isArray(tf) ? tf.flat() : [tf]
    for (const n of names) {
      if (typeof n !== 'string') continue
      const family = n.replace(/\s+(Bold|Italic|Regular|Medium|Light|Semibold|SemiBold|Condensed).*/i, '').trim()
      if (family) families.add(family)
    }
  }
  return [...families]
}

function buildLayerMapMarkdown(schema, fontFamilies) {
  const rows = schema.map(({ field, paintProperty, description, layerIds }) => {
    const preview =
      layerIds.length <= 3
        ? layerIds.join(', ')
        : `${layerIds.slice(0, 3).join(', ')} (+${layerIds.length - 3} more)`
    return `| ${field} | ${paintProperty} | ${description} | ${preview} |`
  })

  const fontsSection =
    fontFamilies.length > 0
      ? `## Available fonts\n${fontFamilies.map(f => `- ${f}`).join('\n')}\n\n`
      : ''

  return `## Palette fields → MapLibre layers

| Field | Paint property | Description | Affected layers |
|-------|----------------|-------------|-----------------|
${rows.join('\n')}

${fontsSection}## Key design rules
- roadCasing should be darker than roadPrimary for contrast
- waterLabel must be legible on the water fill color
- labelHalo improves legibility over complex backgrounds
- labelOpacity: 0 = hidden, 0.5 = faded, 1 = full (default)
- Only set labelColor/labelHalo when overriding the base style defaults`
}

// Analyze an already-fetched style JSON object
export function analyzeStyleJson(styleJson) {
  const layers = styleJson.layers || []
  const groups = new Map() // field → { description, paintProperty, layerIds, currentValue }
  const classifiedIds = new Set()

  // Standard rules pass
  for (const rule of STANDARD_RULES) {
    const matched = layers.filter(l =>
      rule.match(l.id, l['source-layer'], l.type)
    )
    if (matched.length === 0) continue

    matched.forEach(l => classifiedIds.add(l.id))
    const existing = groups.get(rule.field)
    if (existing) {
      existing.layerIds.push(...matched.map(l => l.id))
    } else {
      groups.set(rule.field, {
        description: rule.description,
        paintProperty: rule.paintProperty,
        layerIds: matched.map(l => l.id),
        currentValue: getCurrentValue(matched[0], rule.paintProperty),
      })
    }
  }

  // Dynamic discovery pass: group unclassified fill/line/symbol layers by source-layer + base-id
  const unclassified = layers.filter(
    l =>
      !classifiedIds.has(l.id) &&
      l['source-layer'] &&
      PAINT_PROP_FOR_TYPE[l.type]
  )

  // Group by (source-layer, type, base-id) where base-id strips trailing state suffixes
  const discoveredGroups = new Map()
  const STATE_SUFFIX = /[-_](default|highlighted|selected|hover|active|inactive|focus)$/i

  for (const layer of unclassified) {
    const { id, type } = layer
    const sourceLayer = layer['source-layer']
    const baseId = id.replace(STATE_SUFFIX, '').replace(/[-_]\d+$/, '')
    const key = `${sourceLayer}::${type}::${baseId}`
    if (!discoveredGroups.has(key)) {
      discoveredGroups.set(key, { layers: [], sourceLayer, type, baseId })
    }
    discoveredGroups.get(key).layers.push(layer)
  }

  for (const { layers: gl, sourceLayer, type, baseId } of discoveredGroups.values()) {
    const paintProperty = PAINT_PROP_FOR_TYPE[type]
    const fieldName = toFieldName(baseId)
    if (!fieldName) continue

    const stateHints = gl
      .map(l => { const m = l.id.match(STATE_SUFFIX); return m ? m[1] : null })
      .filter(Boolean)
    const stateNote = stateHints.length > 0 ? ` (states: ${stateHints.join(', ')})` : ''
    const description = `${baseId.replace(/[-_]/g, ' ')} — source: ${sourceLayer}, type: ${type}${stateNote}`

    const existing = groups.get(fieldName)
    if (existing) {
      existing.layerIds.push(...gl.map(l => l.id))
    } else {
      groups.set(fieldName, {
        description,
        paintProperty,
        layerIds: gl.map(l => l.id),
        currentValue: getCurrentValue(gl[0], paintProperty),
      })
    }
  }

  const schema = [...groups.entries()].map(([field, info]) => ({
    field,
    description: info.description,
    paintProperty: info.paintProperty,
    layerIds: info.layerIds,
    currentValue: info.currentValue,
  }))

  const fontFamilies = extractFontFamilies(layers)
  const layerMap = buildLayerMapMarkdown(schema, fontFamilies)

  return { schema, layerMap }
}

// Fetch style from URL and analyze it
export async function analyzeStyle(styleUrl) {
  let res
  try {
    res = await fetch(styleUrl)
  } catch (err) {
    throw new Error(`Network error fetching style from ${styleUrl}: ${err.message}`)
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching style from ${styleUrl}`)
  }
  let styleJson
  try {
    styleJson = await res.json()
  } catch (err) {
    throw new Error(`Invalid JSON from style URL ${styleUrl}: ${err.message}`)
  }
  return analyzeStyleJson(styleJson)
}
