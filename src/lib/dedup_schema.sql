-- ==========================================
-- Deduplication & History Preservation Migration Script for Supabase
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Enable pg_trgm for fuzzy string similarity scoring (0.0 to 1.0)
-- pg_trgm enables similarity() calculation to detect near-duplicate memories before insert.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add superseded_by column to link archived historical versions to the active replacement
-- superseded_by marks an old memory as replaced by a newer one, preserving revision history.
ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES public.memories(id);

-- 3. Create GIN trigram index on content for fast fuzzy matching across large vaults
CREATE INDEX IF NOT EXISTS idx_memories_content_trgm
  ON public.memories USING GIN (content gin_trgm_ops);

-- 4. Create Postgres RPC function to query the most similar active memory
CREATE OR REPLACE FUNCTION public.find_similar_memory(
  p_project_id uuid,
  p_user_id uuid,
  p_content text,
  p_threshold float DEFAULT 0.6
)
RETURNS TABLE(id uuid, content text, similarity_score float) AS $$
  SELECT id, content, similarity(content, p_content) AS similarity_score
  FROM public.memories
  WHERE project_id = p_project_id
    AND user_id = p_user_id
    AND is_archived = false
    AND similarity(content, p_content) > p_threshold
  ORDER BY similarity_score DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;
