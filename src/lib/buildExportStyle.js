// Builds the export-ready MapLibre GL style with warm earthy palette applied
import baseStyle from '../../data/wemap-base-style.json'

const OVERRIDES = {
  background:                   { prop: 'background-color', value: '#efebe6' },
  water:                        { prop: 'fill-color',       value: '#89b4cc' },
  waterway_tunnel:              { prop: 'line-color',       value: '#89b4cc' },
  waterway_river:               { prop: 'line-color',       value: '#89b4cc' },
  waterway_other:               { prop: 'line-color',       value: '#89b4cc' },
  'landcover-park':             { prop: 'fill-color',       value: '#a8c99a' },
  'landcover-wood':             { prop: 'fill-color',       value: '#a8c99a' },
  'landcover-forest':           { prop: 'fill-color',       value: '#a8c99a' },
  'landcover-farmland':         { prop: 'fill-color',       value: '#a8c99a' },
  park:                         { prop: 'fill-color',       value: '#a8c99a' },
  road_trunk_primary:           { prop: 'line-color',       value: '#e0d8ce' },
  bridge_trunk_primary:         { prop: 'line-color',       value: '#e0d8ce' },
  tunnel_trunk_primary:         { prop: 'line-color',       value: '#e0d8ce' },
  road_motorway:                { prop: 'line-color',       value: '#e0d8ce' },
  bridge_motorway:              { prop: 'line-color',       value: '#e0d8ce' },
  tunnel_motorway:              { prop: 'line-color',       value: '#e0d8ce' },
  bridge_motorway_link:         { prop: 'line-color',       value: '#e0d8ce' },
  road_trunk_primary_casing:    { prop: 'line-color',       value: '#c8b9aa' },
  road_motorway_casing:         { prop: 'line-color',       value: '#c8b9aa' },
  bridge_trunk_primary_casing:  { prop: 'line-color',       value: '#c8b9aa' },
  bridge_motorway_casing:       { prop: 'line-color',       value: '#c8b9aa' },
  road_minor:                   { prop: 'line-color',       value: '#ede8e2' },
  road_secondary_tertiary:      { prop: 'line-color',       value: '#ede8e2' },
  road_link:                    { prop: 'line-color',       value: '#ede8e2' },
  water_name_line:              { prop: 'text-color',       value: '#4a7a9b' },
  water_name_point_ocean:       { prop: 'text-color',       value: '#4a7a9b' },
  water_name_point_sea:         { prop: 'text-color',       value: '#4a7a9b' },
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
        background:   '#efebe6',
        water:        '#89b4cc',
        green:        '#a8c99a',
        road_primary: '#e0d8ce',
        road_minor:   '#ede8e2',
      },
    },
  }
}
