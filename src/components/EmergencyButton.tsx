
import React from 'react';
import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';

interface EmergencyButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}

const EmergencyButton = ({
  onClick,
  className,
  children = "Emergency",
  icon = <Phone className="h-5 w-5 mr-2" />,
  variant = 'default'
}: EmergencyButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-full px-6 py-4 font-medium transition-all duration-300 focus:outline-none',
        variant === 'default' && 'bg-emergency text-emergency-foreground pulse-emergency',
        variant === 'outline' && 'border-2 border-emergency text-emergency',
        variant === 'ghost' && 'bg-transparent text-emergency hover:bg-emergency/10',
        className
      )}
    >
      <span className="relative z-10 flex items-center">
        {icon}
        {children}
      </span>
      <span className="absolute inset-0 z-0 rounded-full overflow-hidden">
        <span className="absolute inset-0 transform transition-transform duration-300 ease-out bg-emergency/20 group-hover:bg-emergency/0"></span>
      </span>
    </button>
  );
};

export default EmergencyButton;
