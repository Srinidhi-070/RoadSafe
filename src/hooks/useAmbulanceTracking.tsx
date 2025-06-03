
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ambulanceService, AmbulanceVehicle } from '@/services/AmbulanceTrackingService';
import type { MapLocation } from '@/components/MapboxMap';

// Hook for tracking ambulances in real-time in Bangalore
export function useAmbulanceTracking(trackingEnabled = true) {
  const [ambulances, setAmbulances] = useState<AmbulanceVehicle[]>([]);
  const [isTracking, setIsTracking] = useState(trackingEnabled);
  // Default to Bangalore coordinates (MG Road area)
  const [userLocation, setUserLocation] = useState<{ longitude: number, latitude: number }>({
    longitude: 77.5946, 
    latitude: 12.9716
  });
  
  // Set user location with Bangalore as fallback
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
          toast.error("Could not get your precise location. Using Bangalore city center.");
          // Use Bangalore coordinates as fallback
          const bangaloreLocation = { longitude: 77.5946, latitude: 12.9716 };
          ambulanceService.setUserLocation(bangaloreLocation);
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
