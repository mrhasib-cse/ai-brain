-- ==========================================
-- OAuth 2.0 PKCE Tables for Claude Remote Connector
-- Run this script in the Supabase SQL Editor
-- ==========================================

CREATE TABLE IF NOT EXISTS public.oauth_clients (
  client_id text PRIMARY KEY,
  redirect_uris text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.oauth_codes (
  code text PRIMARY KEY,
  client_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri text NOT NULL,
  code_challenge text NOT NULL,
  code_challenge_method text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;
-- No public client policies — these tables are only accessed by server-side functions using the service role key, never directly by the browser client.
