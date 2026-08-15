import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://qhyimmhsooqcylsaokij.supabase.co';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing session token' });
    }

    const sessionToken = authHeader.substring(7).trim();
    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized: invalid session token' });
    }

    // Verify token and get the authenticated user
    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(sessionToken);

    if (authErr || !user) {
      return res.status(401).json({ error: 'Unauthorized: invalid or expired session token' });
    }

    // Delete the user record from auth.users via Supabase Admin API
    // All related rows in public.projects, public.memories, public.api_keys,
    // public.access_logs, and public.oauth_codes will cascade delete (ON DELETE CASCADE)
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteErr) {
      console.error('[Account Delete] Failed to delete user:', deleteErr);
      return res.status(500).json({ error: deleteErr.message || 'Failed to delete account' });
    }

    return res.status(200).json({
      success: true,
      message: 'Account and all associated memory data deleted successfully.',
    });
  } catch (err: any) {
    console.error('[Account Delete] Server error during deletion:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
