// Zoom level badge buttons — wired to MapLibreMap via parent state
import { cn } from '@/lib/utils'
import { useLang } from '@/context/LangContext'

export default function ZoomSelector({ activeZoom, onChange }) {
  const { data } = useLang()

  return (
    <div id="workspace-preview-zoom" className="flex gap-1">
      {data.zoom_levels.map(({ id, label }) => (
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
