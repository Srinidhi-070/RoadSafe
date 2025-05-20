
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Eye, EyeOff, Locate } from 'lucide-react';
import MapboxMap, { MapLocation } from '@/components/MapboxMap';
import { useAmbulanceTracking } from '@/services/AmbulanceTrackingService';
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
  
  // Get current location
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
        { timeout: 3000, enableHighAccuracy: false }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };
  
  // Update map locations when reportLocation, ambulances, or user location changes
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
  
  // Determine if route should be displayed
  const shouldShowRoute = isTracking && activeAmbulance && (
    activeAmbulance.status === 'enroute' || activeAmbulance.status === 'dispatched'
  );
  
  // Get route start and end points
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
    <div className={cn("relative w-full h-64", className)}>
      <MapboxMap 
        className={cn("w-full h-full rounded-lg overflow-hidden border", 
          isLoadingMap ? 'animate-pulse' : ''
        )}
        locations={mapLocations}
        centerLocation={getCenterLocation()}
        zoom={zoom}
        interactive={interactive}
        showRoute={shouldShowRoute}
        routeStart={start}
        routeEnd={end}
        onMapLoad={handleMapLoad}
      />
      
      {showControls && (
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={toggleTracking}
            className={cn(
              "p-2 rounded-full shadow-md transition-colors bg-background/90",
              isTracking ? "text-success" : "text-muted-foreground"
            )}
            title={isTracking ? "Turn off live tracking" : "Turn on live tracking"}
          >
            {isTracking ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
          
          <button
            onClick={handleGetCurrentLocation}
            className="p-2 rounded-full bg-background/90 shadow-md text-primary hover:text-primary/80 transition-colors"
            title="Get current location"
          >
            <Locate className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {isTracking && ambulanceLocations.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-background/90 text-xs px-2 py-1 rounded shadow-md flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
          <span className="text-foreground">
            Live Tracking 
            {activeAmbulance && activeAmbulance.eta > 0 && (
              <span className="ml-1 font-medium">
                (ETA: {activeAmbulance.eta} min)
              </span>
            )}
          </span>
        </div>
      )}
      
      {reportLocation?.address && (
        <div className="absolute bottom-2 right-2 max-w-[70%] bg-background/90 text-xs px-2 py-1 rounded shadow-md flex items-center">
          <MapPin className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
          <span className="text-foreground truncate">{reportLocation.address}</span>
        </div>
      )}
    </div>
  );
};

export default AmbulanceMap;
