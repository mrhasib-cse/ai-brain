export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
}

export type MemoryType = 
  | 'text_fact'
  | 'document'
  | 'screenshot'
  | 'link'
  | 'decision_log'
  | 'preference'
  | 'status_update';

export interface Memory {
  id: string;
  user_id: string;
  project_id?: string | null;
  type: MemoryType;
  content: string;
  embedding?: number[] | null;
  tags: string[];
  source_ai?: string | null;
  importance_score: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  label: string;
  ai_provider: string;
  created_at: string;
  last_used_at?: string | null;
  revoked_at?: string | null;
}
