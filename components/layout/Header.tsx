import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Sun, Moon, Brain, Sparkles, ChevronRight, Menu, X } from 'lucide-react';

export interface HeaderProps {
  onGetStartedClick?: () => void;
  onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGetStartedClick, onSignInClick }) => {
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Sync initial dark class state from documentElement
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

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[var(--bg-main)]/80 border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
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
        </a>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
            How it Works
          </a>
          <a href="#interactive-demo" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
            Live Memory Simulator
          </a>
          <a href="#integrations" className="hover:text-[var(--text-primary)] transition-colors">
            Integrations
          </a>
          <a href="#security" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy & Encryption
          </a>
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

          {/* Placeholder Buttons */}
          <Button variant="ghost" size="sm" onClick={onSignInClick}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={onGetStartedClick}>
            Get Started
            <ChevronRight className="w-4 h-4" />
          </Button>
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
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)]">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)]">How it Works</a>
            <a href="#interactive-demo" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
              Live Memory Simulator
            </a>
            <a href="#integrations" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[var(--text-primary)]">Integrations</a>
          </nav>
          <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
            <Button variant="secondary" className="w-full justify-center" onClick={onSignInClick}>
              Sign In
            </Button>
            <Button variant="primary" className="w-full justify-center" onClick={onGetStartedClick}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
