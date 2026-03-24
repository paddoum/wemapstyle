// 1.4 — Workspace: Iteration
// Spec: C-UX-Scenarios/01-mias-style-sprint/1.4-workspace-iteration/1.4-workspace-iteration.md
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import ChatBubble from '@/components/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from '@/context/LangContext'
import { PALETTES } from '@/lib/palettes'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

let _nextId = 10
function nextId() { return _nextId++ }

const REFINE_KEYWORDS = [
  'water', 'roads', 'road', 'background', 'parks', 'green', 'labels',
  'buildings', 'landuse', 'borders', 'colors', 'colours', 'contrast',
  'font', 'text', 'rivers', 'lakes', 'motorway', 'highway',
]

function buildRefiningText(prompt, lang) {
  if (lang === 'fr') return 'Affinement en cours...'
  const lower = prompt.toLowerCase()
  const match = REFINE_KEYWORDS.find(k => lower.includes(k))
  return match ? `Refining — adjusting ${match}...` : 'Refining...'
}

function buildInitialThread(state, msgs, lang) {
  const userPrompt     = state?.userPrompt  ?? msgs[0].content[lang]
  const initialPalette = state?.palette     ?? PALETTES.warmEarth
  const apiSummary     = initialPalette?.summary
  const initHeadline   = apiSummary?.headline ?? msgs[1].headline[lang]
  const initBullets    = apiSummary?.bullets  ?? msgs[1].bullets[lang]

  if (state?.fromSaved) {
    return [
      { id: 1, role: 'user', text: userPrompt },
      { id: 2, role: 'ai',  type: 'summary',
        headline: `Loaded — ${state.sessionName ?? 'style'} is ready to refine.`,
        bullets: [], palette: initialPalette },
    ]
  }

  // Show generate context — refinement will be appended via API call on mount
  return [
    { id: 1, role: 'user', text: userPrompt },
    { id: 2, role: 'ai',  type: 'summary', headline: initHeadline, bullets: initBullets, palette: initialPalette },
  ]
}

