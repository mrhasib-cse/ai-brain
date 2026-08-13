-- ==========================================
-- Full-Text Search (FTS) Migration Script for Supabase
-- Run this script in the Supabase SQL Editor to enable built-in Postgres full-text search.
-- ==========================================

-- 1. Add generated tsvector column combining content and tags
ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))) STORED;

-- 2. Create GIN index for fast full-text searching
CREATE INDEX IF NOT EXISTS idx_memories_search_vector
  ON public.memories USING GIN (search_vector);

-- NOTE:
-- As a GENERATED ALWAYS ... STORED column in Postgres, `search_vector` automatically stays
-- in sync whenever `content` or `tags` change on any memory row.
-- No extra application code, background workers, or triggers are needed to maintain it.
