import React, { useEffect, useState } from 'react';
import { getApiKeys, createApiKey, revokeApiKey } from '@/lib/apiKeys';
import { ApiKey } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Key, 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  Copy, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Bot,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const AI_PROVIDER_OPTIONS = [
  { value: 'Claude', label: 'Claude (Anthropic)', badgeColor: 'indigo' as const },
  { value: 'ChatGPT', label: 'ChatGPT (OpenAI)', badgeColor: 'emerald' as const },
  { value: 'Gemini', label: 'Gemini (Google)', badgeColor: 'violet' as const },
  { value: 'Other', label: 'Other / Custom MCP', badgeColor: 'gray' as const },
];

export const Connections: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Key Form Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [providerInput, setProviderInput] = useState('Claude');
  const [labelError, setLabelError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Show Raw Key Modal State (Shown ONCE)
  const [rawKeyToShow, setRawKeyToShow] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApiKeys();
      setKeys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleOpenCreateModal = () => {
    setLabelInput('');
    setProviderInput('Claude');
    setLabelError(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (!creating) {
      setIsCreateModalOpen(false);
      setLabelError(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelInput.trim()) {
      setLabelError('Connection label is required');
      return;
    }

    setLabelError(null);
    setCreating(true);

    try {
      const { rawKey, apiKeyRecord } = await createApiKey(labelInput, providerInput);
      setKeys((prev) => [apiKeyRecord, ...prev]);
      setIsCreateModalOpen(false);
      
      // Show raw key modal ONCE
      setRawKeyToShow(rawKey);
      setCopied(false);
    } catch (err: any) {
      setLabelError(err.message || 'Failed to generate API key.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyRawKey = () => {
    if (rawKeyToShow) {
      navigator.clipboard.writeText(rawKeyToShow);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseRawKeyModal = () => {
    setRawKeyToShow(null);
    setCopied(false);
  };

  const handleRevokeKey = async (id: string, label: string) => {
    if (!window.confirm(`Are you sure you want to revoke API key "${label}"? Connected AI tools will lose access immediately.`)) {
      return;
    }

    setRevokingId(id);
    try {
      await revokeApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err: any) {
      alert(`Failed to revoke key: ${err.message}`);
    } finally {
      setRevokingId(null);
    }
  };

  const getProviderBadgeColor = (provider: string) => {
    const p = AI_PROVIDER_OPTIONS.find((opt) => opt.value === provider);
    return p ? p.badgeColor : 'indigo';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              AI Connections & API Keys
            </h1>
            <Badge color="indigo">{keys.length} Active Key{keys.length === 1 ? '' : 's'}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Generate secure access keys to connect Claude Desktop, ChatGPT, Gemini, or custom agents to your MemoryLayer vault.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Key
        </Button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Keys List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-sm font-medium">Loading API keys...</p>
        </div>
      ) : keys.length === 0 ? (
        /* Empty State */
        <Card className="border-[#6C5CE7]/30 bg-[var(--card-bg)] p-12 text-center space-y-6 memory-glow max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#8F82FF]/10 text-[#8F82FF] border border-[#6C5CE7]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#6C5CE7]/10">
            <Key className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif-display text-2xl font-bold text-[var(--text-primary)]">
              No API keys created
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Create an API key to allow your Claude Desktop, ChatGPT Custom GPTs, or Gemini agents to automatically fetch and update project memory context.
            </p>
          </div>

          <Button variant="primary" size="lg" onClick={handleOpenCreateModal} className="mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Generate First Key
          </Button>
        </Card>
      ) : (
        /* Keys List */
        <div className="space-y-4 max-w-5xl mx-auto">
          {keys.map((key) => (
            <Card
              key={key.id}
              hoverGlow
              className="p-6 border-[var(--border)] bg-[var(--card-bg)] hover:border-[#6C5CE7]/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 flex items-center justify-center text-[#8F82FF] shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                        {key.label}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge color={getProviderBadgeColor(key.ai_provider)}>
                          {key.ai_provider}
                        </Badge>
                        <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          SHA-256 Encrypted Hash
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revoke Button */}
                <div className="flex items-center justify-end sm:justify-start">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={revokingId === key.id}
                    onClick={() => handleRevokeKey(key.id, key.label)}
                    className="shrink-0"
                  >
                    {revokingId === key.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Revoke Key
                  </Button>
                </div>
              </div>

              {/* Meta information footer */}
              <div className="pt-3 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Created: {new Date(key.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:justify-end">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>
                    Last Used:{' '}
                    {key.last_used_at
                      ? new Date(key.last_used_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Never used'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[#6C5CE7]/30 rounded-2xl p-6 shadow-2xl memory-glow space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
                  Generate API Key
                </h3>
              </div>
              <button
                onClick={handleCloseCreateModal}
                disabled={creating}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Connection Label *"
                placeholder="e.g. Claude Desktop App, Custom ChatGPT GPT"
                value={labelInput}
                onChange={(e) => {
                  setLabelInput(e.target.value);
                  if (e.target.value.trim()) setLabelError(null);
                }}
                error={labelError || undefined}
                autoFocus
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
                  Target AI Provider *
                </label>
                <select
                  value={providerInput}
                  onChange={(e) => setProviderInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border)] text-sm focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 cursor-pointer"
                >
                  {AI_PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
                <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8F82FF]" />
                  Zero-Trust Hashing
                </p>
                <p>
                  Only the cryptographic SHA-256 hash will be saved in your vault. The raw key is generated strictly in your browser.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleCloseCreateModal}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    'Generate Key'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHOW RAW KEY MODAL (SHOWN ONCE) */}
      {rawKeyToShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[#6C5CE7]/50 rounded-2xl p-6 shadow-2xl memory-glow space-y-6">
            
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                  Save Your API Key
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  Copy this key now — you won&apos;t be able to see it again!
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
                Your Secret API Key
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[#6C5CE7]/30 font-mono text-xs sm:text-sm text-[#8F82FF] break-all select-all">
                <span className="flex-1 font-bold">{rawKeyToShow}</span>
                <Button
                  variant={copied ? 'success' : 'primary'}
                  size="sm"
                  onClick={handleCopyRawKey}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
              <strong>Warning:</strong> For security reasons, we do not store the unhashed key in our database. If you lose this key, you will need to revoke it and generate a new one.
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="md" onClick={handleCloseRawKeyModal} className="w-full sm:w-auto">
                I have copied my key safely
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
