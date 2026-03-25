# WemapStyle

AI-powered map style generator for Wemap. Describe the map style you want in plain language — WemapStyle uses Claude to generate a complete MapLibre GL color palette and lets you refine it through a conversation interface.

**Live:** https://wemapstyle.pages.dev
**API:** https://wemapstyle-api.pierre-addoum.workers.dev

---

## What it does

1. Type a style description — _"warm earthy tones, emphasise parks, de-emphasise roads"_
2. Claude generates a full color palette across 18 map properties
3. Preview it on a live MapLibre GL map with real Wemap tiles
4. Refine through conversation — _"make water darker", "use Times New Roman"_
5. Export as a valid MapLibre GL v8 style JSON ready for Wemap

---

## Tech stack

| Layer | Local dev | Production |
|---|---|---|
| Frontend | Vite + React 18 + React Router v6 | Cloudflare Pages |
| Backend | Express.js + PostgreSQL | Cloudflare Workers + Hono |
| Database | PostgreSQL | Cloudflare D1 (SQLite) |
| Fonts | Local PBF files | Cloudflare R2 |
| AI | Anthropic Claude (`claude-sonnet-4-6`) | same |
| Map | MapLibre GL JS 5.21 | same |

---

## Project structure

```
├── src/                        # React frontend
│   ├── App.jsx                 # Router setup (createBrowserRouter)
│   ├── pages/
│   │   ├── SessionHome.jsx     # Browse and create styles
│   │   ├── WorkspaceGenerate.jsx  # Step 1: input prompt
│   │   ├── WorkspacePreview.jsx   # Step 2: preview generated style
│   │   ├── WorkspaceIteration.jsx # Step 3: refine via chat
│   │   └── Export.jsx          # Step 4: download / copy JSON
│   ├── components/
│   │   ├── WorkspaceLayout.jsx # 40/60 split (chat | map)
│   │   ├── MapLibreMap.jsx     # Live MapLibre GL renderer
│   │   ├── SplitMapPanel.jsx   # Side-by-side before/after view
│   │   ├── SessionCard.jsx     # Style thumbnail card
│   │   ├── ChatBubble.jsx      # Conversation message bubble
│   │   ├── AppHeader.jsx       # Nav + EN/FR toggle
│   │   ├── ErrorBoundary.jsx   # Catches render errors
│   │   └── ui/                 # shadcn/ui components
│   ├── context/LangContext.jsx # EN/FR + session state + API calls
│   └── lib/
│       ├── palettes.js         # 10 demo palettes + keyword detection
│       └── buildExportStyle.js # Builds export-ready MapLibre style
│
├── server/                     # Express.js dev backend
│   ├── index.js                # Express app + CORS
│   ├── db.js                   # PostgreSQL pool
│   ├── prompts/palette.js      # Claude prompts (generate + refine)
│   └── routes/
│       ├── generate.js         # POST /api/generate, /api/refine
│       ├── sessions.js         # CRUD /api/sessions
│       └── fonts.js            # GET /fonts/:fontstack/:range
│
├── worker/                     # Cloudflare Workers production backend
│   ├── index.js                # Hono app + CORS
│   └── routes/                 # Same routes as server/routes/
│
├── data/
│   ├── demo-data.json          # i18n strings + demo sessions
│   └── wemap-base-style.json   # MapLibre GL base style
│
├── schema.sql                  # PostgreSQL schema (dev)
├── schema.d1.sql               # D1/SQLite schema (production)
├── wrangler.toml               # Cloudflare Workers config
└── .env.production             # VITE_API_BASE for production builds
```

---

## Running locally

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Anthropic API key

### Setup

```bash
# Clone and install
git clone https://github.com/paddoum/wemapstyle.git
cd wemapstyle
npm install

# Configure environment
cp .env.example .env
# Edit .env:
#   ANTHROPIC_API_KEY=sk-ant-...
#   DATABASE_URL=postgresql://localhost:5432/wemapstyle

# Create local database
psql -c "CREATE DATABASE wemapstyle;"
psql -d wemapstyle < schema.sql
```

### Start dev servers

Open two terminals:

```bash
# Terminal 1 — Express backend (port 3001)
npm run dev:server

# Terminal 2 — Vite frontend (port 5173)
npm run dev
```

Open http://localhost:5173.

The frontend defaults `VITE_API_BASE` to `http://localhost:3001` when not set.

### Local Workers dev (optional)

To test the Cloudflare Workers backend locally instead of Express:

```bash
npm run dev:worker
# Runs wrangler dev on port 3001 — same API surface
```

---

## Deploying

### Backend — Cloudflare Workers

```bash
# Set the Claude API key as a secret
npx wrangler secret put ANTHROPIC_API_KEY

# Create D1 database (first time only)
npx wrangler d1 create wemapstyle
# Copy the database_id into wrangler.toml

# Apply database schema
npx wrangler d1 execute wemapstyle --file=schema.d1.sql --remote

# Deploy worker
npm run deploy:worker
```

### Frontend — Cloudflare Pages

```bash
# Build (picks up .env.production automatically)
npm run build

# Deploy
npx wrangler pages deploy dist/
```

`.env.production` must contain:

```
VITE_API_BASE=https://<your-worker>.workers.dev
```

### Fonts — Cloudflare R2

Standard fonts (Open Sans, Noto Sans, Roboto, etc.) are proxied from OpenMapTiles automatically. Custom fonts like Times New Roman require PBF glyph files in the `wemapstyle-fonts` R2 bucket:

