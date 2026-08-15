import { supabase } from '@/lib/supabase';

export interface ExportMemoryItem {
  type: string;
  content: string;
  tags: string[];
  source_ai: string | null;
  created_at: string;
}

export interface ExportProjectItem {
  name: string;
  description: string | null;
  created_at: string;
  memories: ExportMemoryItem[];
}

export interface ExportDataPayload {
  exported_at: string;
  projects: ExportProjectItem[];
}

/**
 * Fetches all of the current user's projects and their non-archived memories
 */
export async function exportAllUserData(): Promise<ExportDataPayload> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('You must be logged in to export your data.');
  }

  const userId = userData.user.id;

  // 1. Fetch all user projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, description, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (projectsError) {
    throw new Error(`Failed to load projects: ${projectsError.message}`);
  }

  // 2. Fetch all user non-archived memories
  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('project_id, type, content, tags, source_ai, created_at')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });

  if (memoriesError) {
    throw new Error(`Failed to load memories: ${memoriesError.message}`);
  }

  // 3. Group memories by project_id
  const memoriesByProjectId = new Map<string, ExportMemoryItem[]>();
  (memories || []).forEach((mem) => {
    if (!mem.project_id) return;
    const list = memoriesByProjectId.get(mem.project_id) || [];
    list.push({
      type: mem.type,
      content: mem.content,
      tags: Array.isArray(mem.tags) ? mem.tags : [],
      source_ai: mem.source_ai || null,
      created_at: mem.created_at,
    });
    memoriesByProjectId.set(mem.project_id, list);
  });

  const formattedProjects: ExportProjectItem[] = (projects || []).map((proj) => ({
    name: proj.name,
    description: proj.description || null,
    created_at: proj.created_at,
    memories: memoriesByProjectId.get(proj.id) || [],
  }));

  return {
    exported_at: new Date().toISOString(),
    projects: formattedProjects,
  };
}

/**
 * Triggers a browser download of the exported user data as a JSON file
 */
export function downloadUserDataAsJson(data: ExportDataPayload, filename?: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const downloadName = filename || `memorylayer-export-${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
