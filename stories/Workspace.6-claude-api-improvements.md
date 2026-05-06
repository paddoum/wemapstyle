# Story: Workspace — Section 6: Claude API Improvements

**Status:** ✅ Complete — 2026-05-06
**Actual time:** ~45 min

**View:** Workspace (server + iteration)
**Section:** 6 of 6
**Estimate:** 45 min
**Spec refs:** n/a (post-Evolution 10 improvement)
**Files changed:**
- `server/prompts/palette.js`
- `server/routes/generate.js`
- `worker/routes/generate.js`
- `src/pages/WorkspaceIteration.jsx`
- `.env`

---

## Purpose

Three improvements to the Claude API integration identified after Evolution 10:

1. **Prompt caching** — the ~1000-token static block (LAYER_MAP + JSON template + rules) is now cached via `cache_control: { type: 'ephemeral' }` on both generate and refine calls, reducing token cost and latency on repeated calls.
2. **System prompt** — the role instruction (`You are a map style designer...`) moved from the user turn to the `system` parameter, also cached.
3. **Streaming refine with live map preview** — `/api/refine` now streams via SSE. `WorkspaceIteration` reads the stream and applies palette fields to the map as they arrive, giving a field-by-field live preview during generation.

---

## Changes

### `server/prompts/palette.js`

- Extracted `SYSTEM` constant: `[{ type: 'text', text: '...', cache_control: { type: 'ephemeral' } }]`
- Extracted `STATIC_GENERATE_BODY` and `STATIC_REFINE_BODY` constants (template + LAYER_MAP + rules)
- Replaced `buildGeneratePrompt` → `buildGenerateMessages(userPrompt, layerMap, schema)` returning `{ system, messages }` with cache_control on the static block
- Replaced `buildRefinePrompt` → `buildRefineMessages(userPrompt, currentPalette, refinementPrompt, layerMap, schema)` returning `{ system, messages }` with cache_control on the static block
- Dynamic path (custom styleUrl): system is cached, dynamic layerMap block is not
- `buildLayerMapFromSchema` unchanged

### `server/routes/generate.js` and `worker/routes/generate.js`

- `/generate`: uses `{ system, messages }` from `buildGenerateMessages`; response unchanged (JSON)
- `/refine`: changed to SSE stream
  - Express: `res.setHeader('Content-Type', 'text/event-stream')`, `for await` loop over `client.messages.stream()`
  - Hono worker: `streamSSE` from `hono/streaming`, same `for await` loop
  - Each text delta: `data: {"delta":"..."}\n\n`
  - On completion: `data: {"done":true,"palette":{...}}\n\n`
  - On error: `data: {"error":"..."}\n\n`

### `src/pages/WorkspaceIteration.jsx`

- Added `PALETTE_KEYS` set of known palette field names
- Added `extractPartialPalette(text)` — regex extracts completed `"field": value` pairs from partial JSON, stops before `"summary"` to avoid false positives
- Added `readRefineStream(response, onDelta)` — reads SSE body, calls `onDelta` per delta, returns final palette from `done` event
- Both refine call sites (mount `useEffect` + `handleRefine`) updated:
  - Read SSE stream instead of `await res.json()`
  - Apply partial palette fields live via `setPalette(prev => ({ ...prev, ...partial }))` on each delta
  - Set `setHasUnsaved(true)` only on full palette completion
  - Revert to `prevPalette` on error

### `.env`

- Added `WEMAP_PASSWORD_CLIENT_ID` (was only in `wrangler.toml` for the worker, missing for the Express dev server)

---

## Acceptance Criteria

### Agent-verifiable
- [ ] `POST /api/generate` returns `{ palette }` JSON as before
- [ ] `POST /api/refine` returns `Content-Type: text/event-stream`
- [ ] Refine stream emits `data: {"delta":"..."}` events followed by `data: {"done":true,"palette":{...}}`
- [ ] Map updates during refine before the summary bubble appears
- [ ] Error during refine reverts palette to pre-refine state
- [ ] Build passes

### User-evaluable
- [ ] Map colors visibly update field-by-field as Claude streams the palette
- [ ] No regression on generate flow (navigate to preview as before)
- [ ] Login works locally with `.env` credentials
