
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ambulanceService, AmbulanceVehicle } from '@/services/AmbulanceTrackingService';
import type { MapLocation } from '@/components/MapboxMap';

// Hook for tracking ambulances in real-time
export function useAmbulanceTracking(trackingEnabled = true) {
  const [ambulances, setAmbulances] = useState<AmbulanceVehicle[]>([]);
  const [isTracking, setIsTracking] = useState(trackingEnabled);
  const [userLocation, setUserLocation] = useState<{ longitude: number, latitude: number }>({
    longitude: -74.0060, 
    latitude: 40.7128
  });
  
  // Set user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          };
          setUserLocation(newLocation);
          ambulanceService.setUserLocation(newLocation);
        },
        () => {
          toast.error("Could not get your precise location. Using default.");
        }
      );
    }
  }, []);
  
  // Start tracking when component mounts
  useEffect(() => {
    if (isTracking) {
      // Start the ambulance service simulation
      ambulanceService.startTracking();
      
      // Subscribe to updates
      const unsubscribe = ambulanceService.subscribe((updatedAmbulances) => {
        setAmbulances(updatedAmbulances);
      });
      
      return () => {
        unsubscribe();
        // Only stop tracking when unmounting if we started it
        ambulanceService.stopTracking();
      };
    }
  }, [isTracking]);
  
  // Convert ambulances to map locations
  const ambulanceLocations: MapLocation[] = ambulanceService.getAmbulanceLocations();
  
  const toggleTracking = () => {
    setIsTracking(prev => !prev);
    if (!isTracking) {
      ambulanceService.startTracking();
    } else {
      ambulanceService.stopTracking();
    }
  };
  
  const dispatchAmbulanceToLocation = (reportId: string, destination: { 
    latitude: number, 
    longitude: number, 
    address?: string 
  }) => {
    return ambulanceService.dispatchAmbulance(reportId, destination);
  };
  
  // Get the currently active ambulance (for route display)
  const getActiveAmbulance = () => {
    return ambulanceService.getActiveAmbulance();
  };
  
  return {
    ambulances,
    ambulanceLocations,
    isTracking,
    toggleTracking,
    dispatchAmbulanceToLocation,
    userLocation,
    getActiveAmbulance
  };
}

export default useAmbulanceTracking;
