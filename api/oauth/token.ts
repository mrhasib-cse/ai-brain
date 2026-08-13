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

function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return `mlk_${uuid}${randomBytes}`;
}

function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

function parseFormUrlEncoded(str: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!str) return result;
  const pairs = str.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      result[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  return result;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'invalid_request', error_description: 'Method not allowed' });
  }

  try {
    let bodyData: any = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch {
        bodyData = parseFormUrlEncoded(bodyData);
      }
    } else if (Buffer.isBuffer(bodyData)) {
      const str = bodyData.toString('utf-8');
      try {
        bodyData = JSON.parse(str);
      } catch {
        bodyData = parseFormUrlEncoded(str);
      }
    } else if (!bodyData || Object.keys(bodyData).length === 0) {
      // Body might not have been pre-parsed by middleware
      bodyData = {};
    }

    const { grant_type, code, redirect_uri, client_id, code_verifier } = bodyData || {};

    if (grant_type !== 'authorization_code') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'grant_type must be authorization_code',
      });
    }

    if (!code || !redirect_uri || !client_id || !code_verifier) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters: code, redirect_uri, client_id, code_verifier',
      });
    }

    // Look up authorization code in oauth_codes
    const { data, error } = await supabase
      .from('oauth_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Authorization code not found',
      });
    }

    if (data.used) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Authorization code has already been used',
      });
    }

    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Authorization code has expired',
      });
    }

    if (data.redirect_uri !== redirect_uri) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Redirect URI mismatch',
      });
    }

    if (data.client_id !== client_id) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Client ID mismatch',
      });
    }

    // PKCE verification (S256)
    if (data.code_challenge_method === 'S256') {
      const hash = crypto.createHash('sha256').update(code_verifier).digest();
      const calculatedChallenge = hash
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      if (calculatedChallenge !== data.code_challenge) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'PKCE verification failed: code_verifier does not match code_challenge',
        });
      }
    }

    // Mark authorization code as used
    await supabase.from('oauth_codes').update({ used: true }).eq('code', code);

    // Issue new raw API key into api_keys table
    const rawKey = generateApiKey();
    const keyHash = hashKey(rawKey);

    const { error: insertErr } = await supabase.from('api_keys').insert([
      {
        user_id: data.user_id,
        label: 'Claude (OAuth)',
        ai_provider: 'claude',
        key_hash: keyHash,
      },
    ]);

    if (insertErr) {
      return res
        .status(500)
        .json({ error: 'server_error', error_description: insertErr.message });
    }

    return res.status(200).json({
      access_token: rawKey,
      token_type: 'bearer',
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: 'server_error', error_description: err.message || 'Internal server error' });
  }
}
