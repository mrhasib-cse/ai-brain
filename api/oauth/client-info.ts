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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const urlObj = new URL(req.url || '', 'http://localhost');
    const clientId = req.query?.client_id || urlObj.searchParams.get('client_id');

    if (!clientId || typeof clientId !== 'string') {
      return res.status(400).json({ error: 'Missing client_id parameter' });
    }

    const { data, error } = await supabase
      .from('oauth_clients')
      .select('client_name')
      .eq('client_id', clientId.trim())
      .maybeSingle();

    if (error) {
      console.error('[OAuth Client Info] Supabase query error:', error);
      return res.status(200).json({ client_name: null });
    }

    const clientName =
      data?.client_name && typeof data.client_name === 'string' && data.client_name.trim()
        ? data.client_name.trim()
        : null;

    return res.status(200).json({ client_name: clientName });
  } catch (err: any) {
    console.error('[OAuth Client Info] Exception:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
