import { supabase } from '@/lib/supabase';

/**
 * Checks if the current user is a first-time user.
 * Returns true if the user has 0 projects AND 0 API keys.
 */
export async function isNewUser(): Promise<boolean> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return false;
  }

  const userId = userData.user.id;

  try {
    const [projectsRes, apiKeysRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('api_keys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    const projectsCount = projectsRes.count ?? 0;
    const apiKeysCount = apiKeysRes.count ?? 0;

    return projectsCount === 0 && apiKeysCount === 0;
  } catch (err) {
    console.error('Failed to check isNewUser:', err);
    return false;
  }
}
