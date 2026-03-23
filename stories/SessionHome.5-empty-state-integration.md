# Story: Session Home — Section 5: Empty State + Integration
**Status:** ✅ Complete — 2026-03-23
**Actual time:** ~10 min

**View:** Session Home
**Section:** 5 of 5
**Estimate:** 10 min
**Spec refs:** 1.1-session-home.md → Recent Styles (empty state)
**Objects:** home-recent-empty-state

---

## Purpose

Add the empty state for when no sessions exist, then verify full page integration:
complete layout, all i18n strings, and the EN/FR toggle working end-to-end.

---

## Update SessionHome.jsx

### 1. Add showEmpty dev toggle (top of component)

```jsx
const [showEmpty, setShowEmpty] = useState(false)
```

Add `useState` to the React import.

### 2. Replace sessions grid with conditional render

```jsx
{/* Recent Styles */}
<section className="mx-auto w-full max-w-screen-xl px-6 pb-12">
  <h2
    id="home-recent-section-heading"
    className="text-sm font-semibold text-foreground mb-4"
  >
    {t('recent_styles_heading')}
  </h2>

  {(!showEmpty && data.sessions.length > 0) ? (
    <div className="grid grid-cols-3 gap-4">
      {data.sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  ) : (
    <div
      id="home-recent-empty-state"
      className="text-sm text-muted-foreground py-6"
    >
      {t('empty_state')}
    </div>
  )}

  {/* Dev toggle — remove before handoff */}
  <button
    className="mt-4 text-xs text-muted-foreground underline opacity-50"
    onClick={() => setShowEmpty((v) => !v)}
  >
    [dev] toggle empty state
  </button>
</section>
```

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `id="home-recent-empty-state"` exists in DOM when sessions hidden
- [ ] Empty state text is `"Your styles will appear here"` (EN)
- [ ] Cards grid renders when `showEmpty` is false and sessions exist
- [ ] All 5 EN i18n keys render correctly on page load:
  - `app_name` → "WemapStyle"
  - `hero_headline` → "Generate map styles from a description"
  - `new_style_cta` → "+ New Style"
  - `recent_styles_heading` → "Recent Styles"
  - `empty_state` → "Your styles will appear here"
- [ ] After lang toggle all 5 keys update to FR equivalents
- [ ] Build passes with no errors

### User-evaluable
- [ ] Empty state looks subtle — not prominent, not alarming
- [ ] Dev toggle works: clicking it swaps cards ↔ empty state
- [ ] Full page feels complete and coherent top-to-bottom
- [ ] EN/FR toggle updates every visible string simultaneously — no missed strings
