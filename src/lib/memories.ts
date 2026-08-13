import { supabase } from '@/lib/supabase';
import { Memory } from '@/types';

export async function getMemories(projectId: string): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Memory[];
}

export async function createMemory(
  projectId: string,
  type: string,
  content: string,
  tags: string[]
): Promise<Memory> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('User must be logged in to create a memory.');
  }

  const { data, error } = await supabase
    .from('memories')
    .insert([
      {
        user_id: userData.user.id,
        project_id: projectId,
        type,
        content: content.trim(),
        tags: tags.map((t) => t.trim()).filter(Boolean),
        source_ai: 'manual',
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Memory;
}

export async function updateMemory(
  id: string,
  updates: { content?: string; tags?: string[]; type?: string }
): Promise<Memory> {
  const payload: Record<string, any> = {};
  if (updates.content !== undefined) payload.content = updates.content.trim();
  if (updates.tags !== undefined) payload.tags = updates.tags.map((t) => t.trim()).filter(Boolean);
  if (updates.type !== undefined) payload.type = updates.type;

  const { data, error } = await supabase
    .from('memories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Memory;
}

export async function deleteMemory(id: string): Promise<void> {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function searchMemories(
  projectId: string,
  query: string
): Promise<Memory[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getMemories(projectId);
  }

  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_archived', false)
      .textSearch('search_vector', trimmed, {
        config: 'english',
        type: 'websearch',
      })
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback if search_vector column doesn't exist yet in DB
      console.warn('Postgres FTS error, falling back to ilike:', error.message);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('memories')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_archived', false)
        .ilike('content', `%${trimmed}%`)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
      return (fallbackData || []) as Memory[];
    }

    return (data || []) as Memory[];
  } catch (err: any) {
    // Ultimate fallback
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('memories')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_archived', false)
      .ilike('content', `%${trimmed}%`)
      .order('created_at', { ascending: false });

    if (fallbackError) {
      throw new Error(err.message || fallbackError.message);
    }
    return (fallbackData || []) as Memory[];
  }
}

