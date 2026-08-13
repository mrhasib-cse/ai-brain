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
    console.error(`[OAuth Register] Invalid method: ${req.method}`);
    return res.status(405).json({ error: 'invalid_request', error_description: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // Keep raw string or empty object
      }
    } else if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf-8'));
      } catch {
        // Keep as is
      }
    }

    const redirectUris = Array.isArray(body?.redirect_uris) ? body.redirect_uris : [];
    const clientName =
      typeof body?.client_name === 'string' && body.client_name.trim()
        ? body.client_name.trim()
        : null;

    const clientId = crypto.randomUUID();
    const issuedAt = Math.floor(Date.now() / 1000);

    const insertPayload: Record<string, any> = {
      client_id: clientId,
      redirect_uris: redirectUris,
    };

    if (clientName) {
      insertPayload.client_name = clientName;
    }

    const { error } = await supabase.from('oauth_clients').insert([insertPayload]);

    if (error) {
      console.error('[OAuth Register] Supabase insert failed. Error:', JSON.stringify(error, null, 2));
      console.error('[OAuth Register] Raw incoming request body was:', req.body);
      return res.status(500).json({
        error: 'invalid_client_metadata',
        error_description: error.message || 'Failed to insert client registration record',
      });
    }

    const responsePayload: Record<string, any> = {
      client_id: clientId,
      client_id_issued_at: issuedAt,
      redirect_uris: redirectUris,
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    };

    if (clientName) {
      responsePayload.client_name = clientName;
    }

    return res.status(201).json(responsePayload);
  } catch (err: any) {
    console.error('[OAuth Register] Caught exception during registration:', err);
    console.error('[OAuth Register] Raw incoming request body was:', req.body);
    return res.status(500).json({
      error: 'server_error',
      error_description: err?.message || 'Internal server error during client registration',
    });
  }
}

