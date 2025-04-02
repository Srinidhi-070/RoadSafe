
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading map..." 
}) => {
  return (
    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

interface LazyLoadingStateProps {
  message?: string;
}

export const LazyLoadingState: React.FC<LazyLoadingStateProps> = ({ 
  message = "Map will load when scrolled into view" 
}) => {
  return (
    <div className="absolute inset-0 bg-muted flex items-center justify-center">
      <div className="text-sm text-muted-foreground">{message}</div>
    </div>
  );
};
