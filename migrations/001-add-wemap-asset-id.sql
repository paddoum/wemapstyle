-- Migration 001: add wemap_asset_id to sessions
-- Run once on existing databases. Fails silently if column already exists (continue-on-error in CI).
ALTER TABLE sessions ADD COLUMN wemap_asset_id TEXT;
