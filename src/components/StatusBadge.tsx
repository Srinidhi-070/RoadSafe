
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'minor' | 'moderate' | 'severe' | 'processing' | 'completed' | 'pending' | 'responded';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'minor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'severe':
        return 'bg-emergency/20 text-emergency border-emergency/30';
      case 'processing':
        return 'bg-info/20 text-info border-info/30';
      case 'completed':
        return 'bg-success/20 text-success border-success/30';
      case 'pending':
        return 'bg-muted text-muted-foreground border-muted/30';
      case 'responded':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border-muted/30';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        getStatusStyles(status),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
