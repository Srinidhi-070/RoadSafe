
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ambulanceService, AmbulanceVehicle } from '@/services/AmbulanceTrackingService';

// Hook for tracking ambulances in real-time in Bangalore - now using Google Maps format
export function useAmbulanceTracking(trackingEnabled = true) {
  const [ambulances, setAmbulances] = useState<AmbulanceVehicle[]>([]);
  const [isTracking, setIsTracking] = useState(trackingEnabled);
  // Default to Bangalore coordinates (MG Road area)
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number }>({
    latitude: 12.9716,
    longitude: 77.5946
  });
  
  // Set user location with Bangalore as fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(newLocation);
          // Convert to ambulance service format (longitude, latitude)
          ambulanceService.setUserLocation({
            longitude: newLocation.longitude,
            latitude: newLocation.latitude
          });
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
  
  // Convert ambulances to Google Maps compatible format
  const ambulanceLocations = ambulances.map(amb => ({
    id: amb.id,
    lat: amb.latitude,
    lng: amb.longitude,
    type: 'ambulance' as const,
    name: amb.name,
    status: amb.status,
    eta: amb.eta,
    distance: amb.distance
  }));
  
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
