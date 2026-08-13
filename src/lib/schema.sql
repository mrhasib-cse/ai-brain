-- ==========================================
-- 1. EXTENSIONS
-- Enable pgvector for storing and querying AI embeddings
-- ==========================================
CREATE EXTENSION IF NOT EXISTS vector;


-- ==========================================
-- 2. TABLES
-- ==========================================

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memories table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN (
      'text_fact',
      'document',
      'screenshot',
      'link',
      'decision_log',
      'preference',
      'status_update'
    )
  ),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  tags TEXT[] DEFAULT '{}',
  source_ai TEXT,
  importance_score INT DEFAULT 5,
  is_archived BOOLEAN DEFAULT false,
  -- Full-Text Search tsvector column (automatically generated & synced from content + tags)
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  ai_provider TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Access Logs table
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ==========================================
-- 3. INDEXES
-- ==========================================

-- Standard B-tree indexes for fast relational filtering
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_project_id ON public.memories(project_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON public.memories(type);

-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_memories_search_vector
  ON public.memories USING GIN (search_vector);

-- Vector similarity index using IVFFlat (Cosine Distance)
-- Note: IVFFlat indexes perform best after table populated with sample rows (e.g., >100 rows).
-- Rebuild using REINDEX or DROP/CREATE index when production row volume grows significantly.
CREATE INDEX IF NOT EXISTS idx_memories_embedding
  ON public.memories
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
CREATE POLICY "Users can manage their own projects"
  ON public.projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Memories RLS Policies
CREATE POLICY "Users can manage their own memories"
  ON public.memories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- API Keys RLS Policies
CREATE POLICY "Users can manage their own api keys"
  ON public.api_keys
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Access Logs RLS Policies
-- Users can only select access logs associated with their owned API keys
CREATE POLICY "Users can view access logs for their api keys"
  ON public.access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.api_keys
      WHERE public.api_keys.id = access_logs.api_key_id
        AND public.api_keys.user_id = auth.uid()
    )
  );


-- ==========================================
-- 5. TRIGGER FOR UPDATED_AT
-- ==========================================

-- Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on memories table
DROP TRIGGER IF EXISTS trigger_set_memories_updated_at ON public.memories;
CREATE TRIGGER trigger_set_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
