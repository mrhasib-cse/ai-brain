import { supabase } from '@/lib/supabase';
import { ApiKey } from '@/types';

export function generateApiKey(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  const randomHex = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return `mlk_${uuid}${randomHex}`;
}

export async function hashKey(rawKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createApiKey(
  label: string,
  aiProvider: string
): Promise<{ rawKey: string; apiKeyRecord: ApiKey }> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('User must be logged in to create an API key.');
  }

  const rawKey = generateApiKey();
  const keyHash = await hashKey(rawKey);

  const { data, error } = await supabase
    .from('api_keys')
    .insert([
      {
        user_id: userData.user.id,
        label: label.trim(),
        ai_provider: aiProvider,
        key_hash: keyHash,
      },
    ])
    .select('id, user_id, label, ai_provider, created_at, last_used_at, revoked_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    rawKey,
    apiKeyRecord: data as ApiKey,
  };
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, label, ai_provider, created_at, last_used_at, revoked_at')
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ApiKey[];
}

export async function revokeApiKey(id: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
