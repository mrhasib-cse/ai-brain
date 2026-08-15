import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '@/lib/projects';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  FolderPlus, 
  Bot, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  ShieldCheck, 
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 2 form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectError, setProjectError] = useState<string | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);

  const completeOnboarding = (destination = '/dashboard') => {
    sessionStorage.setItem('onboarding_dismissed', 'true');
    navigate(destination, { replace: true });
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setProjectError('Project name is required');
      return;
    }

    setProjectError(null);
    setCreatingProject(true);

    try {
      await createProject(projectName.trim(), projectDescription.trim() || undefined);
      // Advance to step 3 after project creation
      setCurrentStep(3);
    } catch (err: any) {
      setProjectError(err.message || 'Failed to create project. You can skip this step if you prefer.');
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        
        {/* Step Indicator Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 text-[#8F82FF] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>Getting Started • Step {currentStep} of 3</span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === step
                      ? 'bg-gradient-to-br from-[#6C5CE7] to-[#8F82FF] text-white ring-4 ring-[#6C5CE7]/20 shadow-md shadow-[#6C5CE7]/30'
                      : currentStep > step
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]'
                  }`}
                >
                  {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-10 sm:w-16 h-1 rounded-full transition-all ${
                      currentStep > step ? 'bg-emerald-500/50' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME */}
        {currentStep === 1 && (
          <Card className="p-8 sm:p-10 border-[#6C5CE7]/30 bg-[var(--card-bg)] shadow-2xl memory-glow space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8F82FF] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#6C5CE7]/25">
                <Brain className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                  Welcome to MemoryLayer
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
                  Your AI memory should follow you—not the AI. The persistent shared memory layer across all your AI assistants and coding tools.
                </p>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Unified Vault</h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Store memories, preferences, and decisions in one central place.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Cross-AI Sync</h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Seamlessly connected with Claude, ChatGPT, and custom agents.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Zero Lock-In</h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Full export support and complete ownership of all stored context.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => completeOnboarding('/dashboard')}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-2"
              >
                Skip setup & go to Dashboard
              </button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: CREATE FIRST PROJECT */}
        {currentStep === 2 && (
          <Card className="p-8 sm:p-10 border-[#6C5CE7]/30 bg-[var(--card-bg)] shadow-2xl memory-glow space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    Create your first project
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    Projects organize memories for specific codebases, products, or workflows.
                  </p>
                </div>
              </div>
            </div>

            {projectError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <span>{projectError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 pt-2">
              <Input
                label="Project Name *"
                type="text"
                placeholder="e.g. My Next.js SaaS, Core Guidelines, Work Vault"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setProjectError(null);
                }}
                autoFocus
                required
                disabled={creatingProject}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all resize-none min-h-[90px]"
                  placeholder="e.g. Tech stack preferences, database schema guidelines, and active architectural rules"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={creatingProject}
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setCurrentStep(1)}
                    disabled={creatingProject}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back
                  </Button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={creatingProject}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-2 cursor-pointer"
                  >
                    Skip for now
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={creatingProject || !projectName.trim()}
                  className="w-full sm:w-auto"
                >
                  {creatingProject ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create & Continue
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* STEP 3: CONNECT AN AI */}
        {currentStep === 3 && (
          <Card className="p-8 sm:p-10 border-[#6C5CE7]/30 bg-[var(--card-bg)] shadow-2xl memory-glow space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/15 text-[#8F82FF] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    Connect an AI
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    Hook up your favorite assistant to start fetching and saving persistent memories automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Options Grid */}
            <div className="space-y-3 pt-2">
              {/* Option 1: Claude */}
              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[#6C5CE7]/40 hover:border-[#6C5CE7] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/20 text-[#8F82FF] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">Claude (Anthropic)</h3>
                      <Badge color="indigo" variant="subtle" className="text-[10px]">OAuth Ready</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      Connect via OAuth or configure the Model Context Protocol (MCP) server directly.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => completeOnboarding('/dashboard/connections')}
                  className="w-full sm:w-auto shrink-0 shadow-md shadow-[#6C5CE7]/20"
                >
                  Connect Claude
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>

              {/* Option 2: ChatGPT */}
              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] opacity-75 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">ChatGPT (OpenAI)</h3>
                      <Badge color="gray" variant="subtle" className="text-[10px]">Coming soon</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      OpenAI Custom GPT actions and plugin integration for shared cross-session context.
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" disabled className="w-full sm:w-auto shrink-0 text-xs">
                  Coming soon
                </Button>
              </div>

              {/* Option 3: Gemini */}
              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] opacity-75 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">Gemini (Google)</h3>
                      <Badge color="gray" variant="subtle" className="text-[10px]">Coming soon</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      Gemini API extensions and Workspace integration for automated memory retrieval.
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" disabled className="w-full sm:w-auto shrink-0 text-xs">
                  Coming soon
                </Button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => completeOnboarding('/dashboard')}
                className="w-full sm:w-auto"
              >
                I&apos;ll do this later
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
