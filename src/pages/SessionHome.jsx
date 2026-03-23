// 1.1 / 2.1 — Session Home
// Spec: C-UX-Scenarios/01-mias-style-sprint/1.1-session-home/1.1-session-home.md
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import SessionCard from '@/components/SessionCard'
import { Button } from '@/components/ui/button'
import { useLang } from '@/context/LangContext'

export default function SessionHome() {
  const { t, data, savedSessions, setSessionName } = useLang()
  const navigate = useNavigate()
  const [showEmpty, setShowEmpty] = useState(false)

  const handleNewStyle = () => {
    setSessionName(t('session_default_name'))
    navigate('/workspace/generate')
  }

  // Saved sessions prepended to demo sessions
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

          {(!showEmpty && allSessions.length > 0) ? (
            <div className="grid grid-cols-3 gap-4">
              {allSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
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

          {/* Dev toggle — remove before handoff */}
          <button
            className="mt-4 text-xs text-muted-foreground underline opacity-50"
            onClick={() => setShowEmpty((v) => !v)}
          >
            [dev] toggle empty state
          </button>
        </section>

      </main>
    </div>
  )
}
