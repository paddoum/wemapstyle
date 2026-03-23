-- WemapStyle database schema

CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'New Style',
  prompt      TEXT,
  palette     JSONB,
  thumbnail   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role             TEXT NOT NULL,          -- 'user' | 'ai'
  type             TEXT,                   -- 'prompt' | 'summary' | 'refining' | 'refinement_summary'
  content          TEXT,
  palette_snapshot JSONB,
  created_at       TIMESTAMPTZ DEFAULT now()
);
