import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'sky' | 'neutral' | string;
  variant?: 'subtle' | 'outline' | 'solid';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'indigo',
  variant = 'subtle',
  className,
  ...props
}) => {
  const colorMap: Record<string, { subtle: string; outline: string; solid: string }> = {
    indigo: {
      subtle: 'bg-[#6C5CE7]/15 text-[#8F82FF] border-[#6C5CE7]/30',
      outline: 'border-[#6C5CE7]/40 text-[#8F82FF] bg-transparent',
      solid: 'bg-[#6C5CE7] text-white border-transparent'
    },
    violet: {
      subtle: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      outline: 'border-purple-500/40 text-purple-300 bg-transparent',
      solid: 'bg-purple-600 text-white border-transparent'
    },
    emerald: {
      subtle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      outline: 'border-emerald-500/40 text-emerald-400 bg-transparent',
      solid: 'bg-emerald-600 text-white border-transparent'
    },
    amber: {
      subtle: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      outline: 'border-amber-500/40 text-amber-400 bg-transparent',
      solid: 'bg-amber-600 text-white border-transparent'
    },
    sky: {
      subtle: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      outline: 'border-sky-500/40 text-sky-400 bg-transparent',
      solid: 'bg-sky-600 text-white border-transparent'
    },
    neutral: {
      subtle: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)]',
      outline: 'border-[var(--border)] text-[var(--text-secondary)] bg-transparent',
      solid: 'bg-[var(--text-secondary)] text-[var(--bg-main)] border-transparent'
    }
  };

  const selectedColor = colorMap[color] || colorMap.indigo;
  const styleClasses = selectedColor[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide border transition-all whitespace-nowrap',
        styleClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
