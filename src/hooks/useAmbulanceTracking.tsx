
import { useState, useEffect } from 'react';
import { ambulanceService, AmbulanceVehicle } from '@/services/AmbulanceTrackingService';
import { Location } from '@/components/MapView';

// Hook for tracking ambulances in real-time
export function useAmbulanceTracking(trackingEnabled = true) {
  const [ambulances, setAmbulances] = useState<AmbulanceVehicle[]>([]);
  const [isTracking, setIsTracking] = useState(trackingEnabled);
  
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
  const ambulanceLocations: Location[] = ambulances.map(ambulance => ({
    id: ambulance.id,
    lat: ambulance.lat,
    lng: ambulance.lng,
    type: 'ambulance',
    status: ambulance.status,
    name: `Ambulance ${ambulance.callSign} ${ambulance.speed > 0 ? `(${Math.round(ambulance.speed)} km/h)` : ''}`
  }));
  
  const toggleTracking = () => {
    setIsTracking(prev => !prev);
  };
  
  const dispatchAmbulanceToLocation = (reportId: string, destination: { lat: number, lng: number, address?: string }) => {
    return ambulanceService.dispatchAmbulance(reportId, destination);
  };
  
  return {
    ambulances,
    ambulanceLocations,
    isTracking,
    toggleTracking,
    dispatchAmbulanceToLocation
  };
}