```bash
# Upload font glyphs (256 range files per font face)
for f in server/fonts/Times\ New\ Roman\ Regular/*.pbf; do
  filename=$(basename "$f")
  npx wrangler r2 object put "wemapstyle-fonts/Times New Roman Regular/$filename" \
    --file="$f" --remote
done
```

---

## API reference

All endpoints are served by the Express dev server (`localhost:3001`) and the Cloudflare Worker in production.

### Generate a palette

```
POST /api/generate
Content-Type: application/json

{ "prompt": "warm earthy tones, emphasise parks" }
```

Response:

```json
{
  "palette": {
    "background": "#efebe6",
    "water": "#89b4cc",
    "green": "#a8c99a",
    "roadPrimary": "#e0d8ce",
    "roadCasing": "#c8b9aa",
    "roadMinor": "#ede8e2",
    "building": "#c1bfbf",
    "border": "#b2b0b0",
    "rail": "#ffffff",
    "waterLabel": "#4a7a9b",
    "labelColor": null,
    "labelHalo": null,
    "labelOpacity": 1,
    "labelMinZoom": null,
    "labelMaxZoom": null,
    "labelHideFrom": null,
    "labelHideTo": null,
    "font": null,
    "summary": {
      "headline": "Done — warm earthy palette applied.",
      "bullets": ["Background: warm sand (#efebe6)", "..."]
    }
  }
}
```

### Refine a palette

```
POST /api/refine
Content-Type: application/json

{
  "prompt": "warm earthy tones, emphasise parks",
  "currentPalette": { ... },
  "refinementPrompt": "make water darker and use Times New Roman"
}
```

Response: same shape as `/api/generate`.

### Sessions

```
GET    /api/sessions           # List all sessions
POST   /api/sessions           # Create session
PATCH  /api/sessions/:id       # Update name / palette / thumbnail
DELETE /api/sessions/:id       # Delete session
```

Session object:

```json
{
  "id": 1,
  "name": "Warm Earth — Acme Corp",
  "palette": { ... },
  "thumbnail": "data:image/jpeg;base64,...",
  "created_at": "2026-03-25T13:00:00.000Z"
}
```

### Fonts

```
GET /fonts/:fontstack/:range.pbf
```

Serves MapLibre GL glyph PBF files. Checks Cloudflare R2 first; falls back to proxying `fonts.openmaptiles.org`.

---

## Palette fields

| Field | Type | Description |
|---|---|---|
| `background` | `#hex` | Canvas fill color |
| `water` | `#hex` | Water fill + waterway line color |
| `green` | `#hex` | Parks, forests, farmland fill |
| `roadPrimary` | `#hex` | Motorways, trunk, primary roads |
| `roadCasing` | `#hex` | Road casing (shadow, should be darker) |
| `roadMinor` | `#hex` | Secondary, tertiary, link roads |
| `building` | `#hex` | Building outlines (visible z16+) |
| `border` | `#hex` | Admin boundary lines |
| `rail` | `#hex` | Rail and transit lines |
| `waterLabel` | `#hex` | Water name text color |
| `labelColor` | `#hex` \| `null` | Place/road/POI text color (`null` = base style) |
| `labelHalo` | `#hex` \| `null` | Text halo color (`null` = base style) |
| `labelOpacity` | `0–1` | Label visibility (0 = hidden) |
| `labelMinZoom` | `number` \| `null` | Labels appear from this zoom |
| `labelMaxZoom` | `number` \| `null` | Labels hidden at this zoom and above |
| `labelHideFrom` | `number` \| `null` | Start of suppression range (pair with `labelHideTo`) |
| `labelHideTo` | `number` \| `null` | End of suppression range |
| `font` | `string` \| `null` | Font family (`null` = Open Sans) |

### Available fonts

| Name | Character |
|---|---|
| `Open Sans` | Clean, readable — default |
| `Noto Sans` | Universal, multi-language |
| `PT Sans` | Humanist, warm — heritage/tourism |
| `Roboto` | Geometric, modern — urban/transit |
| `Metropolis` | Minimal geometric — dark/design-forward maps |
| `Times New Roman` | Classic serif — historic/formal maps |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite frontend (http://localhost:5173) |
| `npm run dev:server` | Start Express backend (http://localhost:3001) |
| `npm run dev:worker` | Start Workers local dev (port 3001) |
| `npm run deploy:worker` | Deploy to Cloudflare Workers |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

---

## Environment variables

### `.env` (local dev)

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://localhost:5432/wemapstyle
```

### `.env.production` (Vite build)

```
VITE_API_BASE=https://wemapstyle-api.pierre-addoum.workers.dev
```

### Wrangler secrets (Cloudflare Workers)

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

---

## Architecture notes

**Dual backend:** The Express server and Cloudflare Worker expose identical REST APIs. This lets you develop and test locally with PostgreSQL, then deploy to D1 with no frontend changes.

**`useBlocker` requires a data router:** React Router's `useBlocker` hook (used for the unsaved-changes guard) only works with `createBrowserRouter`/`RouterProvider`, not `<BrowserRouter>`. The app uses `createBrowserRouter`.

**Font rendering:** MapLibre GL fetches glyph PBFs from the `/fonts` endpoint. Standard fonts hit OpenMapTiles; Times New Roman is served from R2. If a font isn't available, MapLibre silently falls back to the base style font.

**D1 integer IDs:** Cloudflare D1 returns `AUTOINCREMENT` primary keys as integers, not strings. Any `id.startsWith()` call must be guarded with `typeof id === 'string'`.
