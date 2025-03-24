
import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface Location {
  id: string;
  lat: number;
  lng: number;
  type: 'accident' | 'ambulance' | 'hospital' | 'user';
  status?: 'enroute' | 'arrived' | 'waiting';
  name?: string;
}

interface MapViewProps {
  className?: string;
  locations?: Location[];
  centerLocation?: { lat: number; lng: number };
  zoom?: number;
}

const MapView = ({ className, locations = [] }: MapViewProps) => {
  // In a real implementation, this would integrate with Google Maps or another mapping service
  // For this prototype, we'll create a placeholder with some visual elements
  
  return (
    <div className={cn('w-full h-64 bg-gray-200 rounded-lg relative overflow-hidden', className)}>
      {/* Placeholder map background */}
      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1,0,0/600x400?access_token=pk.placeholder')] bg-cover bg-center opacity-50">
        {/* This would be a real map in the actual implementation */}
      </div>
      
      {/* Map overlay with glass effect */}
      <div className="absolute inset-0 glass-dark">
        <div className="absolute top-4 left-4">
          <div className="text-primary-foreground font-semibold">Live Map</div>
        </div>

        {/* Placeholder locations */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -top-3 -left-3">
              <div className="relative">
                <AlertCircle className="h-6 w-6 text-emergency" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emergency"></span>
                </span>
              </div>
            </div>
            
            <div className="absolute top-8 left-12">
              <Navigation className="h-5 w-5 text-info transform rotate-45" />
            </div>
            
            <div className="absolute top-2 -right-10">
              <MapPin className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>

        {/* Map user location indicator */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-primary rounded-full p-2 shadow-lg">
            <Navigation className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
      
      {/* Loading effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-sm text-primary-foreground bg-black/40 px-4 py-2 rounded-full">
          Loading map data...
        </div>
      </div>
    </div>
  );
};

export default MapView;
