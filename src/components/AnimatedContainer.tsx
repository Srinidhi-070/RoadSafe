
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: 'fade-in' | 'slide-in-right' | 'slide-in-left' | 'scale-in';
  delay?: number;
  className?: string;
}

const AnimatedContainer = ({
  children,
  animation = 'fade-in',
  delay = 0,
  className,
}: AnimatedContainerProps) => {
  return (
    <div
      className={cn(`animate-${animation}`, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
