
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface Location {
  id: string;
  lat: number;
  lng: number;
  type: 'accident' | 'ambulance' | 'hospital' | 'user' | 'police' | 'fire';
  status?: 'enroute' | 'arrived' | 'waiting' | 'dispatched' | 'completed';
  name?: string;
}

interface MapViewProps {
  className?: string;
  locations?: Location[];
  centerLocation?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
  lazy?: boolean;
}

// Default Google Maps API key - users can provide their own
const GOOGLE_MAPS_API_KEY = '';

const MapView: React.FC<MapViewProps> = ({ 
  className, 
  locations = [], 
  centerLocation = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  interactive = true,
  lazy = false 
}) => {
  const [userApiKey, setUserApiKey] = useState<string>(GOOGLE_MAPS_API_KEY);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(!GOOGLE_MAPS_API_KEY);
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: userApiKey,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Fit bounds to include all markers
  useEffect(() => {
    if (mapRef.current && locations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend(new google.maps.LatLng(location.lat, location.lng));
      });
      mapRef.current.fitBounds(bounds, 50); // 50px padding
    }
  }, [locations, isLoaded]);

  // Get marker icon based on location type
  const getMarkerIcon = (locationType: string, status?: string) => {
    const isActive = status === 'enroute' || status === 'dispatched';
    
    // Define SVG icons and colors based on type
    let fillColor = '#3B82F6'; // Default blue
    let icon = null;
    
    switch (locationType) {
      case 'accident':
        fillColor = '#EF4444'; // Red
        break;
      case 'ambulance':
        fillColor = '#3B82F6'; // Blue
        break;
      case 'hospital':
        fillColor = '#10B981'; // Green
        break;
      case 'police':
        fillColor = '#4F46E5'; // Indigo
        break;
      case 'fire':
        fillColor = '#F59E0B'; // Amber
        break;
      case 'user':
        fillColor = '#8B5CF6'; // Purple
        break;
      default:
        fillColor = '#3B82F6'; // Blue
    }
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: fillColor,
      fillOpacity: 0.9,
      strokeWeight: 1.5,
      strokeColor: 'white',
      scale: 9,
      labelOrigin: new google.maps.Point(0, -2)
    };
  };

  // Handle click on marker
  const handleMarkerClick = (location: Location) => {
    setSelectedMarker(location);
  };

  // Close info window
  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  // If API key is set but map not loaded yet
  const renderLoadingState = () => (
    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm">Loading map...</span>
      </div>
    </div>
  );

  // If API key input is required
  const renderApiKeyInput = () => (
    <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center p-4 text-center">
      <p className="text-sm mb-2">Enter your Google Maps API key:</p>
      <input 
        type="text" 
        value={userApiKey} 
        onChange={(e) => setUserApiKey(e.target.value)}
        className="w-full p-2 border rounded mb-2 text-xs"
        placeholder="Your Google Maps API key..."
      />
      <button 
        onClick={() => setShowApiKeyInput(false)} 
        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
      >
        Set API Key
      </button>
      <a 
        href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-blue-500 mt-2"
      >
        Get a free API key from Google
      </a>
    </div>
  );

  // If lazy loading is enabled and map is not yet in view
  const renderLazyLoadingState = () => (
    <div className="absolute inset-0 bg-muted flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Map will load when scrolled into view</div>
    </div>
  );

  return (
    <div className={cn('w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden', className)} ref={mapContainerRef}>
      {showApiKeyInput && renderApiKeyInput()}
      
      {shouldInitialize && !showApiKeyInput && (
        <>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{
                width: '100%',
                height: '100%'
              }}
              center={centerLocation}
              zoom={zoom}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: !interactive,
                scrollwheel: interactive,
                zoomControl: interactive,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: interactive,
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                  }
                ]
              }}
            >
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  icon={getMarkerIcon(location.type, location.status)}
                  onClick={() => handleMarkerClick(location)}
                  animation={google.maps.Animation.DROP}
                  title={location.name || location.type}
                />
              ))}
              
              {selectedMarker && (
                <InfoWindow
                  position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                  onCloseClick={handleInfoWindowClose}
                >
                  <div className="p-1">
                    <strong>{selectedMarker.name || selectedMarker.type}</strong>
                    {selectedMarker.status && (
                      <div className="text-xs mt-1">Status: {selectedMarker.status}</div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : renderLoadingState()}
        </>
      )}
      
      {!shouldInitialize && lazy && renderLazyLoadingState()}
    </div>
  );
};

export default MapView;
