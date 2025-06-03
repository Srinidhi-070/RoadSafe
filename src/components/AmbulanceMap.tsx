
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Eye, EyeOff, Locate } from 'lucide-react';
import MapboxMap, { MapLocation } from '@/components/MapboxMap';
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
  showControls = true,
  interactive = true,
  zoom = 14,
}) => {
  const { 
    ambulanceLocations, 
    isTracking, 
    toggleTracking, 
    userLocation,
    getActiveAmbulance
  } = useAmbulanceTracking();
  
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  
  // Handle map load
  const handleMapLoad = useCallback(() => {
    setIsLoadingMap(false);
  }, []);
  
  // Get current location with high accuracy for mobile
  const handleGetCurrentLocation = () => {
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
  };
  
  // Update map locations
  useEffect(() => {
    const newLocations: MapLocation[] = [];
    
    // Add report location if available
    if (reportLocation) {
      newLocations.push({
        id: 'accident',
        latitude: reportLocation.lat,
        longitude: reportLocation.lng,
        type: 'accident',
        name: 'Accident Location'
      });
    }
    
    // Add user location if available
    if (userLocation) {
      newLocations.push({
        id: 'user',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        type: 'user',
        name: 'Your Location'
      });
    }
    
    // Add ambulance locations if tracking is enabled
    if (showTracking && isTracking) {
      setMapLocations([...newLocations, ...ambulanceLocations]);
    } else {
      setMapLocations(newLocations);
    }
  }, [reportLocation, ambulanceLocations, isTracking, userLocation, showTracking]);
  
  // Get active ambulance for route display
  const activeAmbulance = getActiveAmbulance();
  
  // Determine center location for the map
  const getCenterLocation = () => {
    if (reportLocation) {
      return { longitude: reportLocation.lng, latitude: reportLocation.lat };
    }
    if (activeAmbulance) {
      return { longitude: activeAmbulance.longitude, latitude: activeAmbulance.latitude };
    }
    return userLocation;
  };
  
  // Show route for active ambulances
  const shouldShowRoute = isTracking && activeAmbulance && (
    activeAmbulance.status === 'enroute' || activeAmbulance.status === 'dispatched'
  );
  
  const getRoutePoints = () => {
    if (!activeAmbulance) return { start: null, end: null };
    
    const start = {
      longitude: activeAmbulance.longitude,
      latitude: activeAmbulance.latitude
    };
    
    const end = reportLocation 
      ? { longitude: reportLocation.lng, latitude: reportLocation.lat }
      : userLocation;
      
    return { start, end };
  };
  
  const { start, end } = getRoutePoints();
  
  return (
    <div className={cn("relative w-full h-full", className)}>
      <MapboxMap 
        className="w-full h-full border-none"
        locations={mapLocations}
        centerLocation={getCenterLocation()}
        zoom={zoom}
        interactive={interactive}
        showRoute={shouldShowRoute}
        routeStart={start}
        routeEnd={end}
        onMapLoad={handleMapLoad}
        darkMode={true}
      />
      
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col space-y-3">
          <button
            onClick={toggleTracking}
            className={cn(
              "p-3 rounded-full shadow-xl backdrop-blur-sm transition-all duration-200 transform hover:scale-110",
              isTracking 
                ? "bg-green-500/90 text-white" 
                : "bg-white/90 text-gray-600 hover:bg-white"
            )}
            aria-label={isTracking ? "Turn off live tracking" : "Turn on live tracking"}
          >
            {isTracking ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={handleGetCurrentLocation}
            className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-xl text-gray-600 hover:bg-white hover:shadow-2xl transition-all duration-200 transform hover:scale-110"
            aria-label="Get current location"
          >
            <Locate className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {reportLocation?.address && (
        <div className="absolute bottom-4 right-4 max-w-[70%] bg-white/90 backdrop-blur-sm text-sm px-3 py-2 rounded-full shadow-lg flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-600 flex-shrink-0" />
          <span className="text-gray-800 truncate font-medium">{reportLocation.address}</span>
        </div>
      )}
    </div>
  );
};

export default AmbulanceMap;
