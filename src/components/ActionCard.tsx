
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'emergency';
  className?: string;
}

const ActionCard = ({
  title,
  description,
  icon,
  onClick,
  variant = 'default',
  className,
}: ActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 card-hover border-none',
        variant === 'default' && 'bg-gradient-to-r from-card to-card/95 text-card-foreground shadow-md',
        variant === 'outline' && 'bg-background/50 text-foreground border-primary/30 shadow-sm',
        variant === 'emergency' && 'bg-gradient-to-r from-emergency/15 to-emergency/5 text-emergency shadow-md',
        className
      )}
    >
      <div className={cn(
        'p-3 rounded-full flex-shrink-0',
        variant === 'default' && 'bg-primary/15 text-primary',
        variant === 'outline' && 'bg-background text-primary',
        variant === 'emergency' && 'bg-emergency/20 text-emergency',
      )}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
};

export default ActionCard;
