
import React from 'react';
import { cn } from '@/lib/utils';
import { Phone, Heart, X } from 'lucide-react';

interface EmergencyContactProps {
  name: string;
  phone: string;
  relationship: string;
  onDelete?: () => void;
  onCall?: () => void;
  className?: string;
}

const EmergencyContact = ({
  name,
  phone,
  relationship,
  onDelete,
  onCall,
  className
}: EmergencyContactProps) => {
  return (
    <div className={cn('flex items-center gap-3 p-3 bg-card rounded-lg border', className)}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Heart className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{name}</h4>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="truncate">{phone}</span>
          <span className="mx-1.5">•</span>
          <span className="truncate">{relationship}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onCall && (
          <button
            onClick={onCall}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EmergencyContact;
