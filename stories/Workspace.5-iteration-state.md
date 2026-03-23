# Story: Workspace — Section 5: Iteration State (1.4)

**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~20 min

**View:** Workspace — state 3 of 3
**Section:** 5 of 5
**Estimate:** 20 min
**Spec refs:** 1.4-workspace-iteration.md
**Objects:** workspace-user-refinement-msg, workspace-refining-indicator, workspace-ai-refinement-summary

---

## Purpose

Build the Iteration state: full 5-message demo thread rendered from demo-data,
map shows refined water color (#89b4cc), submit another refinement loops back to same page.

---

## Thread order (from demo_conversation.messages)

1. user — initial prompt
2. ai (style_summary) — "Done — ready to preview." + 4 bullets
3. user — refinement ("Make the water slightly cooler")
4. ai (refining) — "Refining — adjusting water..."
5. ai (refinement_summary) — "Refined — one change made." + 1 bullet

---

## Update WorkspaceIteration.jsx

```jsx
// 1.4 — Workspace: Iteration
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import ChatBubble from '@/components/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from '@/context/LangContext'

export default function WorkspaceIteration() {
  const { t, lang, data } = useLang()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef(null)

  const msgs = data.demo_conversation.messages

  const handleRefine = () => {
    if (!input.trim() || submitting) return
    setSubmitting(true)
    setTimeout(() => {
      navigate('/workspace/iteration', { replace: true })
      window.location.reload()
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleRefine()
    }
  }

  // msg[0]: user prompt
  // msg[1]: ai style_summary
  // msg[2]: user refinement
  // msg[3]: ai refining
  // msg[4]: ai refinement_summary
  const chatContent = (
    <>
      {/* 1. Initial user prompt */}
      <ChatBubble role="user">
        {msgs[0].content[lang]}
      </ChatBubble>

      {/* 2. AI style summary */}
      <ChatBubble role="ai">
        <p className="font-medium mb-1">{msgs[1].headline[lang]}</p>
        <ul className="space-y-0.5 list-disc list-inside">
          {msgs[1].bullets[lang].map((b, i) => (
            <li key={i} className="text-xs">{b}</li>
          ))}
        </ul>
      </ChatBubble>

      {/* 3. User refinement */}
      <ChatBubble role="user" id="workspace-user-refinement-msg">
        {msgs[2].content[lang]}
      </ChatBubble>

      {/* 4. AI refining indicator */}
      <ChatBubble role="ai" id="workspace-refining-indicator">
        <span className="italic text-muted-foreground">{msgs[3].headline[lang]}</span>
      </ChatBubble>

      {/* 5. AI refinement summary */}
      <ChatBubble role="ai" id="workspace-ai-refinement-summary">
        <p className="font-medium mb-1">{msgs[4].headline[lang]}</p>
        <ul className="space-y-0.5 list-disc list-inside">
          {msgs[4].bullets[lang].map((b, i) => (
            <li key={i} className="text-xs">{b}</li>
          ))}
        </ul>
      </ChatBubble>
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
      waterColor="#89b4cc"
      onExport={() => navigate('/export')}
    />
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `id="workspace-user-refinement-msg"` in DOM on `/workspace/iteration`
- [ ] `id="workspace-refining-indicator"` in DOM
- [ ] `id="workspace-ai-refinement-summary"` in DOM
- [ ] Full 5-message thread rendered in correct order
- [ ] Map uses `waterColor="#89b4cc"` (refined)
- [ ] Submit loops back to iteration page
- [ ] Build passes

### User-evaluable
- [ ] Chat thread reads as a complete story: prompt → summary → refinement → refining → delta
- [ ] "Refining..." bubble feels like in-progress feedback
- [ ] Delta bubble shows only the one change — tight and focused
- [ ] Water visibly cooler/more saturated than Preview state
