import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase with Service Role Key for server-side administrative access
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

interface JsonRpcRequest {
  jsonrpc: string;
  id?: string | number | null;
  method: string;
  params?: any;
}

/**
 * Server-side SHA-256 key hashing helper
 */
function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

/**
 * Authenticate incoming HTTP request via Bearer token
 */
async function authenticate(req: any) {
  const authHeader =
    req.headers['authorization'] ||
    req.headers['Authorization'] ||
    (typeof req.headers.get === 'function' ? req.headers.get('authorization') : null);

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const rawKey = authHeader.substring(7).trim();
  if (!rawKey) return null;

  const keyHash = hashKey(rawKey);

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, label, ai_provider, revoked_at')
    .eq('key_hash', keyHash)
    .single();

  if (error || !data || data.revoked_at) {
    return null;
  }

  return data;
}

/**
 * Log access into access_logs table and update api_key last_used_at timestamp
 */
async function recordAccessLog(apiKeyId: string, action: string, path: string | null) {
  try {
    await Promise.all([
      supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', apiKeyId),
      supabase.from('access_logs').insert([
        {
          api_key_id: apiKeyId,
          action,
          path: path || null,
        },
      ]),
    ]);
  } catch (err) {
    console.warn('Failed to record access log:', err);
  }
}

/**
 * Vercel / Express Serverless Endpoint Handler
 */
