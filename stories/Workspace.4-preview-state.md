# Story: Workspace — Section 4: Preview State (1.3)

**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~20 min

**View:** Workspace — state 2 of 3
**Section:** 4 of 5
**Estimate:** 25 min
**Spec refs:** 1.3-workspace-preview.md
**Objects:** workspace-ai-style-summary

---

## Purpose

Build the Preview state: full chat thread (user prompt + AI style summary),
refined input placeholder + button label, and submit navigates to /workspace/iteration.
Map panel already live from Section 3 — just needs `showMapControls` and `onExport`.

---

## Update WorkspacePreview.jsx

```jsx
// 1.3 — Workspace: Preview
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import ChatBubble from '@/components/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from '@/context/LangContext'

export default function WorkspacePreview() {
  const { t, lang, data } = useLang()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef(null)

  const conv = data.demo_conversation
  const userMsg = conv.messages[0].content[lang]
  const aiMsg   = conv.messages[1]

  const handleRefine = () => {
    if (!input.trim() || submitting) return
    setSubmitting(true)
    setTimeout(() => navigate('/workspace/iteration'), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleRefine()
    }
  }

  const chatContent = (
    <>
      <ChatBubble role="user">{userMsg}</ChatBubble>
      <ChatBubble role="ai" id="workspace-ai-style-summary">
        <p className="font-medium mb-1">{aiMsg.headline[lang]}</p>
        <ul className="space-y-0.5 list-disc list-inside">
          {aiMsg.bullets[lang].map((b, i) => (
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
      waterColor="#b0c4de"
      onExport={() => navigate('/export')}
    />
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `id="workspace-ai-style-summary"` in DOM on `/workspace/preview`
- [ ] AI bubble contains headline "Done — ready to preview."
- [ ] AI bubble contains 4 bullet items from demo data
- [ ] User prompt visible in chat above AI bubble
- [ ] Textarea placeholder is `refine_placeholder` string
- [ ] Submit button label is `refine_btn` string
- [ ] Submitting navigates to `/workspace/iteration` after 2s
- [ ] Cmd+Enter triggers submission
- [ ] Build passes

### User-evaluable
- [ ] Chat thread reads naturally: user prompt → AI style summary
- [ ] AI bubble feels like a summary response — headline prominent, bullets scannable
- [ ] Refine button only activates when text is typed
