// 1.5 — Export
// Spec: C-UX-Scenarios/01-mias-style-sprint/1.5-export/1.5-export.md
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLang } from '@/context/LangContext'
import { buildExportStyle } from '@/lib/buildExportStyle'
import { PALETTES } from '@/lib/palettes'
import MapLibreMap from '@/components/MapLibreMap'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

export default function Export() {
  const { t, sessionName, setSessionName, currentSessionId } = useLang()
  const navigate = useNavigate()
  const location = useLocation()

  // Use the palette and thumbnail passed from workspace
  const palette   = location.state?.palette   ?? PALETTES.warmEarth
  const thumbnail = location.state?.thumbnail ?? null

  const [editingName,   setEditingName]   = useState(false)
  const [copyState,     setCopyState]     = useState('idle')
  const [downloadState, setDownloadState] = useState('idle')
  const [pushState,     setPushState]     = useState('idle') // idle | pushing | pushed | error
  const [pushError,     setPushError]     = useState(null)
  const [weMapLogin,    setWeMapLogin]    = useState('')
  const [weMapPassword, setWeMapPassword] = useState('')

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

  const handlePush = async () => {
    setPushState('pushing')
    setPushError(null)
    try {
      const res = await fetch(`${API_BASE}/api/push-to-wemap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId, name: sessionName, styleJson: getStyleJson(), username: weMapLogin, password: weMapPassword }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setPushState('pushed')
    } catch (err) {
      setPushError(err.message)
      setPushState('error')
    }
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

            {/* Map thumbnail — screenshot if available, live map fallback */}
            <div
              id="export-style-thumbnail"
              className="w-full h-36 relative overflow-hidden"
            >
              {thumbnail ? (
                <img src={thumbnail} alt="Map preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <MapLibreMap palette={palette} zoomId="z14" areaType="city-centre" />
                  <div className="absolute inset-0 z-10" />
                </>
              )}
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

          {/* Wemap credentials */}
          <div className="space-y-2">
            <input
              id="export-wemap-login"
              type="email"
              placeholder="Wemap login"
              value={weMapLogin}
              onChange={(e) => setWeMapLogin(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              id="export-wemap-password"
              type="password"
              placeholder="Wemap password"
              value={weMapPassword}
              onChange={(e) => setWeMapPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button
            id="export-push-btn"
            variant="outline"
            className="w-full"
            onClick={handlePush}
            disabled={pushState === 'pushing' || pushState === 'pushed' || !weMapLogin || !weMapPassword}
          >
            {pushState === 'pushing' ? t('pushing')
              : pushState === 'pushed' ? t('pushed')
              : t('push_to_wemap')}
          </Button>

          {pushState === 'error' && (
            <p id="export-push-error" className="text-xs text-destructive text-center">
              {pushError}
            </p>
          )}

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
