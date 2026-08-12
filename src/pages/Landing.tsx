import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  Search, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw,
  Cpu,
  Lock,
  MessageSquareCode,
  Sliders,
  Globe
} from 'lucide-react';

interface MemoryItem {
  id: string;
  category: 'Tech Stack' | 'Personal' | 'Project' | 'Style Guide';
  content: string;
  timestamp: string;
  confidence: number;
}

export const Landing: React.FC = () => {
  // Interactive Live Memory Simulator State
  const [memoryInput, setMemoryInput] = useState('My tech stack is React 19, TypeScript, and Tailwind CSS. I prefer dark mode with high contrast serif headlines.');
  const [syncedMemories, setSyncedMemories] = useState<MemoryItem[]>([
    {
      id: 'mem-1',
      category: 'Tech Stack',
      content: 'Prefers React 19, TypeScript, and Tailwind CSS for frontend applications.',
      timestamp: 'Just now',
      confidence: 99
    },
    {
      id: 'mem-2',
      category: 'Style Guide',
      content: 'Uses dark mode by default with Fraunces serif display headlines (#6C5CE7 indigo-violet accent).',
      timestamp: '2 min ago',
      confidence: 98
    },
    {
      id: 'mem-3',
      category: 'Project',
      content: 'Building "AI Memory Layer" — SaaS platform for unified AI memory across Claude, ChatGPT, Gemini.',
      timestamp: '5 min ago',
      confidence: 96
    }
  ]);

  const [activeModelTab, setActiveModelTab] = useState<'claude' | 'chatgpt' | 'gemini'>('claude');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryInput.trim()) return;

    setIsSyncing(true);
    setTimeout(() => {
      const newMem: MemoryItem = {
        id: `mem-${Date.now()}`,
        category: memoryInput.toLowerCase().includes('react') || memoryInput.toLowerCase().includes('code') ? 'Tech Stack' : 'Personal',
        content: memoryInput,
        timestamp: 'Just now',
        confidence: 99
      };
      setSyncedMemories([newMem, ...syncedMemories]);
      setMemoryInput('');
      setIsSyncing(false);
    }, 800);
  };

  const copyInstallCmd = () => {
    navigator.clipboard.writeText('npm i @memory-layer/sdk');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredMemories = syncedMemories.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-24 sm:space-y-32 pb-24">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6C5CE7]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 text-[#8F82FF] text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>The Universal Context Substrate for AI</span>
            <Badge color="indigo" variant="solid" className="text-[10px] px-1.5 py-0">NEW</Badge>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
            Your AI memory should follow you—<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] via-[#8F82FF] to-purple-400">not the AI.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-normal max-w-2xl mx-auto leading-relaxed">
            Claude, ChatGPT, and Gemini all follow the exact same memory. Stop repeating your preferences, tech stack, and background to every single model.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            
            <a href="#interactive-demo" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Sparkles className="w-4 h-4 text-[#6C5CE7] mr-1" />
                Explore Live Memory Demo
              </Button>
            </a>
          </div>

          {/* Quick Command Snippet */}
          <div className="pt-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] shadow-sm">
              <Terminal className="w-4 h-4 text-[#6C5CE7]" />
              <span>npm install @memory-layer/sdk</span>
              <button
                onClick={copyInstallCmd}
                className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Copy Command"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Trust stats */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[var(--border)] text-left">
            <div className="p-3">
              <div className="text-2xl font-serif-display font-bold text-[var(--text-primary)]">100%</div>
              <div className="text-xs text-[var(--text-muted)]">Zero-Knowledge Encrypted</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-serif-display font-bold text-[var(--text-primary)]">&lt; 12ms</div>
              <div className="text-xs text-[var(--text-muted)]">Context Retrieval Latency</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-serif-display font-bold text-[var(--text-primary)]">3 Major</div>
              <div className="text-xs text-[var(--text-muted)]">Claude, ChatGPT & Gemini</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-serif-display font-bold text-[var(--text-primary)]">Local Vault</div>
              <div className="text-xs text-[var(--text-muted)]">Private Storage First</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE MEMORY SIMULATOR DEMO */}
      <section id="interactive-demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-3 mb-10">
          <Badge color="violet" variant="subtle">Interactive Playground</Badge>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            See Cross-Model Context In Action
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Type a memory or rule into MemoryLayer below. Switch between Claude, ChatGPT, and Gemini to see how each model retrieves the exact same context.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Memory Ingestion Panel */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-[#6C5CE7]/30 memory-glow bg-[var(--card-bg)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#6C5CE7]" />
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                    MemoryLayer Vault Writer
                  </h3>
                </div>
                <Badge color="emerald" variant="subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Vault
                </Badge>
              </div>

              <form onSubmit={handleAddMemory} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    New Memory or Directive
                  </label>
                  <textarea
                    rows={3}
                    value={memoryInput}
                    onChange={(e) => setMemoryInput(e.target.value)}
                    placeholder="e.g. Always generate code using TypeScript with strict types and Tailwind CSS v4."
                    className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 text-sm resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  disabled={isSyncing || !memoryInput.trim()} 
                  className="w-full justify-center"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Encrypting & Syncing Context...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Sync Memory Across All AI
                    </>
                  )}
                </Button>
              </form>

              {/* Memory Search Filter */}
              <div className="pt-2 border-t border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                    Stored Context Blocks ({syncedMemories.length})
                  </span>
                  <span className="text-[11px] font-mono text-[#8F82FF]">AES-256 GCM</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter stored memories..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#6C5CE7]"
                  />
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {filteredMemories.map((mem) => (
                    <div 
                      key={mem.id} 
                      className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[#6C5CE7]/40 transition-all space-y-1 text-xs group"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <Badge color={mem.category === 'Tech Stack' ? 'indigo' : 'emerald'} variant="subtle">
                          {mem.category}
                        </Badge>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {mem.timestamp} • {mem.confidence}% match
                        </span>
                      </div>
                      <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                        {mem.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: AI Assistant Viewer */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-[var(--border)] bg-[var(--card-bg)] p-0 overflow-hidden shadow-xl">
              
              {/* Model Selector Tabs */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveModelTab('claude')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      activeModelTab === 'claude'
                        ? 'bg-[#6C5CE7] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Claude 3.7 (Anthropic)
                  </button>

                  <button
                    onClick={() => setActiveModelTab('chatgpt')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      activeModelTab === 'chatgpt'
                        ? 'bg-[#6C5CE7] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    ChatGPT o3 (OpenAI)
                  </button>

                  <button
                    onClick={() => setActiveModelTab('gemini')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      activeModelTab === 'gemini'
                        ? 'bg-[#6C5CE7] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Gemini 2.5 (Google)
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Memory Injected</span>
                </div>
              </div>

              {/* Chat Simulation Display */}
              <div className="p-6 space-y-6 min-h-[380px] flex flex-col justify-between">
                
                {/* User Prompt */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] shrink-0">
                    You
                  </div>
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl rounded-tl-sm p-4 text-sm text-[var(--text-primary)] max-w-xl space-y-1">
                    <p className="font-medium">"Write a quick snippet for my project."</p>
                    <p className="text-xs text-[var(--text-muted)] italic">
                      (Notice: You did not mention your tech stack, dark mode, or styling preferences.)
                    </p>
                  </div>
                </div>

                {/* AI Assistant Context Retrieval Banner */}
                <div className="my-2 p-3 rounded-xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center gap-3 text-xs text-[#8F82FF]">
                  <Brain className="w-4 h-4 shrink-0 text-[#6C5CE7]" />
                  <div className="flex-1">
                    <span className="font-semibold text-[var(--text-primary)]">MemoryLayer Hook Injected 3 context items:</span>{' '}
                    <span className="text-[var(--text-secondary)]">
                      [Tech Stack: React 19 + TS] [Theme: Dark mode] [Project: AI Memory Layer]
                    </span>
                  </div>
                  <Badge color="indigo" variant="subtle">0.4ms</Badge>
                </div>

                {/* Simulated Model Response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                    {activeModelTab === 'claude' ? 'C' : activeModelTab === 'chatgpt' ? 'G' : 'G2'}
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl rounded-tr-sm p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-[var(--border)] pb-2 font-mono">
                        <span>
                          {activeModelTab === 'claude' && 'Claude 3.7 Sonnet'}
                          {activeModelTab === 'chatgpt' && 'ChatGPT o3-mini'}
                          {activeModelTab === 'gemini' && 'Gemini 2.5 Flash'}
                        </span>
                        <span className="text-emerald-400">Context Auto-Matched</span>
                      </div>

                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                        {activeModelTab === 'claude' && (
                          <>I see from your <strong>MemoryLayer vault</strong> that you are building the <strong>AI Memory Layer</strong> SaaS in React 19, TypeScript, and Tailwind CSS with a dark mode theme and Fraunces serif headlines. Here is the component structure aligned with your conventions:</>
                        )}
                        {activeModelTab === 'chatgpt' && (
                          <>Using your active <strong>MemoryLayer preferences</strong> (React 19, TypeScript, dark mode theme with #6C5CE7 indigo accents), here is your tailored component setup:</>
                        )}
                        {activeModelTab === 'gemini' && (
                          <>Retrieved 3 memory anchors from <strong>MemoryLayer</strong>. Applying your React 19 + TS + Tailwind v4 project settings:</>
                        )}
                      </p>

                      <div className="p-3 rounded-lg bg-[var(--bg-main)] font-mono text-xs text-[var(--text-primary)] border border-[var(--border)] overflow-x-auto space-y-1">
                        <div className="text-[var(--text-muted)]">// Auto-configured for React 19 + TS</div>
                        <div><span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-emerald-300">'react'</span>;</div>
                        <div><span className="text-purple-400">export const</span> <span className="text-amber-300">HeaderComponent</span> = () =&gt; (</div>
                        <div className="pl-4">&lt;<span className="text-[#8F82FF]">div</span> className=<span className="text-emerald-300">"dark font-serif-display text-[var(--text-primary)]"</span>&gt;</div>
                        <div className="pl-8">MemoryLayer Synced</div>
                        <div className="pl-4">&lt;/<span className="text-[#8F82FF]">div</span>&gt;</div>
                        <div>);</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom footer bar */}
              <div className="bg-[var(--bg-secondary)] border-t border-[var(--border)] px-6 py-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  No model training on your memory data
                </span>
                <span className="font-mono text-[11px]">Memory Hash: 0x9f82...3a1c</span>
              </div>

            </Card>
          </div>

        </div>
      </section>

      {/* FEATURE CARDS GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge color="indigo" variant="subtle">Core Features</Badge>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)]">
            Designed for developers who work across multiple AI tools
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            A single source of truth for your coding style, architectural guidelines, brand rules, and personal background.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hoverGlow className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 flex items-center justify-center text-[#8F82FF]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Cross-Platform Sync
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Sync context automatically between Claude, ChatGPT, Gemini, Cursor, Copilot, and custom agent workflows without copying and pasting prompt files.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Badge color="indigo">Claude</Badge>
              <Badge color="emerald">ChatGPT</Badge>
              <Badge color="sky">Gemini</Badge>
            </div>
          </Card>

          <Card hoverGlow className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Zero-Knowledge Vault
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Your memory is encrypted with client-side keys before hitting storage. Neither MemoryLayer nor the AI model providers can read or train on your vault.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Badge color="emerald">AES-256 GCM</Badge>
              <Badge color="neutral">Local First</Badge>
            </div>
          </Card>

          <Card hoverGlow className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Intelligent Context Pruning
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Don't waste token windows. MemoryLayer extracts and sends only the exact relevant memory snippets matching your active query in &lt;12ms.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Badge color="violet">Token Saver</Badge>
              <Badge color="amber">Vector Graph</Badge>
            </div>
          </Card>

          <Card hoverGlow className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Developer CLI & SDK
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Integrate MemoryLayer directly into your terminal, CI pipelines, or custom AI apps using simple Node, Python, or Go SDKs.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Badge color="sky">npm / pip</Badge>
              <Badge color="neutral">REST & gRPC</Badge>
            </div>
          </Card>

          <Card hoverGlow className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Scoped Memory Rules
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Define global preferences (e.g. "always use TypeScript") alongside project-specific rules that automatically activate when you open that repository.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Badge color="amber">Global Scope</Badge>
              <Badge color="indigo">Repo Scope</Badge>
            </div>
          </Card>

          <Card hoverGlow className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Browser & Extension Hooks
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Our Chrome extension injects memory seamlessly into ChatGPT Web, Claude.ai, and Google Gemini Web interfaces without breaking native UI.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Badge color="indigo">Chrome / Firefox</Badge>
              <Badge color="emerald">Native Injection</Badge>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge color="emerald" variant="subtle">3-Step Integration</Badge>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            How MemoryLayer Works
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Set it up once in 60 seconds and never repeat yourself to an AI again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <Card className="relative space-y-4 border-[var(--border)] bg-[var(--card-bg)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-3xl font-bold text-[#6C5CE7]">01</span>
              <Badge color="indigo">Setup</Badge>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Install Extension or SDK
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Download the browser extension or add <code className="text-[#8F82FF] font-mono text-xs bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">@memory-layer/sdk</code> to your development environment.
            </p>
          </Card>

          <Card className="relative space-y-4 border-[var(--border)] bg-[var(--card-bg)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-3xl font-bold text-[#6C5CE7]">02</span>
              <Badge color="violet">Vault</Badge>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Store Your Key Context
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Add your tech stack, coding conventions, architectural decisions, and preferences to your encrypted master vault.
            </p>
          </Card>

          <Card className="relative space-y-4 border-[#6C5CE7]/30 bg-[var(--card-bg)] memory-glow">
            <div className="flex items-center justify-between">
              <span className="font-mono text-3xl font-bold text-[#6C5CE7]">03</span>
              <Badge color="emerald">Magic</Badge>
            </div>
            <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
              Automatic Context Recall
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Whenever you prompt Claude, ChatGPT, or Gemini, MemoryLayer automatically attaches relevant memory snippets in real time.
            </p>
          </Card>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--card-bg)] to-[var(--bg-secondary)] border-[#6C5CE7]/30 p-10 sm:p-16 text-center space-y-6 memory-glow relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#6C5CE7]/15 rounded-full blur-3xl pointer-events-none" />
          
          <Badge color="indigo" variant="subtle" className="mx-auto">
            Early Access Beta
          </Badge>

          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)] max-w-2xl mx-auto leading-tight">
            Stop giving your AI models amnesia.
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Join thousands of developers using MemoryLayer to bring unified, zero-knowledge memory context to Claude, ChatGPT, and Gemini.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Get Started for Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Read Security Whitepaper
            </Button>
          </div>
        </Card>
      </section>

    </div>
  );
};

export default Landing;
