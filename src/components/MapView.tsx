
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { cn } from '@/lib/utils';

// Import refactored components
import GoogleMapContainer from './map/GoogleMapContainer';
import ApiKeyInput from './map/ApiKeyInput';
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
  apiKey?: string; // Optional prop for API key
}

const MapView: React.FC<MapViewProps> = ({ 
  className, 
  locations = [], 
  centerLocation = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  interactive = true,
  lazy = false,
  apiKey = '' // Default to empty string
}) => {
  const [userApiKey, setUserApiKey] = useState<string>(apiKey);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(!apiKey);
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [shouldInitialize, setShouldInitialize] = useState(!lazy);
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

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: userApiKey,
  });

  // Handle API key change
  const handleApiKeyChange = useCallback((newKey: string) => {
    setUserApiKey(newKey);
  }, []);

  // Handle API key submission
  const handleApiKeySubmit = useCallback(() => {
    setShowApiKeyInput(false);
  }, []);

  return (
    <div className={cn('w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden', className)} ref={mapContainerRef}>
      {showApiKeyInput && (
        <ApiKeyInput
          userApiKey={userApiKey}
          onApiKeyChange={handleApiKeyChange}
          onSubmit={handleApiKeySubmit}
        />
      )}
      
      {shouldInitialize && !showApiKeyInput && (
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
      
      {!shouldInitialize && lazy && <LazyLoadingState />}
    </div>
  );
};

export default MapView;
