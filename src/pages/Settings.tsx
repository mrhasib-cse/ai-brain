import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { exportAllUserData, downloadUserDataAsJson } from '@/lib/export';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  Download, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  User, 
  ShieldAlert,
  FileJson,
  Database
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Delete Account Modal & State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(false);

      const data = await exportAllUserData();
      downloadUserDataAsJson(data);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportError(err.message || 'Failed to export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (confirmEmailInput.trim().toLowerCase() !== user.email.toLowerCase()) {
      setDeleteError('The entered email does not match your account email.');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Get current active session token
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData.session?.access_token) {
        throw new Error('Could not retrieve active session token. Please sign in again.');
      }

      const token = sessionData.session.access_token;

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to delete account.');
      }

      // Successfully deleted on backend - sign out and redirect to landing page
      await signOut();
      navigate('/?deleted=true', { replace: true, state: { accountDeleted: true } });
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setDeleteError(err.message || 'An error occurred while deleting your account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--border)] pb-6">
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Account & Data Settings
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base">
          Manage your personal data exports, account privacy, and workspace preferences.
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/15 flex items-center justify-center text-[#8F82FF]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Signed in as</h2>
            <p className="text-sm font-mono text-[var(--text-secondary)]">{user?.email || 'Authenticated User'}</p>
          </div>
        </div>
      </Card>

      {/* 1. DATA EXPORT SECTION */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/15 flex items-center justify-center text-[#8F82FF] shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Export your data</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Download a complete JSON backup of all your projects and non-archived memory entries. 
              The export file includes memory contents, categorized tags, AI origins, and creation timestamps.
            </p>
          </div>
        </div>

        {exportError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {exportSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your data was exported and downloaded successfully as a JSON file.</span>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
            <FileJson className="w-4 h-4 text-[#8F82FF]" />
            <span>Format: UTF-8 JSON (.json)</span>
          </div>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download my data
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* 2. DANGER ZONE / ACCOUNT DELETION */}
      <Card className="p-6 sm:p-8 space-y-6 border-rose-500/30 bg-rose-500/[0.02]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-rose-400">Danger Zone</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Permanently delete your account and all associated data. This action is irreversible and immediately purges all projects, memories, active MCP connections, and API keys.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>This action cannot be undone once confirmed.</span>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmEmailInput('');
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete my account
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[var(--bg-main)] border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-rose-950/40 space-y-6">
            <button
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Delete Account Confirmation</h3>
            </div>

            <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              <p>
                Are you sure you want to permanently delete your MemoryLayer account?
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-muted)] font-mono pl-1">
                <li>All projects and memory entries</li>
                <li>All generated API keys and MCP tokens</li>
                <li>All OAuth registrations & authorization codes</li>
              </ul>
              <p className="text-xs text-[var(--text-secondary)] font-medium pt-1">
                To confirm, please enter your email address (<strong className="text-[var(--text-primary)] font-mono">{user?.email}</strong>) below:
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <Input
                label="Confirm Account Email"
                type="email"
                placeholder={user?.email || 'your-email@example.com'}
                value={confirmEmailInput}
                onChange={(e) => {
                  setConfirmEmailInput(e.target.value);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                autoFocus
                required
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={isDeleting || confirmEmailInput.trim().toLowerCase() !== (user?.email || '').toLowerCase()}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Deleting Account...
                    </>
                  ) : (
                    'Permanently Delete Account'
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
