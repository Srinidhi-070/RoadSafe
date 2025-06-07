
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Eye, EyeOff, Locate } from 'lucide-react';
import MapView, { Location } from '@/components/MapView';
import { useAmbulanceTracking } from '@/hooks/useAmbulanceTracking';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AmbulanceMapProps {
  className?: string;
  reportLocation?: { lat: number; lng: number; address?: string };
  showTracking?: boolean;
  showControls?: boolean;
  interactive?: boolean;
  zoom?: number;
}

const AmbulanceMap: React.FC<AmbulanceMapProps> = ({
  className,
  reportLocation,
  showTracking = true,
  showControls = false,
  interactive = true,
  zoom = 15,
}) => {
  const { 
    ambulanceLocations, 
    isTracking, 
    toggleTracking, 
    userLocation,
    getActiveAmbulance
  } = useAmbulanceTracking();
  
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  
  const handleMapLoad = useCallback(() => {
    setIsLoadingMap(false);
  }, []);
  
  const handleGetCurrentLocation = useCallback(() => {
    toast.info('Getting your current location...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success('Location updated');
        },
        () => {
          toast.error('Could not get your location');
        },
        { timeout: 5000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  }, []);
  
  // Convert ambulance tracking locations to Google Maps format
  const googleMapLocations = useMemo(() => {
    const newLocations: Location[] = [];
    
    // Add report location if available
    if (reportLocation) {
      newLocations.push({
        id: 'accident',
        lat: reportLocation.lat,
        lng: reportLocation.lng,
        type: 'accident',
        name: 'Accident Location'
      });
    }
    
    // Add user location if available
    if (userLocation) {
      newLocations.push({
        id: 'user',
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        type: 'user',
        name: 'Your Location'
      });
    }
    
    // Add ambulance locations if tracking is enabled
    if (showTracking && isTracking) {
      const ambulanceGoogleLocations: Location[] = ambulanceLocations.map(amb => ({
        id: amb.id,
        lat: amb.lat,
        lng: amb.lng,
        type: 'ambulance',
        name: amb.name,
        status: amb.status as any,
        eta: amb.eta,
        distance: amb.distance ? amb.distance * 1000 : undefined
      }));
      return [...newLocations, ...ambulanceGoogleLocations];
    }
    
    return newLocations;
  }, [reportLocation, ambulanceLocations, isTracking, userLocation, showTracking]);
  
  // Determine center location for the map
  const centerLocation = useMemo(() => {
    if (reportLocation) {
      return { lat: reportLocation.lat, lng: reportLocation.lng };
    }
    const activeAmbulance = getActiveAmbulance();
    if (activeAmbulance) {
      return { lat: activeAmbulance.latitude, lng: activeAmbulance.longitude };
    }
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    return { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore
  }, [reportLocation, getActiveAmbulance, userLocation]);
  
  return (
    <div className={cn("relative w-full h-full", className)}>
      <MapView 
        className="w-full h-full border-none"
        locations={googleMapLocations}
        centerLocation={centerLocation}
        zoom={zoom}
        interactive={interactive}
      />
      
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <button
            onClick={toggleTracking}
            className={cn(
              "p-2.5 rounded-full shadow-xl backdrop-blur-sm transition-all duration-200 active:scale-95",
              isTracking 
                ? "bg-green-500/90 text-white" 
                : "bg-white/90 text-gray-600"
            )}
            aria-label={isTracking ? "Turn off live tracking" : "Turn on live tracking"}
          >
            {isTracking ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
          
          <button
            onClick={handleGetCurrentLocation}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-xl text-gray-600 active:scale-95 transition-all duration-200"
            aria-label="Get current location"
          >
            <Locate className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {reportLocation?.address && (
        <div className="absolute bottom-4 right-4 max-w-[80%] bg-white/90 backdrop-blur-sm text-xs px-3 py-2 rounded-full shadow-lg flex items-center z-10">
          <MapPin className="h-3 w-3 mr-2 text-gray-600 flex-shrink-0" />
          <span className="text-gray-800 truncate font-medium">{reportLocation.address}</span>
        </div>
      )}
    </div>
  );
};

export default AmbulanceMap;
