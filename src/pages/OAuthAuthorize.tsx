import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Brain, ShieldCheck, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export const OAuthAuthorize: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method') || 'S256';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  // Fetch connecting OAuth client info (client_name)
  useEffect(() => {
    if (!clientId) return;

    let isMounted = true;
    const fetchClientInfo = async () => {
      try {
        const response = await fetch(`/api/oauth/client-info?client_id=${encodeURIComponent(clientId)}`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data?.client_name) {
            setClientName(data.client_name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch OAuth client info:', err);
      }
    };

    fetchClientInfo();

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  // Redirect unauthenticated user to login while preserving full query string
  useEffect(() => {
    if (!authLoading && !user) {
      const returnUrl = `/oauth/authorize${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [user, authLoading, location.search, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8F82FF]" />
      </div>
    );
  }

  if (!clientId || !redirectUri || !codeChallenge) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full border-rose-500/30 p-8 text-center bg-[var(--card-bg)]">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="font-serif-display text-xl font-bold text-[var(--text-primary)] mb-2">
            Invalid Authorization Request
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-6">
            Missing required OAuth parameters (<code className="text-rose-400">client_id</code>,{' '}
            <code className="text-rose-400">redirect_uri</code>, or{' '}
            <code className="text-rose-400">code_challenge</code>).
          </p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleAllow = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const code = crypto.randomUUID();

      const response = await fetch('/api/oauth/create-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to issue authorization code.');
      }

      // Redirect back to OAuth client redirect URI with code and state
      const targetUrl = new URL(redirectUri);
      targetUrl.searchParams.set('code', code);
      if (state) {
        targetUrl.searchParams.set('state', state);
      }

      window.location.href = targetUrl.toString();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authorization.');
      setSubmitting(false);
    }
  };

  const handleDeny = () => {
    try {
      const targetUrl = new URL(redirectUri);
      targetUrl.searchParams.set('error', 'access_denied');
      if (state) {
        targetUrl.searchParams.set('state', state);
      }
      window.location.href = targetUrl.toString();
    } catch {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full border-[#6C5CE7]/30 shadow-2xl bg-[var(--card-bg)] p-8 memory-glow">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8F82FF] flex items-center justify-center text-white shadow-xl shadow-[#6C5CE7]/30 mx-auto mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[var(--text-primary)] mb-1">
            {clientName ? `Connect to ${clientName}` : 'Connect to this app'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {clientName || 'This app'} wants to connect to your{' '}
            <span className="text-[#8F82FF] font-semibold">AI Memory Layer</span> vault.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 mb-6 space-y-3">
          <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8F82FF]" />
            Requested Permissions:
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Read non-archived memory items and projects</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Save new facts, decision logs, and updates</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Search stored memories using full-text keyword queries</span>
            </li>
          </ul>
        </div>

        <div className="p-3 bg-[#6C5CE7]/10 rounded-xl border border-[#6C5CE7]/20 text-xs text-[var(--text-secondary)] mb-6">
          Authorized account: <strong className="text-[var(--text-primary)]">{user?.email}</strong>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDeny}
            disabled={submitting}
            className="flex-1 justify-center border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Deny
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleAllow}
            disabled={submitting}
            className="flex-1 justify-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              'Allow Access'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OAuthAuthorize;
