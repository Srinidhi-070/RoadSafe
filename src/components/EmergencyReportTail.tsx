
import React from 'react';
import { LucideIcon, AlertTriangle, MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

interface EmergencyReportProps {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'critical' | 'minor' | 'moderate' | 'severe';
  location: {
    address?: string;
    lat: number;
    lng: number;
  };
  timestamp: Date;
  icon?: LucideIcon;
  className?: string;
}

const EmergencyReportTail: React.FC<EmergencyReportProps> = ({
  id,
  title,
  description,
  status,
  location,
  timestamp,
  icon: Icon = AlertTriangle,
  className,
}) => {
  const navigate = useNavigate();
  
  // Format the timestamp
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };
  
  // Navigate to report details
  const handleNavigate = () => {
    navigate(`/report/${id}`);
  };
  
  return (
    <div 
      className={cn(
        "bg-card border p-4 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-primary/30 cursor-pointer",
        className
      )}
      onClick={handleNavigate}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-destructive/10 text-destructive mr-3 flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium truncate">{title}</h3>
            <StatusBadge status={status} className="ml-2 flex-shrink-0" />
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-y-1 text-xs text-muted-foreground">
            {location.address && (
              <div className="flex items-center mr-3">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[150px]">{location.address}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTimeAgo(timestamp)}</span>
            </div>
          </div>
        </div>
        
        {/* Arrow */}
        <div className="ml-2 text-muted-foreground flex-shrink-0">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default EmergencyReportTail;
