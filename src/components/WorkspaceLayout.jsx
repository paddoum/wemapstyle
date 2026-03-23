import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import MapLibreMap from '@/components/MapLibreMap'
import ZoomSelector from '@/components/ZoomSelector'
import AreaTypeTabs from '@/components/AreaTypeTabs'
import { useLang } from '@/context/LangContext'
import { PALETTES } from '@/lib/palettes'

export default function WorkspaceLayout({
  chatContent,
  inputZone,
  mapPanel        = null,
  showMapControls = false,
  palette         = PALETTES.warmEarth,
  onSave,
  onExport,
}) {
  const { t, sessionName, setSessionName } = useLang()
  const [editing,   setEditing]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [activeZoom, setActiveZoom] = useState('z14')
  const [activeArea, setActiveArea] = useState('city-centre')

  const handleSave = () => {
    onSave?.()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">

        {/* Left — Conversation panel (40%) */}
        <div className="w-[40%] flex flex-col border-r overflow-hidden">

          {/* Session name + Save */}
          <div className="px-4 py-3 border-b flex-shrink-0 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  id="workspace-session-name"
                  autoFocus
                  className="text-sm font-medium bg-transparent border-none outline-none w-full text-foreground"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  onBlur={() => setEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                />
              ) : (
                <span
                  id="workspace-session-name"
                  className="text-sm font-medium text-foreground cursor-text hover:text-muted-foreground transition-colors truncate block"
                  onClick={() => setEditing(true)}
                >
                  {sessionName}
                </span>
              )}
            </div>

            {showMapControls && (
              <button
                onClick={handleSave}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                {saved ? '✓ Saved' : 'Save'}
              </button>
            )}
          </div>

          {/* Chat history */}
          <ScrollArea className="flex-1 px-4 py-3">
            {chatContent}
          </ScrollArea>

          {/* Input zone */}
          <div className="border-t p-4 flex-shrink-0">
            {inputZone}
          </div>

        </div>

        {/* Right — Map panel (60%) */}
        <div className="w-[60%] flex flex-col relative overflow-hidden">
          {showMapControls ? (
            <>
              <div className="flex-1 relative">
                <MapLibreMap
                  palette={palette}
                  zoomId={activeZoom}
                  areaType={activeArea}
                />
              </div>

              <div className="flex items-center justify-between px-3 py-2 border-t bg-background/90 flex-shrink-0">
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
