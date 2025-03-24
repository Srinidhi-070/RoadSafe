
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
        'w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 card-hover border',
        variant === 'default' && 'bg-card text-card-foreground border-border',
        variant === 'outline' && 'bg-background/50 text-foreground border-primary/30',
        variant === 'emergency' && 'bg-emergency/10 text-emergency border-emergency/30',
        className
      )}
    >
      <div className={cn(
        'p-3 rounded-full flex-shrink-0',
        variant === 'default' && 'bg-primary/10 text-primary',
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
