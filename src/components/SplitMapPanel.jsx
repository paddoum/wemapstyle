import { forwardRef } from 'react'
import MapPanel from '@/components/MapPanel'
import { cn } from '@/lib/utils'

// Layout modes
const LAYOUTS = [
  { id: '1',  label: '⬜',    title: 'Single' },
  { id: '2H', label: '⬜⬜',  title: 'Side by side' },
  { id: '2V', label: '🔲',   title: 'Stacked' },
  { id: '4',  label: '⊞',    title: '4 panels' },
]

// Default config per panel slot
const PANEL_DEFAULTS = [
  { defaultZoom: 'z14', defaultArea: 'city-centre' },
  { defaultZoom: 'z14', defaultArea: 'small-town' },
  { defaultZoom: 'z17', defaultArea: 'city-centre' },
  { defaultZoom: 'z10', defaultArea: 'countryside' },
]

// SplitMapPanel manages layout + renders the correct number of MapPanel instances.
// ref is forwarded to Panel 0 for screenshot capture.
const SplitMapPanel = forwardRef(function SplitMapPanel({ palette, layout, onLayoutChange }, ref) {
  const panelCount = layout === '1' ? 1 : layout === '4' ? 4 : 2

  const gridClass =
    layout === '2H' ? 'grid-cols-2 grid-rows-1' :
    layout === '2V' ? 'grid-cols-1 grid-rows-2' :
    layout === '4'  ? 'grid-cols-2 grid-rows-2' :
    'grid-cols-1 grid-rows-1'

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Layout toggle bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b bg-background flex-shrink-0">
        {LAYOUTS.map(({ id, label, title }) => (
          <button
            key={id}
            title={title}
            onClick={() => onLayoutChange?.(id)}
            className={cn(
              'px-2 py-0.5 text-xs rounded transition-colors',
              layout === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panel grid */}
      <div className={cn('grid flex-1 gap-px bg-border', gridClass)}>
        {Array.from({ length: panelCount }).map((_, i) => (
          <MapPanel
            key={i}
            ref={i === 0 ? ref : undefined}
            palette={palette}
            defaultZoom={PANEL_DEFAULTS[i].defaultZoom}
            defaultArea={PANEL_DEFAULTS[i].defaultArea}
          />
        ))}
      </div>
    </div>
  )
})

export default SplitMapPanel
