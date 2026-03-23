# Story: Workspace — Section 2: Input & Generate State (1.2)
**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~25 min

**View:** Workspace — state 1 of 3
**Section:** 2 of 5
**Estimate:** 25 min
**Spec refs:** 1.2-workspace-generate.md
**Objects:** workspace-input-field, workspace-generate-btn, workspace-generating-indicator, workspace-preview-loading

---

## Purpose

Build the Input & Generate state: textarea + button in the input zone, empty chat hint,
generating animation (chat bubble + map pulse), and timed navigation to Preview.
Also creates ChatBubble component reused across all 3 workspace states.

---

## New Component: src/components/ChatBubble.jsx

```jsx
// src/components/ChatBubble.jsx
import { cn } from '@/lib/utils'

export default function ChatBubble({ role, children, className }) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start', className)}>
      <div className={cn(
        'max-w-[85%] rounded-lg px-3 py-2 text-sm',
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      )}>
        {children}
      </div>
    </div>
  )
}
```

---

## Update WorkspaceGenerate.jsx

```jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import ChatBubble from '@/components/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from '@/context/LangContext'

export default function WorkspaceGenerate() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const textareaRef = useRef(null)

  const handleGenerate = () => {
    if (!input.trim() || generating) return
    console.log('[WorkspaceGenerate] generating:', input)
    setUserPrompt(input)
    setInput('')
    setGenerating(true)
    setTimeout(() => {
      console.log('[WorkspaceGenerate] generation complete → navigating to preview')
      navigate('/workspace/preview')
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const chatContent = (
    <>
      {!userPrompt && !generating && (
        <p className="text-sm text-muted-foreground" id="workspace-chat-empty-hint">
          {t('chat_empty_state')}
        </p>
      )}
      {userPrompt && (
        <ChatBubble role="user">{userPrompt}</ChatBubble>
      )}
      {generating && (
        <ChatBubble role="ai" id="workspace-generating-indicator">
          {t('generating_msg')}
        </ChatBubble>
      )}
    </>
  )

  const inputZone = (
    <div className="flex flex-col gap-2">
      <Textarea
        id="workspace-input-field"
        ref={textareaRef}
        placeholder={t('input_placeholder')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={generating}
        className="resize-none text-sm min-h-[80px]"
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          id="workspace-generate-btn"
          onClick={handleGenerate}
          disabled={!input.trim() || generating}
        >
          {t('generate_btn')}
        </Button>
      </div>
    </div>
  )

  const mapPanel = generating ? (
    <div
      id="workspace-preview-loading"
      className="flex-1 bg-map-bg animate-pulse-slow flex items-center justify-center"
    >
      <span className="text-xs text-muted-foreground opacity-50">
        {t('generating_msg')}
      </span>
    </div>
  ) : null

  return (
    <WorkspaceLayout
      chatContent={chatContent}
      inputZone={inputZone}
      mapPanel={mapPanel}
    />
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `src/components/ChatBubble.jsx` exists
- [ ] `id="workspace-input-field"` present in DOM
- [ ] `id="workspace-generate-btn"` present in DOM
- [ ] Generate button disabled when input is empty
- [ ] Generate button disabled when `generating` is true
- [ ] After submitting: user bubble appears in chat with prompt text
- [ ] After submitting: `id="workspace-generating-indicator"` appears with "Building your style..."
- [ ] After submitting: `id="workspace-preview-loading"` appears in map panel
- [ ] After 2s: navigates to `/workspace/preview`
- [ ] Cmd+Enter triggers generation (keyboard shortcut)
- [ ] Empty chat hint visible before first submit
- [ ] Build passes

### User-evaluable
- [ ] Textarea feels natural — expands with content, placeholder readable
- [ ] Generate button only activates when text is typed
- [ ] "Building your style..." bubble feels like the AI is thinking
- [ ] Map panel pulse animation visible during generation
- [ ] 2-second delay feels right — not too fast, not too slow
- [ ] Navigation to Preview is smooth
