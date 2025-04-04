
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
  colorClass?: string;
}

const ActionCard = ({
  title,
  description,
  icon,
  onClick,
  variant = 'default',
  className,
  colorClass,
}: ActionCardProps) => {
  // Predefined gradient classes for colorful cards
  const gradientClasses = {
    red: 'bg-gradient-to-r from-red-500/90 to-orange-400/80 text-white',
    blue: 'bg-gradient-to-r from-blue-500/90 to-cyan-400/80 text-white',
    green: 'bg-gradient-to-r from-green-500/90 to-emerald-400/80 text-white',
    purple: 'bg-gradient-to-r from-purple-500/90 to-indigo-400/80 text-white',
    yellow: 'bg-gradient-to-r from-yellow-500/90 to-amber-400/80 text-white',
    pink: 'bg-gradient-to-r from-pink-500/90 to-rose-400/80 text-white',
    teal: 'bg-gradient-to-r from-teal-500/90 to-green-400/80 text-white',
    peach: 'bg-gradient-to-r from-orange-300/90 to-orange-200/80 text-gray-800',
    white: 'bg-white/10 text-white backdrop-filter backdrop-blur-lg border border-white/20',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 card-hover border-none shadow-md',
        variant === 'default' && (colorClass ? gradientClasses[colorClass as keyof typeof gradientClasses] : 'bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground'),
        variant === 'outline' && 'bg-gray-800/50 text-white border border-white/10 backdrop-blur-sm',
        variant === 'emergency' && 'bg-gradient-to-r from-emergency/90 to-emergency/70 text-emergency-foreground',
        className
      )}
    >
      <div className={cn(
        'p-3 rounded-full flex-shrink-0',
        variant === 'default' && 'bg-white/30 text-white',
        variant === 'outline' && 'bg-white/10 text-white',
        variant === 'emergency' && 'bg-white/30 text-white',
      )}>
        {icon}
      </div>
      <div className="text-center">
        <h3 className="font-medium text-lg">{title}</h3>
        {description && (
          <p className="text-xs opacity-80 mt-1">{description}</p>
        )}
      </div>
    </button>
  );
};

export default ActionCard;
