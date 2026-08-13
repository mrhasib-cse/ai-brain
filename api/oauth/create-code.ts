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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { data: { user }, error: authErr } = await supabase.auth.getUser(sessionToken);

    if (authErr || !user) {
      return res.status(401).json({ error: 'Unauthorized: invalid session token' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { client_id, redirect_uri, code_challenge, code_challenge_method, code } = body;

    if (!client_id || !redirect_uri || !code_challenge || !code) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

    const { error: insertErr } = await supabase.from('oauth_codes').insert([
      {
        code,
        client_id,
        user_id: user.id,
        redirect_uri,
        code_challenge,
        code_challenge_method: code_challenge_method || 'S256',
        expires_at: expiresAt,
        used: false,
      },
    ]);

    if (insertErr) {
      return res.status(500).json({ error: insertErr.message });
    }

    return res.status(200).json({ success: true, code });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
