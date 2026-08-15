import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Brain, Sparkles, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        // Automatically logged in -> redirect to onboarding
        navigate('/onboarding', { replace: true });
      } else {
        // Confirmation email sent
        setSuccessMsg('Account created successfully! Please check your email inbox to confirm your account before signing in.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during account creation.');
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
              Create Memory Vault
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Initialize your zero-knowledge cross-AI context memory
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successMsg ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-emerald-400">
              Registration Successful
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {successMsg}
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Proceed to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work or Personal Email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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
                    Creating Vault...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Free Beta Account
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {!successMsg && (
          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#8F82FF] hover:underline font-semibold inline-flex items-center gap-1">
              Sign In
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Signup;
