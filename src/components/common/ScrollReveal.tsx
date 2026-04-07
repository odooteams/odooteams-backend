import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

type AnimationVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  duration?: number;
  delay?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  variant = 'fade-up',
  duration = 600,
  delay = 0,
  className = '',
}: ScrollRevealProps) {
  const { ref, style } = useScrollAnimation({ variant, duration, delay });

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
