// 1.1 / 2.1 — Session Home
// Spec: C-UX-Scenarios/01-mias-style-sprint/1.1-session-home/1.1-session-home.md
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import SessionCard from '@/components/SessionCard'
import { Button } from '@/components/ui/button'
import { useLang } from '@/context/LangContext'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

export default function SessionHome() {
  const { t, data, savedSessions, setSavedSessions, setSessionName, setCurrentSessionId, deleteSession, duplicateSession } = useLang()
  const navigate = useNavigate()
  const [showEmpty, setShowEmpty] = useState(false)
  const [apiLoaded, setApiLoaded] = useState(false)

  // Fetch persisted sessions from API on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/sessions`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(sessions => {
        const mapped = sessions.map(s => ({
          id: s.id,
          name: s.name,
          created_at: s.created_at?.split('T')[0] ?? '',
          palette: s.palette ?? null,
          thumbnail: s.thumbnail ?? null,
          thumbnail_bg:    s.palette?.background  ?? '#efebe6',
          thumbnail_road:  s.palette?.roadPrimary ?? '#e0d8ce',
          thumbnail_water: s.palette?.water       ?? '#89b4cc',
          thumbnail_green: s.palette?.green       ?? '#a8c99a',
        }))
        setSavedSessions(mapped)
        setApiLoaded(true)
      })
      .catch(() => {
        // API not available — fall back to in-memory sessions silently
        setApiLoaded(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewStyle = () => {
    setSessionName(t('session_default_name'))
    setCurrentSessionId(null)
    navigate('/workspace/generate')
  }

  // Saved sessions (from API or in-memory) prepended to demo sessions
  const allSessions = [...savedSessions, ...data.sessions]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex flex-col flex-1">

        {/* Hero */}
        <section className="flex flex-col items-center justify-center pt-20 pb-12 px-6">
          <h1
            id="home-hero-headline"
            className="text-2xl font-semibold tracking-tight text-foreground text-center max-w-md"
          >
            {t('hero_headline')}
          </h1>
          <Button
            id="home-hero-new-style-cta"
            size="lg"
            className="mt-8"
            onClick={handleNewStyle}
          >
            {t('new_style_cta')}
          </Button>
        </section>

        {/* Recent Styles */}
        <section className="mx-auto w-full max-w-screen-xl px-6 pb-12">
          <h2
            id="home-recent-section-heading"
            className="text-sm font-semibold text-foreground mb-4"
          >
            {t('recent_styles_heading')}
          </h2>

          {!apiLoaded ? (
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-lg border bg-muted/30 animate-pulse h-48" />
              ))}
            </div>
          ) : (!showEmpty && allSessions.length > 0) ? (
            <div className="grid grid-cols-3 gap-4">
              {allSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={session.id.startsWith('session-') ? null : () => deleteSession(session.id)}
                  onDuplicate={() => duplicateSession(session)}
                />
              ))}
            </div>
          ) : (
            <div
              id="home-recent-empty-state"
              className="text-sm text-muted-foreground py-6"
            >
              {t('empty_state')}
            </div>
          )}

        </section>

      </main>
    </div>
  )
}
