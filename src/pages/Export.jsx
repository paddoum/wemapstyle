// 1.5 — Export
// Spec: C-UX-Scenarios/01-mias-style-sprint/1.5-export/1.5-export.md
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLang } from '@/context/LangContext'
import { buildExportStyle } from '@/lib/buildExportStyle'
import { PALETTES } from '@/lib/palettes'

export default function Export() {
  const { t, sessionName, setSessionName } = useLang()
  const navigate = useNavigate()
  const location = useLocation()

  // Use the palette passed from workspace; fall back to warmEarth if navigated directly
  const palette = location.state?.palette ?? PALETTES.warmEarth

  const [editingName,   setEditingName]   = useState(false)
  const [copyState,     setCopyState]     = useState('idle')
  const [downloadState, setDownloadState] = useState('idle')

  const getStyleJson = () => JSON.stringify(buildExportStyle(palette, sessionName), null, 2)

  const handleDownload = () => {
    const blob = new Blob([getStyleJson()], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${sessionName}.json`
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

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-md space-y-5">

          {/* Export card */}
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">

            {/* Map thumbnail */}
            <div
              id="export-style-thumbnail"
              className="w-full h-36 relative overflow-hidden"
              style={{ backgroundColor: palette.background }}
            >
              {/* Water band */}
              <div
                className="absolute inset-x-0 bottom-0 h-12"
                style={{ backgroundColor: palette.water, opacity: 0.85 }}
              />
              {/* Green patch */}
              <div
                className="absolute top-4 left-8 w-16 h-10 rounded"
                style={{ backgroundColor: palette.green, opacity: 0.7 }}
              />
              {/* Primary road — horizontal */}
              <div
                className="absolute inset-x-0 h-2"
                style={{ top: '45%', backgroundColor: palette.roadPrimary }}
              />
              {/* Secondary road — vertical */}
              <div
                className="absolute inset-y-0 w-1.5"
                style={{ left: '35%', backgroundColor: palette.roadMinor, opacity: 0.6 }}
              />
            </div>

            {/* Style name */}
            <div className="px-4 py-3 flex items-center gap-2 border-t">
              {editingName ? (
                <input
                  id="export-style-name"
                  autoFocus
                  className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-foreground"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                />
              ) : (
                <span
                  id="export-style-name"
                  className="flex-1 text-sm font-medium text-foreground cursor-text"
                  onClick={() => setEditingName(true)}
                >
                  {sessionName}
                </span>
              )}
              <button
                onClick={() => setEditingName(true)}
                className="text-muted-foreground hover:text-foreground transition-colors text-xs leading-none"
                aria-label="Edit style name"
              >
                ✏
              </button>
            </div>

          </div>

          {/* Action buttons */}
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
