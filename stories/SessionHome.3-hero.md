# Story: Session Home — Section 3: Hero
**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~15 min

**View:** Session Home
**Section:** 3 of 5
**Estimate:** 15 min
**Spec refs:** 1.1-session-home.md → Hero
**Objects:** home-hero-headline, home-hero-new-style-cta

---

## Purpose

Build the hero section: centered headline + primary CTA button that navigates to the workspace.
This is the dominant action on Session Home — the button should feel like the obvious next step.

---

## Update SessionHome.jsx

Add hero section below `<AppHeader />`, replacing the Section 3 placeholder.

### Structure

```
<main>                                    ← flex-col, centered, grows to fill viewport
  <section>                               ← hero, centered content
    <h1 id="home-hero-headline">          ← headline
    <Button id="home-hero-new-style-cta"> ← primary CTA
  </section>
  {/* Section 4 placeholder */}
</main>
```

### Full SessionHome.jsx

```jsx
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { useLang } from '@/context/LangContext'

export default function SessionHome() {
  const { t } = useLang()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex flex-col flex-1">

        {/* Hero */}
        <section className="flex flex-col items-center justify-center pt-20 pb-12 px-6">
          <h1
            id="home-hero-headline"
            className="text-2xl font-semibold tracking-tight text-foreground text-center max-w-md"
          >
            {t('hero_headline')}
          </h1>
          <Button
            id="home-hero-new-style-cta"
            size="lg"
            className="mt-8"
            onClick={() => {
              console.log('[SessionHome] New Style clicked')
              navigate('/workspace/generate')
            }}
          >
            {t('new_style_cta')}
          </Button>
        </section>

        {/* Section 4 placeholder: Recent Styles */}
        <div className="px-6 py-2 text-sm text-muted-foreground">
          Recent Styles — coming next
        </div>

      </main>
    </div>
  )
}
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] Element with `id="home-hero-headline"` present in DOM
- [ ] `#home-hero-headline` text content is `"Generate map styles from a description"` (EN)
- [ ] Element with `id="home-hero-new-style-cta"` present in DOM
- [ ] `#home-hero-new-style-cta` text content is `"+ New Style"` (EN)
- [ ] Clicking `#home-hero-new-style-cta` navigates to `/workspace/generate`
- [ ] After lang toggle: `#home-hero-headline` updates to FR string
- [ ] After lang toggle: `#home-hero-new-style-cta` updates to `"+ Nouveau style"`

### User-evaluable
- [ ] Headline and button are visually centered on the page
- [ ] Button is clearly the dominant action — large, prominent
- [ ] 32px gap between headline and button feels right
- [ ] Clicking button navigates smoothly to workspace stub
