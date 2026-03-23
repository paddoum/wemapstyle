# Story: Workspace — Section 1: Workspace Layout
**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~30 min

**View:** Workspace (B1, B2, B3)
**Section:** 1 of 5
**Estimate:** 30 min
**Spec refs:** 1.2, 1.3, 1.4 — Layout section of each
**Objects:** workspace-session-name

---

## Purpose

Build the shared WorkspaceLayout component — the 40/60 two-panel split that persists
across all three workspace states. Also build ChatHistory as a reusable scroll container.
Apply both to all 3 page stubs so the shell is in place before content is added.

---

## New Component: src/components/WorkspaceLayout.jsx

The layout accepts slot props for left-panel zones and right panel content.

```jsx
// src/components/WorkspaceLayout.jsx
import AppHeader from '@/components/AppHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { useLang } from '@/context/LangContext'

export default function WorkspaceLayout({ chatContent, inputZone, mapPanel }) {
  const { t } = useLang()
  const [sessionName, setSessionName] = useState(t('session_default_name'))
  const [editing, setEditing] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">

        {/* Left — Conversation panel (40%) */}
        <div className="w-[40%] flex flex-col border-r">

          {/* Session name */}
          <div className="px-4 py-3 border-b">
            {editing ? (
              <input
                id="workspace-session-name"
                autoFocus
                className="text-sm font-medium bg-transparent border-none outline-none w-full"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              />
            ) : (
              <span
                id="workspace-session-name"
                className="text-sm font-medium text-foreground cursor-text hover:text-muted-foreground transition-colors"
                onClick={() => setEditing(true)}
              >
                {sessionName}
              </span>
            )}
          </div>

          {/* Chat history — fills remaining space */}
          <ScrollArea className="flex-1 px-4 py-3">
            {chatContent}
          </ScrollArea>

          {/* Input zone — fixed at bottom */}
          <div className="border-t p-4">
            {inputZone}
          </div>

        </div>

        {/* Right — Map panel (60%) */}
        <div className="w-[60%] flex flex-col bg-muted/30 relative">
          {mapPanel ?? (
            <div className="flex-1 bg-muted/20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Map preview</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
```

---

## Update All 3 Workspace Pages

### WorkspaceGenerate.jsx

```jsx
import WorkspaceLayout from '@/components/WorkspaceLayout'

export default function WorkspaceGenerate() {
  return (
    <WorkspaceLayout
      chatContent={<div className="text-sm text-muted-foreground">Input state — coming next</div>}
      inputZone={<div className="text-sm text-muted-foreground">Input zone — coming next</div>}
      mapPanel={null}
    />
  )
}
```

### WorkspacePreview.jsx

```jsx
import WorkspaceLayout from '@/components/WorkspaceLayout'

export default function WorkspacePreview() {
  return (
    <WorkspaceLayout
      chatContent={<div className="text-sm text-muted-foreground">Preview state — coming next</div>}
      inputZone={<div className="text-sm text-muted-foreground">Input zone — coming next</div>}
      mapPanel={null}
    />
  )
}
```

### WorkspaceIteration.jsx

```jsx
import WorkspaceLayout from '@/components/WorkspaceLayout'

export default function WorkspaceIteration() {
  return (
    <WorkspaceLayout
      chatContent={<div className="text-sm text-muted-foreground">Iteration state — coming next</div>}
      inputZone={<div className="text-sm text-muted-foreground">Input zone — coming next</div>}
      mapPanel={null}
    />
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `src/components/WorkspaceLayout.jsx` exists
- [ ] `id="workspace-session-name"` present in DOM on all 3 workspace routes
- [ ] Session name default text is `"New Style"` (EN) / `"Nouveau style"` (FR)
- [ ] Clicking session name makes it editable (input appears)
- [ ] Typing and pressing Enter saves the new name
- [ ] Layout is `h-screen` — no vertical scrollbar on outer container
- [ ] Left panel is ~40% width, right panel ~60%
- [ ] Left and right panels separated by a visible border
- [ ] All 3 workspace routes render without crash
- [ ] Build passes

### User-evaluable
- [ ] Workspace fills the full browser window — no page scroll
- [ ] Left/right split feels proportional — map panel dominates
- [ ] Session name click-to-edit feels subtle and natural
- [ ] Map panel placeholder visible on right side
