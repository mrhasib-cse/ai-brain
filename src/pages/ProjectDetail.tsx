import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '@/lib/projects';
import { getMemories, createMemory, updateMemory, deleteMemory, searchMemories } from '@/lib/memories';
import { Project, Memory, MemoryType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  X, 
  Calendar, 
  Tag, 
  FolderKanban,
  FileText,
  FileCode,
  Link2,
  CheckSquare,
  Settings2,
  Activity,
  AlertCircle,
  Brain,
  Search
} from 'lucide-react';

const MEMORY_TYPE_OPTIONS: { value: MemoryType; label: string; badgeColor: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'gray' }[] = [
  { value: 'text_fact', label: 'Fact / Snippet', badgeColor: 'indigo' },
  { value: 'document', label: 'Document', badgeColor: 'violet' },
  { value: 'link', label: 'Link', badgeColor: 'emerald' },
  { value: 'decision_log', label: 'Decision Log', badgeColor: 'amber' },
  { value: 'preference', label: 'Preference', badgeColor: 'rose' },
  { value: 'status_update', label: 'Status Update', badgeColor: 'gray' },
];

export const ProjectDetail: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  
  const [typeInput, setTypeInput] = useState<MemoryType>('text_fact');
  const [contentInput, setContentInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [contentError, setContentError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Initial load for project details and memories
  useEffect(() => {
    if (!projectId) return;
    const fetchInitial = async () => {
      try {
        setLoading(true);
        setError(null);
        const [projData, memsData] = await Promise.all([
          getProjectById(projectId),
          getMemories(projectId),
        ]);
        setProject(projData);
        setMemories(memsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [projectId]);

  // Debounced search handler (~300ms)
  useEffect(() => {
    if (!projectId) return;

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchMemories(projectId, searchQuery);
        setMemories(results);
      } catch (err: any) {
        setError(err.message || 'Failed to search memories.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, projectId]);

  const handleOpenCreateModal = () => {
    setEditingMemory(null);
    setTypeInput('text_fact');
    setContentInput('');
    setTagsInput('');
    setContentError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (memory: Memory) => {
    setEditingMemory(memory);
    setTypeInput(memory.type);
    setContentInput(memory.content);
    setTagsInput(memory.tags ? memory.tags.join(', ') : '');
    setContentError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!saving) {
      setIsModalOpen(false);
      setEditingMemory(null);
      setContentError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) {
      setContentError('Memory content is required');
      return;
    }

    if (!projectId) return;

    setContentError(null);
    setSaving(true);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingMemory) {
        const updated = await updateMemory(editingMemory.id, {
          type: typeInput,
          content: contentInput,
          tags: parsedTags,
        });
        setMemories((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
      } else {
        const created = await createMemory(
          projectId,
          typeInput,
          contentInput,
          parsedTags
        );
        setMemories((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setContentError(err.message || 'Failed to save memory.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(`Failed to delete memory: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeBadgeColor = (type: MemoryType) => {
    const opt = MEMORY_TYPE_OPTIONS.find((o) => o.value === type);
    return opt ? opt.badgeColor : 'indigo';
  };

  const getTypeLabel = (type: MemoryType) => {
    const opt = MEMORY_TYPE_OPTIONS.find((o) => o.value === type);
    return opt ? opt.label : type;
  };

  const getTypeIcon = (type: MemoryType) => {
    switch (type) {
      case 'text_fact':
        return <FileText className="w-3.5 h-3.5 mr-1 inline" />;
      case 'document':
        return <FileCode className="w-3.5 h-3.5 mr-1 inline" />;
      case 'link':
        return <Link2 className="w-3.5 h-3.5 mr-1 inline" />;
      case 'decision_log':
        return <CheckSquare className="w-3.5 h-3.5 mr-1 inline" />;
      case 'preference':
        return <Settings2 className="w-3.5 h-3.5 mr-1 inline" />;
      case 'status_update':
        return <Activity className="w-3.5 h-3.5 mr-1 inline" />;
      default:
        return <Brain className="w-3.5 h-3.5 mr-1 inline" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back Button & Header */}
      <div className="space-y-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="hover:text-[var(--text-primary)]">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Projects
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center shrink-0">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {project ? project.name : 'Project Vault'}
              </h1>
              <Badge color="indigo">{memories.length} Memor{memories.length === 1 ? 'y' : 'ies'}</Badge>
            </div>
            {project?.description && (
              <p className="text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          <Button variant="primary" size="md" onClick={handleOpenCreateModal} disabled={loading || !project}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Memory
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input Bar */}
      {!loading && (
        <div className="max-w-5xl mx-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search memories by keywords, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#6C5CE7] absolute right-3.5 top-1/2 -translate-y-1/2" />
            ) : searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Main Content Feed */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-sm font-medium">Loading memory feed...</p>
        </div>
      ) : memories.length === 0 ? (
        searchQuery.trim() ? (
          /* Search Empty State */
          <Card className="border-[var(--border)] bg-[var(--card-bg)] p-10 text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/15 text-[#8F82FF] border border-[#6C5CE7]/30 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
                No results for &ldquo;{searchQuery}&rdquo;
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Try searching with different keywords or tags, or clear the search filter to view all memories.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setSearchQuery('')}
              className="mx-auto"
            >
              Clear Search
            </Button>
          </Card>
        ) : (
          /* Standard Empty State */
          <Card className="border-[#6C5CE7]/30 bg-[var(--card-bg)] p-12 text-center space-y-6 memory-glow max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#8F82FF]/10 text-[#8F82FF] border border-[#6C5CE7]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#6C5CE7]/10">
              <Brain className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-display text-2xl font-bold text-[var(--text-primary)]">
                No memories yet
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Add your first memory snippet, document preference, or decision log to start building context for this project.
              </p>
            </div>

            <Button variant="primary" size="lg" onClick={handleOpenCreateModal} className="mx-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add First Memory
            </Button>
          </Card>
        )
      ) : (
        /* Memory List Feed */
        <div className="space-y-4 max-w-5xl mx-auto">
          {memories.map((memory) => (
            <Card
              key={memory.id}
              hoverGlow
              className="p-6 space-y-4 border-[var(--border)] bg-[var(--card-bg)] hover:border-[#6C5CE7]/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge color={getTypeBadgeColor(memory.type)}>
                    {getTypeIcon(memory.type)}
                    {getTypeLabel(memory.type)}
                  </Badge>
                  {memory.source_ai && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]">
                      {memory.source_ai}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(memory)}
                    title="Edit Memory"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#8F82FF] hover:bg-[#6C5CE7]/10 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(memory.id)}
                    disabled={deletingId === memory.id}
                    title="Delete Memory"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    {deletingId === memory.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-sans">
                {memory.content}
              </p>

              {/* Footer Meta (Tags & Date) */}
              <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {memory.tags && memory.tags.length > 0 ? (
                    memory.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]"
                      >
                        <Tag className="w-3 h-3 text-[#8F82FF]" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] italic">No tags</span>
                  )}
                </div>

                {/* Date */}
                <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                  {new Date(memory.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MEMORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[#6C5CE7]/30 rounded-2xl p-6 shadow-2xl memory-glow space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
                  {editingMemory ? 'Edit Memory Item' : 'Add Memory Item'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Dropdown */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
                  Memory Type *
                </label>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value as MemoryType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border)] text-sm focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 cursor-pointer"
                >
                  {MEMORY_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Textarea */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
                  Content / Context *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter fact, decision, preference, or code guideline..."
                  value={contentInput}
                  onChange={(e) => {
                    setContentInput(e.target.value);
                    if (e.target.value.trim()) setContentError(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-primary)] border ${
                    contentError ? 'border-rose-500' : 'border-[var(--border)]'
                  } placeholder-[var(--text-muted)] text-sm transition-all focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 resize-none`}
                  autoFocus
                />
                {contentError && (
                  <p className="text-xs text-rose-400 mt-0.5">{contentError}</p>
                )}
              </div>

              {/* Tags Comma-Separated */}
              <Input
                label="Tags (comma-separated)"
                placeholder="e.g. react19, tailwind, frontend, auth"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : editingMemory ? (
                    'Update Memory'
                  ) : (
                    'Add Memory'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
