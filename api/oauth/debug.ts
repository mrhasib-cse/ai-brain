// TEMPORARY DEBUG ENDPOINT
// Note: This file should be deleted after debugging is done, as it exposes internal diagnostic info.

import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qhyimmhsooqcylsaokij.supabase.co';

  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const serviceKeyPresent = Boolean(rawServiceKey && rawServiceKey.trim().length > 0);
  const serviceKeyLength = rawServiceKey.length;
  const serviceKeyPrefix = rawServiceKey.substring(0, 8);

  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let testInsertSuccess = false;
  let testInsertError: string | null = null;
  let caughtException: string | null = null;

  try {
    const testClientId = `debug-test-${Date.now()}`;

    const { error: insertError } = await supabase
      .from('oauth_clients')
      .insert([{ client_id: testClientId, redirect_uris: ['https://example.com'] }]);

    if (insertError) {
      testInsertSuccess = false;
      testInsertError = insertError.message;
    } else {
      testInsertSuccess = true;
      testInsertError = null;

      // Clean up test row immediately
      await supabase.from('oauth_clients').delete().eq('client_id', testClientId);
    }
  } catch (err: any) {
    caughtException = err?.message || String(err);
  }

  return res.status(200).json({
    service_role_key_present: serviceKeyPresent,
    service_role_key_length: serviceKeyLength,
    service_role_key_prefix: serviceKeyPrefix,
    supabase_url_used: supabaseUrl,
    test_insert_success: testInsertSuccess,
    test_insert_error: testInsertError,
    caught_exception: caughtException,
  });
}
