
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Phone, Siren } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'lg' | 'sm';
  pulsate?: boolean;
}

const EmergencyButton = ({
  onClick,
  className,
  children = "Emergency",
  icon = <Siren className="h-6 w-6" />,
  variant = 'default',
  size = 'default',
  pulsate = true
}: EmergencyButtonProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Emergency Alert Activated",
      description: "Contacting emergency services...",
      variant: "destructive",
    });
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg',
        variant === 'default' && 'bg-gradient-to-r from-emergency to-emergency/80 text-emergency-foreground shadow-xl',
        variant === 'outline' && 'border-2 border-emergency text-emergency bg-emergency/5',
        variant === 'ghost' && 'bg-transparent text-emergency hover:bg-emergency/10',
        size === 'default' && 'w-20 h-20',
        size === 'lg' && 'w-28 h-28 text-lg',
        size === 'sm' && 'w-16 h-16 text-sm',
        pulsate && 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]',
        className
      )}
    >
      <span className="relative z-10 flex flex-col items-center justify-center">
        {icon}
        <span className="mt-1 text-xs font-bold">{children}</span>
      </span>
      
      {/* Ripple effect */}
      {variant === 'default' && (
        <>
          <span className="absolute inset-0 z-0 rounded-full overflow-hidden">
            <span className="absolute inset-0 transform transition-transform duration-300 ease-out bg-emergency/20 group-hover:bg-emergency/0"></span>
          </span>
          <span className="absolute inset-0 z-0">
            <span className="absolute inset-0 rounded-full animate-ripple bg-emergency/30"></span>
            <span className="absolute inset-0 rounded-full animate-ripple bg-emergency/20 delay-200"></span>
          </span>
        </>
      )}
    </button>
  );
};

export default EmergencyButton;
