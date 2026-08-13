import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/Button';
import { Sun, Moon, Brain, Sparkles, ChevronRight, Menu, X, LogOut, User as UserIcon, LayoutDashboard, Key } from 'lucide-react';

export interface HeaderProps {
  onGetStartedClick?: () => void;
  onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextState = !isDark;
    setIsDark(nextState);
    if (nextState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[var(--bg-main)]/80 border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#8F82FF] flex items-center justify-center text-white shadow-md shadow-[#6C5CE7]/30 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-display text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-1">
              MemoryLayer
              <span className="w-2 h-2 rounded-full bg-[#6C5CE7] inline-block"></span>
            </span>
            <span className="text-[10px] tracking-widest font-mono uppercase text-[var(--text-muted)]">
              Cross-AI Memory OS
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
          <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">
            Home
          </Link>
          <a href="/#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
            How it Works
          </a>
          <a href="/#features" className="hover:text-[var(--text-primary)] transition-colors">
            Features
          </a>
          {user && (
            <>
              <Link to="/dashboard" className="text-[#8F82FF] font-semibold hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link to="/dashboard/connections" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#8F82FF]" />
                API Keys
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[#6C5CE7]/40 transition-all cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]">
                <UserIcon className="w-3.5 h-3.5 text-[#8F82FF]" />
                <span className="max-w-[140px] truncate">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-rose-400 hover:text-rose-300">
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border)]"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border)]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-b border-[var(--border)] bg-[var(--bg-main)] px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)]">Home</Link>
            <a href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)]">How it Works</a>
            <a href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)]">Features</a>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-[#8F82FF] font-semibold flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/dashboard/connections" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#8F82FF]" />
                  API Keys & Connections
                </Link>
              </>
            )}
          </nav>
          <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-xs font-mono text-[var(--text-muted)] px-1 py-1 truncate">
                  Logged in as {user.email}
                </div>
                <Button variant="secondary" className="w-full justify-center text-rose-400" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
