import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getProjects, createProject, deleteProject } from '@/lib/projects';
import { isNewUser } from '@/lib/onboarding';
import { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  AlertCircle,
  Key
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjectsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsList();

    const checkFirstTimeUser = async () => {
      if (sessionStorage.getItem('onboarding_dismissed')) {
        return;
      }
      try {
        const isNew = await isNewUser();
        if (isNew) {
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('Failed to check if first-time user:', err);
      }
    };

    checkFirstTimeUser();
  }, [navigate]);

  const handleOpenModal = () => {
    setNameInput('');
    setDescriptionInput('');
    setNameError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!creating) {
      setIsModalOpen(false);
      setNameError(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setNameError('Project name is required');
      return;
    }

    setNameError(null);
    setCreating(true);

    try {
      const newProj = await createProject(nameInput, descriptionInput);
      setProjects((prev) => [newProj, ...prev]);
      setIsModalOpen(false);
      setNameInput('');
      setDescriptionInput('');
    } catch (err: any) {
      setNameError(err.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // prevent navigating to project detail
    if (!window.confirm(`Are you sure you want to delete project "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Failed to delete project: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Memory Projects
            </h1>
            <Badge color="indigo">{projects.length} Vault{projects.length === 1 ? '' : 's'}</Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your contextual memory scope isolate per application or repository.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/connections">
            <Button variant="outline" size="md">
              <Key className="w-4 h-4 mr-1.5 text-[#8F82FF]" />
              API Keys
            </Button>
          </Link>
          <Button variant="primary" size="md" onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-sm font-medium">Loading memory projects...</p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <Card className="border-[#6C5CE7]/30 bg-[var(--card-bg)] p-12 text-center space-y-6 memory-glow max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#8F82FF]/10 text-[#8F82FF] border border-[#6C5CE7]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#6C5CE7]/10">
            <FolderKanban className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif-display text-2xl font-bold text-[var(--text-primary)]">
              No projects yet
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Create your first project to start building your dedicated memory vault for Claude, ChatGPT, and Gemini.
            </p>
          </div>

          <Button variant="primary" size="lg" onClick={handleOpenModal} className="mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </Card>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              hoverGlow
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              className="group cursor-pointer p-6 flex flex-col justify-between space-y-4 hover:border-[#6C5CE7]/50 transition-all relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 flex items-center justify-center text-[#8F82FF] shrink-0 group-hover:scale-105 transition-transform">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)] group-hover:text-[#8F82FF] transition-colors truncate max-w-[200px]">
                      {project.name}
                    </h3>
                  </div>

                  {/* Delete Icon Button */}
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                    disabled={deletingId === project.id}
                    title="Delete Project"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 min-h-[32px] leading-relaxed">
                  {project.description || <span className="italic text-[var(--text-muted)]">No description provided.</span>}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  {new Date(project.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1 text-[#8F82FF] opacity-0 group-hover:opacity-100 transition-opacity font-sans font-semibold text-xs">
                  Open Vault
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[#6C5CE7]/30 rounded-2xl p-6 shadow-2xl memory-glow space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
                  Create New Project
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={creating}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Project Name *"
                placeholder="e.g. MemoryLayer Core, Personal Web App"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (e.target.value.trim()) setNameError(null);
                }}
                error={nameError || undefined}
                autoFocus
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Tech stack preferences and architectural decision log for the frontend application."
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border)] placeholder-[var(--text-muted)] text-sm transition-all focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleCloseModal}
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
                      Creating...
                    </>
                  ) : (
                    'Create Project'
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

export default Dashboard;
