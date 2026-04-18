import { useState, forwardRef } from 'react'
import MapLibreMap from '@/components/MapLibreMap'
import { cn } from '@/lib/utils'
import { useLang } from '@/context/LangContext'

const ZOOM_DEFAULT = 'z14'
const AREA_DEFAULT = 'city-centre'

const MapPanel = forwardRef(function MapPanel({ palette, defaultZoom = ZOOM_DEFAULT, defaultArea = AREA_DEFAULT, baseStyleUrl = null, schema = null }, ref) {
  const { lang, data } = useLang()
  const [activeZoom, setActiveZoom] = useState(defaultZoom)
  const [activeArea, setActiveArea] = useState(defaultArea)

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapLibreMap ref={ref} palette={palette} zoomId={activeZoom} areaType={activeArea} baseStyleUrl={baseStyleUrl} schema={schema} />

      {/* Compact controls overlay — bottom-left */}
      <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1 items-start">
        {/* Area type pills */}
        <div className="flex gap-0.5">
          {data.area_types.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveArea(id)}
              className={cn(
                'px-1.5 py-0.5 text-[10px] rounded font-medium transition-colors shadow-sm',
                activeArea === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/80 text-muted-foreground hover:bg-background'
              )}
            >
              {label[lang]}
            </button>
          ))}
        </div>

        {/* Zoom pills */}
        <div className="flex gap-0.5">
          {data.zoom_levels.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveZoom(id)}
              className={cn(
                'px-1.5 py-0.5 text-[10px] rounded font-mono transition-colors shadow-sm',
                activeZoom === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/80 text-muted-foreground hover:bg-background'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

export default MapPanel
