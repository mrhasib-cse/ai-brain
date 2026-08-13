import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Brain, Key, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get('redirect') || searchParams.get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectTo || '/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
      } else {
        navigate(redirectTo || '/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full border-[#6C5CE7]/30 shadow-2xl bg-[var(--card-bg)] p-8 memory-glow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#8F82FF] flex items-center justify-center text-white shadow-lg shadow-[#6C5CE7]/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-display text-2xl font-bold text-[var(--text-primary)]">
              Welcome Back
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Sign in to access your universal memory vault
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Sign In to Vault
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
          Don't have a MemoryLayer vault?{' '}
          <Link to="/signup" className="text-[#8F82FF] hover:underline font-semibold inline-flex items-center gap-1">
            Create Account
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
