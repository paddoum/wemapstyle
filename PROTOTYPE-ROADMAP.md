# Prototype Roadmap — Scenario 01: Mia's Style Sprint

**Project:** WemapStyle
**Scenario:** 01 — Mia's Style Sprint
**Created:** 2026-03-23

---

## Configuration

| Setting | Value |
|---------|-------|
| **Device Compatibility** | Desktop-Only |
| **Design Fidelity** | Design System (real colors, typography, spacing) |
| **Languages** | English (default) + French |
| **Demo Data** | `data/demo-data.json` |
| **Framework** | React + Vite |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | useState + useContext (no external library) |
| **i18n** | LangContext provider wrapping demo-data.json strings |

---

## Pages

| # | Page | Spec File | Status | Built |
|---|------|-----------|--------|-------|
| 1.1 | Session Home | `C-UX-Scenarios/01-mias-style-sprint/1.1-session-home/1.1-session-home.md` | ✅ built | `src/pages/SessionHome.jsx` |
| 1.2 | Workspace: Input & Generate | `C-UX-Scenarios/01-mias-style-sprint/1.2-workspace-generate/1.2-workspace-generate.md` | ✅ built | `src/pages/WorkspaceGenerate.jsx` |
| 1.3 | Workspace: Preview | `C-UX-Scenarios/01-mias-style-sprint/1.3-workspace-preview/1.3-workspace-preview.md` | ✅ built | `src/pages/WorkspacePreview.jsx` |
| 1.4 | Workspace: Iteration | `C-UX-Scenarios/01-mias-style-sprint/1.4-workspace-iteration/1.4-workspace-iteration.md` | ✅ built | `src/pages/WorkspaceIteration.jsx` |
| 1.5 | Export | `C-UX-Scenarios/01-mias-style-sprint/1.5-export/1.5-export.md` | ✅ built | `src/pages/Export.jsx` |

---

## Key Design Tokens (from specs)

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-warm` | `#efebe6` | Generated style background (demo map) |
| `--color-road` | `#e0d8ce` | Demo map road color |
| `--color-water` | `#89b4cc` | Demo map water (refined) |
| `--color-water-initial` | `#b0c4de` | Demo map water (pre-refinement) |
| `--color-green` | `#a8c99a` | Demo map park/landuse |

### Architecture Notes
- Pages 1.2, 1.3, 1.4 share the same two-panel workspace layout — `WorkspaceLayout.jsx` component
- Map panel is a simulated canvas (no real MapLibre GL) — CSS-rendered `MapMock.jsx` using demo style colors
- Conversation thread is shared across 1.2/1.3/1.4; state differs per page
- Language toggle: `LangContext` provider; toggle button switches EN↔FR globally

### shadcn/ui Components to Install
| Component | Used For |
|-----------|----------|
| `button` | Generate Style, Refine Style, Export →, Download JSON, Copy JSON, New Style |
| `card` | Session cards (1.1), Export card (1.5) |
| `textarea` | Chat input field |
| `tabs` | Area type selector (City Centre / Small Town / Countryside) |
| `scroll-area` | Chat history scrollable area |
| `badge` | Zoom level buttons (Z5/Z10/Z14/Z17) |
| `separator` | Panel dividers |

---

## Folder Guide

```
01-mias-style-sprint-prototype/
├── PROTOTYPE-ROADMAP.md
├── data/
│   └── demo-data.json
├── work/                         ← per-page planning files (created as needed)
├── stories/                      ← section implementation guides (just-in-time)
├── src/
│   ├── main.jsx
│   ├── App.jsx                   ← React Router setup
│   ├── index.css                 ← Tailwind directives + CSS custom properties
│   ├── context/
│   │   └── LangContext.jsx       ← EN/FR provider
│   ├── components/
│   │   ├── WorkspaceLayout.jsx   ← 40/60 split panel
│   │   ├── ChatBubble.jsx
│   │   ├── MapMock.jsx           ← CSS-rendered simulated map
│   │   ├── ZoomSelector.jsx
│   │   └── AreaTypeTabs.jsx
│   └── pages/
│       ├── SessionHome.jsx       ← 1.1
│       ├── WorkspaceGenerate.jsx ← 1.2
│       ├── WorkspacePreview.jsx  ← 1.3
│       ├── WorkspaceIteration.jsx← 1.4
│       └── Export.jsx            ← 1.5
├── package.json
├── vite.config.js
├── tailwind.config.js
└── components.json               ← shadcn/ui config
```

---

## Build Order

1. **1.1 Session Home** — standalone, no shared dependencies → good first build
2. **1.2 Workspace: Input & Generate** — establishes the workspace layout component
3. **1.3 Workspace: Preview** — reuses workspace layout, adds map controls + AI summary
4. **1.4 Workspace: Iteration** — reuses workspace layout, adds delta summary pattern
5. **1.5 Export** — standalone export view, reuses header

Pages 1.2→1.4 should link sequentially (simulating the flow trigger). Page 1.1 links to 1.2. Page 1.3/1.4 has Export → link to 1.5.