export default function WorkspaceIteration() {
  const { t, lang, data, saveSession, setSessionName, setCurrentSessionId } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const mapRef = useRef(null)

  const msgs           = data.demo_conversation.messages
  const state          = location.state
  const userPrompt     = state?.userPrompt ?? msgs[0].content[lang]
  const initialPalette = state?.palette    ?? PALETTES.warmEarth

  const [palette, setPalette] = useState(initialPalette)
  const [thread,  setThread]  = useState(() => buildInitialThread(state, msgs, lang))

  // Restore session name and ID when opened from home page
  useEffect(() => {
    if (state?.fromSaved) {
      if (state.sessionName)  setSessionName(state.sessionName)
      if (state.sessionId)    setCurrentSessionId(state.sessionId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Process the initial refinement from WorkspacePreview via the real API
  useEffect(() => {
    const refinement = state?.refinement
    if (!refinement || state?.fromSaved) return

    const ctrl = new AbortController()
    let cancelled = false

    const refiningText = buildRefiningText(refinement, lang)
    const uid = nextId()
    const rid = nextId()

    setThread(prev => [
      ...prev,
      { id: uid, role: 'user', text: refinement },
      { id: rid, role: 'ai',  type: 'refining', headline: refiningText },
    ])
    setSubmitting(true)

    fetch(`${API_BASE}/api/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        currentPalette: initialPalette,
        refinementPrompt: refinement,
      }),
      signal: ctrl.signal,
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(({ palette: newPalette }) => {
        if (cancelled) return
        setThread(prev => [
          ...prev.filter(m => m.id !== rid),
          {
            id: nextId(), role: 'ai', type: 'summary',
            headline: newPalette.summary?.headline ?? 'Done — style updated.',
            bullets:  newPalette.summary?.bullets  ?? [],
            palette:  newPalette,
          },
        ])
        setPalette(newPalette)
      })
      .catch(() => {
        if (cancelled) return
        setThread(prev => [
          ...prev.filter(m => m.id !== rid),
          { id: nextId(), role: 'ai', type: 'error', headline: "Something went wrong — the style wasn't updated. Please try again." },
        ])
      })
      .finally(() => { if (!cancelled) setSubmitting(false) })

    return () => { cancelled = true; ctrl.abort() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when thread grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const handleRefine = async () => {
    if (!input.trim() || submitting) return
    const text = input
    setInput('')
    setSubmitting(true)

    const refiningText = buildRefiningText(text, lang)
    const uid = nextId()
    const rid = nextId()

    setThread(prev => [
      ...prev,
      { id: uid, role: 'user', text },
      { id: rid, role: 'ai',  type: 'refining', headline: refiningText },
    ])

    try {
      const res = await fetch(`${API_BASE}/api/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          currentPalette: palette,
          refinementPrompt: text,
        }),
      })

      if (!res.ok) throw new Error('API error')
      const { palette: newPalette } = await res.json()

      setThread(prev => [
        ...prev.filter(m => m.id !== rid),
        {
          id: nextId(),
          role: 'ai',
          type: 'summary',
          headline: newPalette.summary?.headline ?? 'Done — style updated.',
          bullets:  newPalette.summary?.bullets  ?? [],
          palette:  newPalette,
        },
      ])
      setPalette(newPalette)
    } catch (err) {
      console.error('[WorkspaceIteration] refine error:', err)
      setThread(prev => [
        ...prev.filter(m => m.id !== rid),
        { id: nextId(), role: 'ai', type: 'error', headline: "Something went wrong — the style wasn't updated. Please try again." },
      ])
      setInput(text)
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleRefine()
    }
  }

  const summaryIds = thread.filter(m => m.type === 'summary').map(m => m.id)
  const latestSummaryId = summaryIds[summaryIds.length - 1]

  const chatContent = (
    <>
      {thread.map((msg) => {
        if (msg.role === 'user') {
          return <ChatBubble key={msg.id} role="user">{msg.text}</ChatBubble>
        }
        if (msg.type === 'refining') {
          return (
            <ChatBubble key={msg.id} role="ai">
              <span className="italic opacity-70">{msg.headline}</span>
            </ChatBubble>
          )
        }
        if (msg.type === 'error') {
          return (
            <ChatBubble key={msg.id} role="ai">
              <span className="text-destructive">{msg.headline}</span>
            </ChatBubble>
          )
        }
        const isLatest = msg.id === latestSummaryId
        return (
          <ChatBubble key={msg.id} role="ai">
            <p className="font-medium mb-1">{msg.headline}</p>
            {msg.bullets && msg.bullets.length > 0 && (
              <ul className="space-y-0.5 list-disc list-inside">
                {msg.bullets.map((b, i) => <li key={i} className="text-xs">{b}</li>)}
              </ul>
            )}
            {!isLatest && msg.palette && (
              <button
                onClick={() => setPalette(msg.palette)}
                className="mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ↩ Restore this style
              </button>
            )}
          </ChatBubble>
        )
      })}
      <div ref={bottomRef} />
    </>
  )

  const inputZone = (
    <div className="flex flex-col gap-2">
      <Textarea
        id="workspace-input-field"
        ref={textareaRef}
        placeholder={t('refine_placeholder')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={submitting}
        className="resize-none text-sm min-h-[80px]"
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          id="workspace-refine-btn"
          onClick={handleRefine}
          disabled={!input.trim() || submitting}
        >
          {t('refine_btn')}
        </Button>
      </div>
    </div>
  )

  return (
    <WorkspaceLayout
      chatContent={chatContent}
      inputZone={inputZone}
      showMapControls
      palette={palette}
      mapRef={mapRef}
      onSave={() => saveSession(palette, mapRef.current?.capture())}
      onExport={() => navigate('/export', { state: { palette, thumbnail: mapRef.current?.capture() } })}
    />
  )
}
