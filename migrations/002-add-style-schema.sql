-- Migration 002: add style_schema and base_style_url to sessions
-- PostgreSQL
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS style_schema JSONB;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS base_style_url TEXT;

-- D1/SQLite (run separately with wrangler d1 execute):
-- ALTER TABLE sessions ADD COLUMN style_schema TEXT;
-- ALTER TABLE sessions ADD COLUMN base_style_url TEXT;
