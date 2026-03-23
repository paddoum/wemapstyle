# Logical View Map — Scenario 01: Mia's Style Sprint

**Created:** 2026-03-23

---

## View Summary

| View | HTML File(s) | Scenario Steps | States |
|------|-------------|----------------|--------|
| A — Session Home | `1.1-session-home.html` | 1.1 | Empty state / with recent sessions |
| B — Workspace | `1.2-workspace-generate.html` | 1.2 | Input state (empty chat, placeholder map) |
| B — Workspace | `1.3-workspace-preview.html` | 1.3 | Preview state (AI summary, rendered map, controls visible) |
| B — Workspace | `1.4-workspace-iteration.html` | 1.4 | Iteration state (full chat thread, delta summary, refined map) |
| C — Export | `1.5-export.html` | 1.5 | Export state (thumbnail, name edit, download/copy) |

---

## Logical Views

### View A — Session Home
- **File:** `1.1-session-home.html`
- **Purpose:** Zero-friction launcher; recent sessions as trust signal
- **States:** Session cards visible (demo data) / empty state (no sessions)
- **Navigation out:** "New Style" button → `1.2-workspace-generate.html`
- **Shared components:** Header bar

### View B — Workspace (3 HTML files, shared layout)
- **Shared layout component:** `components/workspace-layout.css` + `shared/workspace.js`
- **Layout:** 40/60 two-panel split (conversation left, map right)
- **What changes per state:** Conversation panel content + map panel controls visibility

#### B1 — Input & Generate (`1.2-workspace-generate.html`)
- Empty chat area with placeholder hint
- Input field + Generate button (primary)
- Map panel: placeholder (no controls)
- Generating state: inline AI "thinking" message + map pulse loader
- Navigation out: generation complete → `1.3-workspace-preview.html`

#### B2 — Preview (`1.3-workspace-preview.html`)
- Chat thread: user prompt + AI style summary (4 bullets)
- Input field placeholder: "Refine, or describe what to change..."
- Button label: "Refine Style"
- Map panel: rendered style + zoom selector (Z5/Z10/Z14/Z17) + area type tabs + Export button
- Navigation out: Export → `1.5-export.html` OR submit refinement → `1.4-workspace-iteration.html`

#### B3 — Iteration (`1.4-workspace-iteration.html`)
- Chat thread: full exchange (prompt + summary + refinement + delta summary)
- Delta summary: "Refined — one change made." + single changed bullet
- Map panel: same controls as B2, map re-rendered with refined style colors
- Navigation out: Export → `1.5-export.html` OR submit another refinement → loops (same page reload)

### View C — Export
- **File:** `1.5-export.html`
- **Purpose:** Completion view; name + download/copy
- **Navigation out:** "← Back to workspace" → `1.4-workspace-iteration.html` (last workspace state)
- **Shared components:** Header bar (with back link)

---

## Shared Components (to build once, reuse)

| Component | Used In | Description |
|-----------|---------|-------------|
| Header bar | A, B, C | App name wordmark |
| Workspace layout | B1, B2, B3 | 40/60 split panel CSS |
| Chat bubble | B1, B2, B3 | User and AI message styling |
| Map mock canvas | B1, B2, B3 | CSS-rendered simulated map |
| Zoom selector | B2, B3 | Z5/Z10/Z14/Z17 button group |
| Area type tabs | B2, B3 | City Centre / Small Town / Countryside |
| i18n loader | All | Reads demo-data.json, swaps EN/FR strings |

---

## Build Order

1. **View A** (1.1) — standalone, no dependencies, establishes design tokens
2. **Workspace layout component** — build once before B1/B2/B3
3. **View B1** (1.2) — first workspace state
4. **View B2** (1.3) — extends B1 with map controls and AI summary
5. **View B3** (1.4) — extends B2 with full thread and delta summary
6. **View C** (1.5) — standalone export view
