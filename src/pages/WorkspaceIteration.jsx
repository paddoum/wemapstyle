// 1.4 — Workspace: Iteration
// Spec: C-UX-Scenarios/01-mias-style-sprint/1.4-workspace-iteration/1.4-workspace-iteration.md
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import ChatBubble from '@/components/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from '@/context/LangContext'
import { PALETTES, detectPalette } from '@/lib/palettes'

let _nextId = 10

function nextId() { return _nextId++ }

export default function WorkspaceIteration() {
  const { t, lang, data, saveSession } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [palette, setPalette] = useState(PALETTES.warmEarth)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const msgs = data.demo_conversation.messages

  // Read what the user actually typed in Preview (or fall back to demo text)
  const userPrompt  = location.state?.userPrompt  ?? msgs[0].content[lang]
  const refinement  = location.state?.refinement  ?? msgs[2].content[lang]

  // Build initial 5-message thread from the real user text
  const [thread, setThread] = useState(() => [
    { id: 1, role: 'user',  text: userPrompt },
    { id: 2, role: 'ai',   type: 'summary',
      headline: msgs[1].headline[lang], bullets: msgs[1].bullets[lang] },
    { id: 3, role: 'user',  text: refinement },
    { id: 4, role: 'ai',   type: 'refining',
      headline: msgs[3].headline[lang] },
    { id: 5, role: 'ai',   type: 'summary',
      headline: msgs[4].headline[lang], bullets: msgs[4].bullets[lang] },
  ])

  // Detect palette from initial refinement (e.g. halloween typed in Preview)
  useEffect(() => {
    const detected = detectPalette(refinement)
    if (detected) setPalette(detected)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when thread grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const handleRefine = () => {
    if (!input.trim() || submitting) return
    const text = input
    setInput('')
    setSubmitting(true)

    const detected = detectPalette(text)
    const nextPalette = detected ?? palette

    // Refining indicator in the i18n string
    const refiningText = lang === 'fr'
      ? 'Affinement en cours...'
      : 'Refining...'

    const uid = nextId()
    const rid = nextId()

    // Add user bubble + refining bubble immediately
    setThread(prev => [
      ...prev,
      { id: uid, role: 'user', text },
      { id: rid, role: 'ai',  type: 'refining', headline: refiningText },
    ])

    setTimeout(() => {
      // Replace refining bubble with AI summary
      setThread(prev => [
        ...prev.filter(m => m.id !== rid),
        {
          id: nextId(),
          role: 'ai',
          type: 'summary',
          headline: nextPalette.summary[lang].headline,
          bullets:  nextPalette.summary[lang].bullets,
        },
      ])
      setPalette(nextPalette)
      setSubmitting(false)
    }, 2000)
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
            {msg.bullets && (
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
      onExport={() => navigate('/export')}
    />
  )
}
