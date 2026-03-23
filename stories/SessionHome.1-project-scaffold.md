# Story: Session Home — Section 1: Project Scaffold
**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~25 min
**Notes:** jsconfig.json required for shadcn/ui to resolve path aliases in JS project.

**View:** Session Home
**Section:** 1 of 5
**Estimate:** 25 min
**Spec refs:** PROTOTYPE-ROADMAP.md, demo-data.json, Logical-View-Map.md
**Objects:** None (infrastructure only)

---

## Purpose

Scaffold the complete React + Vite + Tailwind + shadcn/ui project. This section creates the
technical foundation every other section depends on. No UI is built here — only the project
structure, routing, i18n context, and design tokens.

---

## Tasks

### 1. Initialise project

Run inside `01-mias-style-sprint-prototype/`:
```
npm create vite@latest . -- --template react
npm install
```

### 2. Install and configure Tailwind CSS

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'map-bg':    '#efebe6',
        'map-road':  '#e0d8ce',
        'map-water': '#89b4cc',
        'map-green': '#a8c99a',
      },
    },
  },
  plugins: [],
}
```

`src/index.css` — replace with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --map-bg:    #efebe6;
  --map-road:  #e0d8ce;
  --map-water: #89b4cc;
  --map-green: #a8c99a;
}
```

### 3. Initialise shadcn/ui

```
npx shadcn@latest init
```
Choose: Default style · Neutral base color · CSS variables: yes

Then add components:
```
npx shadcn@latest add button card textarea tabs scroll-area badge separator
```

### 4. Install React Router

```
npm install react-router-dom
```

### 5. Create folder structure

```
src/
├── context/
│   └── LangContext.jsx
├── components/
│   └── (empty — filled per section)
├── pages/
│   ├── SessionHome.jsx
│   ├── WorkspaceGenerate.jsx
│   ├── WorkspacePreview.jsx
│   ├── WorkspaceIteration.jsx
│   └── Export.jsx
```

Each page file: stub only — export default function returning `<div>[PageName]</div>`.

### 6. Create LangContext.jsx

```jsx
// src/context/LangContext.jsx
import { createContext, useContext, useState } from 'react'
import data from '../../data/demo-data.json'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(data.config.locale)
  const t = (key) => data.i18n[lang]?.[key] ?? key
  return (
    <LangContext.Provider value={{ lang, setLang, t, data }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
```

### 7. Set up App.jsx with routing

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import SessionHome from './pages/SessionHome'
import WorkspaceGenerate from './pages/WorkspaceGenerate'
import WorkspacePreview from './pages/WorkspacePreview'
import WorkspaceIteration from './pages/WorkspaceIteration'
import Export from './pages/Export'

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SessionHome />} />
          <Route path="/workspace/generate" element={<WorkspaceGenerate />} />
          <Route path="/workspace/preview" element={<WorkspacePreview />} />
          <Route path="/workspace/iteration" element={<WorkspaceIteration />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}
```

### 8. Update main.jsx

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `npm run dev` starts without errors
- [ ] `/` route renders without crash
- [ ] `/workspace/generate` route renders without crash
- [ ] `/workspace/preview` route renders without crash
- [ ] `/workspace/iteration` route renders without crash
- [ ] `/export` route renders without crash
- [ ] `useLang()` returns `t('app_name')` === `"WemapStyle"` when lang is `en`
- [ ] `useLang()` returns `t('app_name')` === `"WemapStyle"` when lang is `fr`
- [ ] Tailwind class `bg-map-bg` resolves to `#efebe6`
- [ ] shadcn Button component renders without error

### User-evaluable
- [ ] Dev server opens in browser with no console errors
- [ ] Each route shows its stub page name — no blank screens
- [ ] No visual regressions from shadcn/ui init (default theme looks clean)

---

## Test Instructions

**Agent (Puppeteer):**
1. `npm run dev`
2. Navigate to each route — assert no error boundaries triggered
3. Check `document.title` and page stub text present

**User (qualitative):**
1. Open `http://localhost:5173` — confirm it loads
2. Navigate manually to each route via URL bar
3. Confirm clean default shadcn/ui styling (white background, no broken styles)
