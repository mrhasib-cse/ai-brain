import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Brain, X, Sparkles, Check, Key } from 'lucide-react';

export interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [authModal, setAuthModal] = useState<'signin' | 'getstarted' | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setModalSuccess(true);
    setTimeout(() => {
      setModalSuccess(false);
      setAuthModal(null);
      setEmailInput('');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-[#6C5CE7]/30 selection:text-[#8F82FF]">
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-[#6C5CE7]/15 via-purple-500/10 to-[#6C5CE7]/15 border-b border-[#6C5CE7]/20 py-2 px-4 text-center text-xs font-medium text-[var(--text-secondary)] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
        <span>MemoryLayer v1.0 Public Beta is now open — Unified context for Claude, ChatGPT & Gemini.</span>
        <button 
          onClick={() => setAuthModal('getstarted')} 
          className="text-[#8F82FF] hover:underline font-semibold ml-1 cursor-pointer"
        >
          Request Early Key →
        </button>
      </div>

      {/* Header */}
      <Header 
        onGetStartedClick={() => setAuthModal('getstarted')} 
        onSignInClick={() => setAuthModal('signin')} 
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Placeholder Sign In / Get Started Modal */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full relative border-[#6C5CE7]/30 shadow-2xl bg-[var(--card-bg)] p-8">
            <button
              onClick={() => { setAuthModal(null); setModalSuccess(false); }}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-lg shadow-[#6C5CE7]/30">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-display text-2xl font-bold text-[var(--text-primary)]">
                  {authModal === 'signin' ? 'Welcome Back' : 'Get MemoryLayer Key'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {authModal === 'signin' 
                    ? 'Connect your universal memory vault' 
                    : 'Unify your AI memory across all platforms'}
                </p>
              </div>
            </div>

            {modalSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-serif-display text-lg font-bold text-emerald-400">
                  {authModal === 'signin' ? 'Session Handshake Initialized' : 'Access Key Requested'}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Placeholder authentication step complete. MemoryLayer client SDK is ready for local vault synchronization.
                </p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="alex@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  helperText="Your zero-knowledge encryption key is tied to your master vault."
                />

                {authModal === 'signin' && (
                  <Input
                    label="Vault Passphrase or Secret Key"
                    type="password"
                    placeholder="••••••••••••••••"
                    required
                  />
                )}

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="lg" className="w-full justify-center">
                    <Key className="w-4 h-4 mr-2" />
                    {authModal === 'signin' ? 'Sign In to Vault' : 'Claim Free Developer Beta Key'}
                  </Button>
                </div>

                <p className="text-[11px] text-center text-[var(--text-muted)] pt-2">
                  No database or auth server connected yet. This is a layout shell preview for AI Memory Layer.
                </p>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
