// Builds the export-ready MapLibre GL style with the given palette applied
import baseStyle from '../../data/wemap-base-style.json'

function getOverrides(palette) {
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

export function buildExportStyle(palette, styleName = 'wemapstyle-export') {
  const overrides = getOverrides(palette)
  const layers = baseStyle.layers.map((layer) => {
    const ov = overrides[layer.id]
    if (!ov) return layer
    return { ...layer, paint: { ...layer.paint, [ov.prop]: ov.value } }
  })

  return {
    ...baseStyle,
    name: styleName,
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
