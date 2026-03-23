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

export default function WorkspaceIteration() {
  const { t, lang, data, saveSession } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const msgs = data.demo_conversation.messages

  // Read what was passed from Preview
  const userPrompt  = location.state?.userPrompt  ?? msgs[0].content[lang]
  const refinement  = location.state?.refinement  ?? msgs[2].content[lang]
  const initialPalette = location.state?.palette  ?? PALETTES.warmEarth

  // Derive AI summary for first message — use API summary if available, else demo
  const apiSummary  = initialPalette?.summary
  const initHeadline = apiSummary?.headline ?? msgs[1].headline[lang]
  const initBullets  = apiSummary?.bullets  ?? msgs[1].bullets[lang]

  const [palette, setPalette] = useState(initialPalette)

  // Build initial 5-message thread from the real user text
  const [thread, setThread] = useState(() => [
    { id: 1, role: 'user',  text: userPrompt },
    { id: 2, role: 'ai',   type: 'summary',
      headline: initHeadline, bullets: initBullets },
    { id: 3, role: 'user',  text: refinement },
    { id: 4, role: 'ai',   type: 'refining',
      headline: msgs[3].headline[lang] },
    { id: 5, role: 'ai',   type: 'summary',
      headline: msgs[4].headline[lang], bullets: msgs[4].bullets[lang] },
  ])

  // Scroll to bottom when thread grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const handleRefine = async () => {
    if (!input.trim() || submitting) return
    const text = input
    setInput('')
    setSubmitting(true)

    const refiningText = lang === 'fr' ? 'Affinement en cours...' : 'Refining...'
    const uid = nextId()
    const rid = nextId()

    // Add user bubble + refining bubble immediately
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
        },
      ])
      setPalette(newPalette)
    } catch (err) {
      console.error('[WorkspaceIteration] refine error:', err)
      // Fallback: show generic message, keep current palette
      setThread(prev => [
        ...prev.filter(m => m.id !== rid),
        {
          id: nextId(),
          role: 'ai',
          type: 'summary',
          headline: 'Done — style updated.',
          bullets: [],
        },
      ])
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

  const chatContent = (
    <>
      {thread.map((msg) => {
        if (msg.role === 'user') {
          return (
            <ChatBubble key={msg.id} role="user">{msg.text}</ChatBubble>
          )
        }
        if (msg.type === 'refining') {
          return (
            <ChatBubble key={msg.id} role="ai">
              <span className="italic opacity-70">{msg.headline}</span>
            </ChatBubble>
          )
        }
        return (
          <ChatBubble key={msg.id} role="ai">
            <p className="font-medium mb-1">{msg.headline}</p>
            {msg.bullets && msg.bullets.length > 0 && (
              <ul className="space-y-0.5 list-disc list-inside">
                {msg.bullets.map((b, i) => (
                  <li key={i} className="text-xs">{b}</li>
                ))}
              </ul>
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
      onSave={() => saveSession(palette)}
      onExport={() => navigate('/export', { state: { palette } })}
    />
  )
}
