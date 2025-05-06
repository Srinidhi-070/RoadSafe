
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { cn } from '@/lib/utils';

// Import refactored components
import GoogleMapContainer from './map/GoogleMapContainer';
import { LoadingState, LazyLoadingState } from './map/MapStatus';
import type { Location } from './map/MapMarker';

// Re-export Location type to maintain compatibility
export type { Location } from './map/MapMarker';

interface MapViewProps {
  className?: string;
  locations?: Location[];
  centerLocation?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
  lazy?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  className, 
  locations = [], 
  centerLocation = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  interactive = true,
  lazy = false
}) => {
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [shouldInitialize, setShouldInitialize] = useState(!lazy);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || shouldInitialize) return;
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShouldInitialize(true);
        observer.current?.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (mapContainerRef.current) {
      observer.current.observe(mapContainerRef.current);
    }
    
    return () => {
      observer.current?.disconnect();
    };
  }, [lazy, shouldInitialize]);

  // Load Google Maps API with a freely available key that only works for development
  // In production, this would be replaced with a proper API key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg', // This is a public test key with usage limits
  });

  // Handle loading error
  useEffect(() => {
    if (loadError) {
      setMapError("Failed to load Google Maps. Please try again later.");
      console.error("Google Maps loading error:", loadError);
    }
  }, [loadError]);

  return (
    <div className={cn('w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden', className)} ref={mapContainerRef}>
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
          <div className="text-center p-4">
            <p className="text-destructive mb-2">Oops! Something went wrong.</p>
            <p className="text-sm text-muted-foreground">{mapError}</p>
          </div>
        </div>
      )}
      
      {!mapError && shouldInitialize && (
        <>
          {isLoaded ? (
            <GoogleMapContainer
              locations={locations}
              centerLocation={centerLocation}
              zoom={zoom}
              interactive={interactive}
              selectedMarker={selectedMarker}
              setSelectedMarker={setSelectedMarker}
            />
          ) : <LoadingState />}
        </>
      )}
      
      {!mapError && !shouldInitialize && lazy && <LazyLoadingState />}
    </div>
  );
};

export default MapView;
