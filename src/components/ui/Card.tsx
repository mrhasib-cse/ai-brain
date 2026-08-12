import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hoverGlow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-[var(--card-bg)] text-[var(--text-primary)] rounded-2xl p-6 border border-[var(--border)] transition-all duration-300 shadow-sm',
          hoverGlow && 'hover:border-[#6C5CE7]/40 hover:shadow-lg hover:shadow-[#6C5CE7]/10 hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
