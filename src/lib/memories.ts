import { supabase } from '@/lib/supabase';
import { Memory, CreateMemoryResult } from '@/types';

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
): Promise<CreateMemoryResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('User must be logged in to create a memory.');
  }

  const trimmedContent = content.trim();
  const cleanedTags = tags.map((t) => t.trim()).filter(Boolean);

  // 1. Check for near-duplicate memory using pg_trgm similarity via find_similar_memory RPC
  let matchedMemoryId: string | null = null;
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('find_similar_memory', {
      p_project_id: projectId,
      p_user_id: userData.user.id,
      p_content: trimmedContent,
      p_threshold: 0.6,
    });

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0 && rpcData[0]?.id) {
      matchedMemoryId = rpcData[0].id;
    }
  } catch (rpcErr) {
    console.warn('find_similar_memory RPC query failed or not installed yet:', rpcErr);
  }

  // 2. If a similar memory exists (> 0.6 similarity), archive matched row and insert new active row
  if (matchedMemoryId) {
    // Insert the new active memory row
    const { data: newRow, error: insertError } = await supabase
      .from('memories')
      .insert([
        {
          user_id: userData.user.id,
          project_id: projectId,
          type,
          content: trimmedContent,
          tags: cleanedTags,
          source_ai: 'manual',
          is_archived: false,
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Archive the matched existing memory as superseded by the new active row
    const { error: archiveError } = await supabase
      .from('memories')
      .update({
        is_archived: true,
        superseded_by: newRow.id,
      })
      .eq('id', matchedMemoryId);

    if (archiveError) {
      console.warn('Failed to archive superseded memory:', archiveError);
    }

    return {
      wasDuplicate: true,
      mergedInto: newRow.id,
      memory: newRow as Memory,
    };
  }

  // 3. No duplicate found: insert new active memory row
  const { data, error } = await supabase
    .from('memories')
    .insert([
      {
        user_id: userData.user.id,
        project_id: projectId,
        type,
        content: trimmedContent,
        tags: cleanedTags,
        source_ai: 'manual',
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    wasDuplicate: false,
    memory: data as Memory,
  };
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

