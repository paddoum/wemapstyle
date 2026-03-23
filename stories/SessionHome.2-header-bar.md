# Story: Session Home — Section 2: Header Bar
**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~10 min

**View:** Session Home
**Section:** 2 of 5
**Estimate:** 10 min
**Spec refs:** 1.1-session-home.md → Header Bar
**Objects:** home-header-appname, language toggle

---

## Purpose

Build the AppHeader component: app name wordmark (left) + EN/FR language toggle (right).
This component will be reused across all 5 pages — build it once, import everywhere.

---

## Component to Create

`src/components/AppHeader.jsx`

### Structure

```
<header>                          ← full-width, border-bottom, white bg
  <div>                           ← max-width container, flex, justify-between
    <span id="home-header-appname">WemapStyle</span>   ← left: wordmark
    <button>EN | FR</button>      ← right: lang toggle
  </div>
</header>
```

### Tailwind classes

```jsx
// header
"w-full border-b bg-background"

// inner container
"mx-auto flex h-12 max-w-screen-xl items-center justify-between px-6"

// wordmark
"text-sm font-semibold tracking-tight text-foreground"

// lang toggle (shadcn Button, variant="ghost", size="sm")
"text-xs font-medium text-muted-foreground"
```

### JavaScript

```jsx
import { useLang } from '@/context/LangContext'
import { Button } from '@/components/ui/button'

export default function AppHeader() {
  const { t, lang, toggleLang } = useLang()
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between px-6">
        <span id="home-header-appname" className="text-sm font-semibold tracking-tight">
          {t('app_name')}
        </span>
        <Button variant="ghost" size="sm" onClick={toggleLang}
          className="text-xs font-medium text-muted-foreground">
          {lang === 'en' ? 'FR' : 'EN'}
        </Button>
      </div>
    </header>
  )
}
```

## Update SessionHome.jsx

Import and render AppHeader at the top of the page, above all other content:

```jsx
import AppHeader from '@/components/AppHeader'

export default function SessionHome() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {/* Section 3 placeholder */}
      <div className="p-4 text-muted-foreground text-sm">Hero — coming next</div>
    </div>
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `src/components/AppHeader.jsx` exists
- [ ] Element with `id="home-header-appname"` is present in DOM
- [ ] `#home-header-appname` text content is `"WemapStyle"`
- [ ] Language toggle button is present
- [ ] Clicking toggle changes button label from `"FR"` to `"EN"` (and back)
- [ ] After toggle, `#home-header-appname` still reads `"WemapStyle"` (same in both languages)

### User-evaluable
- [ ] Header feels minimal and professional — wordmark is prominent, toggle is subtle
- [ ] Toggle click immediately updates all visible strings (confirmed in Section 5 with full page)
- [ ] Header height feels right — not too tall, not cramped