export default async function handler(req: any, res: any) {
  // CORS Headers for MCP HTTP Transport
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32600, message: 'Method Not Allowed. Use POST.' },
    });
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:3000';
  const origin = `${proto}://${host}`;

  try {
    let body: JsonRpcRequest = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {} as any;
      }
    }

    const { jsonrpc, id = null, method, params } = body || {};

    if (jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
      });
    }

    // Authenticate request before executing any MCP method (including initialize, tools/list, and tools/call)
    const keyRow = await authenticate(req);
    if (!keyRow) {
      res.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"`
      );
      return res.status(401).json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32001,
          message: 'Unauthorized: missing, invalid, or revoked API key',
        },
      });
    }

    const userId = keyRow.user_id;

    // Handle MCP ping
    if (method === 'ping') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {},
      });
    }

    // Handle MCP notifications (e.g. notifications/initialized)
    if (method?.startsWith('notifications/')) {
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {},
      });
    }

    // Handle MCP initialize
    if (method === 'initialize') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'ai-memory-layer',
            version: '1.0.0',
          },
          capabilities: {
            tools: {},
          },
        },
      });
    }

    // Handle MCP tools/list
    if (method === 'tools/list') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'list_projects',
              description:
                "Call this to list the user's available memory projects/vaults when starting a task or when explicitly needed to resolve project context. Call sparingly, only when context is actually required.",
              inputSchema: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
            {
              name: 'get_project_memories',
              description:
                'Call this to retrieve non-archived memories for a specific project by name. Call only when relevant project context is actually needed to answer a user prompt or perform a task—do not call automatically on every user message.',
              inputSchema: {
                type: 'object',
                properties: {
                  project_name: {
                    type: 'string',
                    description: 'Name of the project to retrieve memories from (case-insensitive)',
                  },
                },
                required: ['project_name'],
              },
            },
            {
              name: 'save_memory',
              description:
                'Call this only when the user shares information that should be remembered long-term (a decision, a preference, a key fact, an architectural guideline, or a status update)—not for every message. Do not call this for casual conversation or transient thoughts.',
              inputSchema: {
                type: 'object',
                properties: {
                  project_name: {
                    type: 'string',
                    description:
                      'Name of the project to save memory into. If no project with that name exists for this user, it will be automatically created.',
                  },
                  type: {
                    type: 'string',
                    enum: [
                      'text_fact',
                      'document',
                      'screenshot',
                      'link',
                      'decision_log',
                      'preference',
                      'status_update',
                    ],
                    description: 'Classification of the memory item',
                  },
                  content: {
                    type: 'string',
                    description: 'The detailed content/text of the memory to store',
                  },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional tags or categories for indexing and search',
                  },
                },
                required: ['project_name', 'type', 'content'],
              },
            },
            {
              name: 'search_memories',
              description:
                'Call this to search for specific memory snippets in a project using full-text search keywords. Call only when searching for specific stored facts or guidelines relevant to the current user prompt.',
              inputSchema: {
                type: 'object',
                properties: {
                  project_name: {
                    type: 'string',
                    description: 'Name of the project to search memories within',
                  },
                  query: {
                    type: 'string',
                    description: 'Keywords or search phrase to find relevant memories',
                  },
                },
                required: ['project_name', 'query'],
              },
            },
            {
              name: 'delete_memory',
              description:
                'Call this to delete a specific memory item by its UUID when the user explicitly requests deleting or removing a stored memory.',
              inputSchema: {
                type: 'object',
                properties: {
                  memory_id: {
                    type: 'string',
                    description: 'UUID of the memory item to permanently delete',
                  },
                },
                required: ['memory_id'],
              },
            },
          ],
        },
      });
    }

    // Handle MCP tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      let resultData: any = null;
      let logPath: string | null = null;

      switch (toolName) {
        case 'list_projects': {
          const { data, error } = await supabase
            .from('projects')
            .select('id, name, description')
            .eq('user_id', userId)
            .order('name', { ascending: true });

          if (error) throw new Error(error.message);
          resultData = data || [];
          logPath = null;
          break;
        }

        case 'get_project_memories': {
          const projectName = (args.project_name || '').trim();
          if (!projectName) {
            throw new Error('Argument "project_name" is required.');
          }

          const { data: project } = await supabase
            .from('projects')
            .select('id, name')
            .eq('user_id', userId)
            .ilike('name', projectName)
            .maybeSingle();

          if (!project) {
            resultData = [];
          } else {
            const { data: memories, error } = await supabase
              .from('memories')
              .select('id, project_id, type, content, tags, source_ai, importance_score, is_archived, created_at, updated_at')
              .eq('user_id', userId)
              .eq('project_id', project.id)
              .eq('is_archived', false)
              .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            resultData = memories || [];
          }

          logPath = projectName;
          break;
        }

        case 'save_memory': {
          const projectName = (args.project_name || '').trim();
          const memoryType = args.type;
          const content = args.content;
          const tags = Array.isArray(args.tags) ? args.tags : [];

          if (!projectName || !memoryType || !content) {
            throw new Error('Arguments "project_name", "type", and "content" are required.');
          }

          // Look up project or create if not exists
          let { data: project } = await supabase
            .from('projects')
            .select('id, name')
            .eq('user_id', userId)
            .ilike('name', projectName)
            .maybeSingle();

          if (!project) {
            const { data: newProj, error: projErr } = await supabase
              .from('projects')
              .insert([
                {
                  user_id: userId,
                  name: projectName,
                  description: `Project created via MCP (${keyRow.ai_provider || 'AI Agent'})`,
                },
              ])
              .select('id, name')
              .single();

            if (projErr) throw new Error(`Failed to create project: ${projErr.message}`);
            project = newProj;
          }

          const sourceAi = keyRow.ai_provider || 'MCP Agent';

          const { data: newMemory, error: memErr } = await supabase
            .from('memories')
            .insert([
              {
                user_id: userId,
                project_id: project.id,
                type: memoryType,
                content,
                tags,
                source_ai: sourceAi,
                importance_score: 5,
                is_archived: false,
              },
            ])
            .select('id, project_id, type, content, tags, source_ai, created_at')
            .single();

          if (memErr) throw new Error(`Failed to save memory: ${memErr.message}`);
          resultData = newMemory;
          logPath = projectName;
          break;
        }

        case 'search_memories': {
          const projectName = (args.project_name || '').trim();
          const queryStr = (args.query || '').trim();

          if (!projectName || !queryStr) {
            throw new Error('Arguments "project_name" and "query" are required.');
          }

          const { data: project } = await supabase
            .from('projects')
            .select('id, name')
            .eq('user_id', userId)
            .ilike('name', projectName)
            .maybeSingle();

          if (!project) {
            resultData = [];
          } else {
            const { data: memories, error } = await supabase
              .from('memories')
              .select('id, project_id, type, content, tags, source_ai, created_at')
              .eq('user_id', userId)
              .eq('project_id', project.id)
              .eq('is_archived', false)
              .textSearch('search_vector', queryStr, {
                config: 'english',
                type: 'websearch',
              })
              .order('created_at', { ascending: false });

            if (error) {
              // Fallback to ILIKE if textSearch vector column or search fails
              const { data: fallbackMems, error: fallbackErr } = await supabase
                .from('memories')
                .select('id, project_id, type, content, tags, source_ai, created_at')
                .eq('user_id', userId)
                .eq('project_id', project.id)
                .eq('is_archived', false)
                .ilike('content', `%${queryStr}%`)
                .order('created_at', { ascending: false });

              if (fallbackErr) throw new Error(fallbackErr.message);
              resultData = fallbackMems || [];
            } else {
              resultData = memories || [];
            }
          }

          logPath = projectName;
          break;
        }

        case 'delete_memory': {
          const memoryId = (args.memory_id || '').trim();
          if (!memoryId) {
            throw new Error('Argument "memory_id" is required.');
          }

          const { error } = await supabase
            .from('memories')
            .delete()
            .eq('id', memoryId)
            .eq('user_id', userId);

          if (error) throw new Error(error.message);

          resultData = { success: true, deleted_id: memoryId };
          logPath = memoryId;
          break;
        }

        default:
          return res.status(404).json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Tool not found: ${toolName}`,
            },
          });
      }

      // Record access log asynchronously
      await recordAccessLog(keyRow.id, toolName, logPath);

      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resultData, null, 2),
            },
          ],
        },
      });
    }

    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not supported: ${method}` },
    });
  } catch (err: any) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id ?? null,
      error: {
        code: -32603,
        message: err.message || 'Internal server error',
      },
    });
  }
}
