import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const redirectUris = Array.isArray(body?.redirect_uris) ? body.redirect_uris : [];
    const clientId = crypto.randomUUID();

    const { error } = await supabase
      .from('oauth_clients')
      .insert([{ client_id: clientId, redirect_uris: redirectUris }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      client_id: clientId,
      redirect_uris: redirectUris,
      token_endpoint_auth_method: 'none',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
