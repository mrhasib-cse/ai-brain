import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Search, 
  FolderKanban, 
  Download, 
  Key, 
  ShieldCheck,
  MessageSquare,
  Vault,
  Bot,
  CheckCircle2,
  X
} from 'lucide-react';

export const Landing: React.FC = () => {
  const location = useLocation();
  const [showDeletedBanner, setShowDeletedBanner] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('deleted') === 'true' || location.state?.accountDeleted) {
      setShowDeletedBanner(true);
    }
  }, [location]);

  return (
    <div className="w-full space-y-24 sm:space-y-32 pb-24">
      {/* Account Deletion Confirmation Toast / Banner */}
      {showDeletedBanner && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/20 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span className="font-medium text-[var(--text-primary)]">
                Your account and all associated data have been permanently deleted.
              </span>
            </div>
            <button
              onClick={() => setShowDeletedBanner(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6C5CE7]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 text-[#8F82FF] text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>The Universal Context Substrate for AI</span>
            <Badge color="indigo" variant="solid" className="text-[10px] px-1.5 py-0">BETA</Badge>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
            Your AI memory should follow you—<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] via-[#8F82FF] to-purple-400">not the AI.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-normal max-w-2xl mx-auto leading-relaxed">
            Claude, ChatGPT, and Gemini all follow the exact same memory. Stop repeating your preferences, tech stack, and background to every single model.
          </p>

          {/* CTA Button */}
          <div className="flex items-center justify-center pt-4">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge color="indigo" variant="subtle">Simple Architecture</Badge>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)]">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Three simple steps to unified context across all your AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="space-y-4 border-[var(--border)] bg-[var(--card-bg)] p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 flex items-center justify-center text-[#8F82FF]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#8F82FF] font-semibold uppercase tracking-wider">Step 1</span>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              1. Capture
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Save context from any AI conversation—facts, code style preferences, architectural decisions, and links.
            </p>
          </Card>

          <Card className="space-y-4 border-[var(--border)] bg-[var(--card-bg)] p-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Vault className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-purple-300 font-semibold uppercase tracking-wider">Step 2</span>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              2. Store
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Organized in your own private vault with client-side encryption and granular project tags.
            </p>
          </Card>

          <Card className="space-y-4 border-[#6C5CE7]/30 bg-[var(--card-bg)] p-8 memory-glow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">Step 3</span>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              3. Follow
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              The same memory shows up in Claude, ChatGPT, and Gemini automatically whenever you start a query.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge color="violet" variant="subtle">Capabilities</Badge>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)]">
            Features built for power users
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Take full control of your AI memory substrate across all providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hoverGlow className="space-y-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 flex items-center justify-center text-[#8F82FF]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Provider-agnostic memory
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Works seamlessly across Claude, ChatGPT, Gemini, and custom AI agents without vendor lock-in.
            </p>
          </Card>

          <Card hoverGlow className="space-y-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Semantic search
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Retrieves the exact relevant context snippet using fast vector embeddings when you need it.
            </p>
          </Card>

          <Card hoverGlow className="space-y-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Project-based organization
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Group memories into distinct projects to isolate codebase rules, client preferences, and scopes.
            </p>
          </Card>

          <Card hoverGlow className="space-y-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Full data ownership & export
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Your memory stays in your private vault with full JSON export, search, and deletion capabilities.
            </p>
          </Card>

          <Card hoverGlow className="space-y-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Per-AI access control
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Fine-tune which AI providers or API keys can read or write to specific memory scopes.
            </p>
          </Card>

          <Card hoverGlow className="space-y-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
              Privacy-first by design
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Client-side encryption ensures your private prompts and memory are never used to train public models.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. CLOSING CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--card-bg)] to-[var(--bg-secondary)] border-[#6C5CE7]/30 p-10 sm:p-16 text-center space-y-6 memory-glow relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#6C5CE7]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8F82FF] flex items-center justify-center text-white shadow-lg shadow-[#6C5CE7]/30 mx-auto">
            <Brain className="w-6 h-6" />
          </div>

          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)] max-w-2xl mx-auto leading-tight">
            Ready for a universal memory layer?
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Stop repeating yourself to every AI model. Create your free vault and bring persistent context to Claude, ChatGPT, and Gemini.
          </p>

          <div className="pt-2 flex items-center justify-center">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

    </div>
  );
};

export default Landing;
