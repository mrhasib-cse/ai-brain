import React from 'react';
import { Brain, Shield, Lock, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--bg-secondary)] border-t border-[var(--border)] pt-16 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[var(--border)]">
          
          {/* Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6C5CE7] flex items-center justify-center text-white shadow-sm">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                MemoryLayer
              </span>
              <Badge color="indigo" variant="subtle">v1.0 Public Beta</Badge>
            </div>

            <p className="font-serif-display text-xl sm:text-2xl text-[var(--text-primary)] font-medium leading-snug">
              "Your AI memory should follow you—not the AI."
            </p>

            <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
              The universal memory substrate for modern artificial intelligence. Store user context, project preferences, and personal knowledge graph locally or end-to-end encrypted across Claude, ChatGPT, Gemini, and your code editors.
            </p>

            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-mono pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Zero-Knowledge Encryption
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[var(--text-muted)]" />
                Local Vault Support
              </span>
            </div>
          </div>

          {/* Supported AI Ecosystems */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Supported Platforms
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center justify-between py-1 hover:text-[var(--text-primary)] transition-colors">
                <span>Claude (Anthropic)</span>
                <span className="text-xs font-mono text-emerald-400">Active</span>
              </li>
              <li className="flex items-center justify-between py-1 hover:text-[var(--text-primary)] transition-colors">
                <span>ChatGPT (OpenAI)</span>
                <span className="text-xs font-mono text-emerald-400">Active</span>
              </li>
              <li className="flex items-center justify-between py-1 hover:text-[var(--text-primary)] transition-colors">
                <span>Gemini (Google)</span>
                <span className="text-xs font-mono text-emerald-400">Active</span>
              </li>
              <li className="flex items-center justify-between py-1 hover:text-[var(--text-primary)] transition-colors">
                <span>Cursor & VSCode</span>
                <span className="text-xs font-mono text-emerald-400">Active</span>
              </li>
              <li className="flex items-center justify-between py-1 hover:text-[var(--text-primary)] transition-colors">
                <span>Perplexity AI</span>
                <span className="text-xs font-mono text-[#6C5CE7]">Beta</span>
              </li>
            </ul>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Architecture
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">SDK Docs</a></li>
              <li><a href="#security" className="hover:text-[var(--text-primary)] transition-colors">Security Whitepaper</a></li>
              <li><a href="#interactive-demo" className="hover:text-[var(--text-primary)] transition-colors">Memory Graph Spec</a></li>
              <li><a href="#integrations" className="hover:text-[var(--text-primary)] transition-colors">Browser Extension</a></li>
            </ul>
          </div>

          {/* Legal / Trust */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Trust & Data
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#security" className="hover:text-[var(--text-primary)] transition-colors">Zero-Retention Policy</a></li>
              <li><a href="#security" className="hover:text-[var(--text-primary)] transition-colors">E2E Key Vault</a></li>
              <li><a href="#security" className="hover:text-[var(--text-primary)] transition-colors">Open Specification</a></li>
              <li><a href="#security" className="hover:text-[var(--text-primary)] transition-colors">SOC2 Compliance</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} MemoryLayer SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Security Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
