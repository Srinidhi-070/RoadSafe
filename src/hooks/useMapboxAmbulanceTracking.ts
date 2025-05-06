
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { MapLocation } from '@/components/MapboxMap';

export interface AmbulanceVehicle {
  id: string;
  callSign: string;
  longitude: number;
  latitude: number;
  status: 'enroute' | 'arrived' | 'waiting' | 'dispatched';
  speed: number; // km/h
  distance: number; // km to user
  eta: number; // minutes
}

class MapboxAmbulanceService {
  private ambulances: AmbulanceVehicle[] = [];
  private isTracking: boolean = false;
  private interval: NodeJS.Timeout | null = null;
  private subscribers: ((ambulances: AmbulanceVehicle[]) => void)[] = [];
  private userLocation: { longitude: number, latitude: number } = { longitude: -74.0060, latitude: 40.7128 };

  constructor() {
    // Initialize with some ambulances
    this.createInitialAmbulances();
  }

  private createInitialAmbulances() {
    const { longitude, latitude } = this.userLocation;
    this.ambulances = [
      {
        id: 'amb-1',
        callSign: 'Alpha-12',
        longitude: longitude + 0.015,
        latitude: latitude + 0.008,
        status: 'enroute',
        speed: 45,
        distance: 1.7,
        eta: 4
      },
      {
        id: 'amb-2',
        callSign: 'Bravo-45',
        longitude: longitude - 0.02,
        latitude: latitude - 0.015,
        status: 'waiting',
        speed: 0,
        distance: 2.5,
        eta: 8
      },
      {
        id: 'amb-3',
        callSign: 'Delta-78',
        longitude: longitude + 0.04,
        latitude: latitude - 0.03,
        status: 'dispatched',
        speed: 20,
        distance: 4.8,
        eta: 11
      }
    ];
  }

  setUserLocation(location: { longitude: number, latitude: number }) {
    this.userLocation = location;
    // Update ambulance distances based on new user location
    this.updateDistances();
  }

  private updateDistances() {
    this.ambulances = this.ambulances.map(ambulance => {
      // Calculate distance using Haversine formula (simplified for simulation)
      const distance = this.calculateDistance(
        ambulance.longitude, 
        ambulance.latitude,
        this.userLocation.longitude,
        this.userLocation.latitude
      );
      
      // Update ETA based on distance and speed
      const eta = ambulance.speed > 0 ? Math.ceil((distance / ambulance.speed) * 60) : 999;
      
      return {
        ...ambulance,
        distance,
        eta
      };
    });
  }

  private calculateDistance(
    lon1: number, 
    lat1: number, 
    lon2: number, 
    lat2: number
  ): number {
    // Simple approximation for demo purposes
    // 1 degree of latitude is approximately 111 km
    // 1 degree of longitude varies with latitude but roughly 111*cos(latitude) km
    const latDiff = Math.abs(lat1 - lat2) * 111;
    const lonDiff = Math.abs(lon1 - lon2) * Math.cos(lat1 * Math.PI / 180) * 111;
    
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  }

  subscribe(callback: (ambulances: AmbulanceVehicle[]) => void) {
    this.subscribers.push(callback);
    
    // Immediately call the callback with current ambulances
    callback(this.ambulances);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  startTracking() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    
    // Update ambulance positions periodically
    this.interval = setInterval(() => {
      this.updateAmbulancePositions();
      this.notifySubscribers();
    }, 2000);
  }

  stopTracking() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private updateAmbulancePositions() {
    this.ambulances = this.ambulances.map(ambulance => {
      if (ambulance.status === 'waiting' || ambulance.status === 'arrived') {
        return ambulance;
      }
      
      // Moving ambulances should get closer to user for enroute or dispatched
      const { longitude, latitude } = this.userLocation;
      const moveFactor = ambulance.status === 'enroute' ? 0.0003 : 0.0001;
      
      // Update coordinates to move toward user
      const newLongitude = ambulance.longitude + (longitude - ambulance.longitude) * moveFactor;
      const newLatitude = ambulance.latitude + (latitude - ambulance.latitude) * moveFactor;
      
      // Calculate new distance
      const newDistance = this.calculateDistance(
        newLongitude,
        newLatitude,
        longitude,
        latitude
      );
      
      // If very close to destination and enroute, mark as arrived
      const newStatus = ambulance.status === 'enroute' && newDistance < 0.2 
        ? 'arrived' 
        : ambulance.status;
      
      // Update speed - slowing down when approaching
      const newSpeed = newStatus === 'arrived' 
        ? 0
        : ambulance.status === 'enroute'
          ? Math.max(10, 45 - (1.7 - newDistance) * 30)
          : 20;
      
      // Calculate eta based on speed and distance
      const eta = newSpeed > 0 ? Math.ceil((newDistance / newSpeed) * 60) : 0;
      
      return {
        ...ambulance,
        longitude: newLongitude,
        latitude: newLatitude,
        status: newStatus,
        speed: newSpeed,
        distance: newDistance,
        eta
      };
    });
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.ambulances);
    });
  }

  dispatchAmbulance(reportId: string, destination: { longitude: number, latitude: number, address?: string }) {
    // Find an available ambulance
    const availableAmbulance = this.ambulances.find(a => a.status === 'waiting');
    
    if (availableAmbulance) {
      // Update the ambulance status
      const updatedAmbulance = {
        ...availableAmbulance,
        status: 'dispatched' as const,
        speed: 20,
        // Calculate initial distance
        distance: this.calculateDistance(
          availableAmbulance.longitude,
          availableAmbulance.latitude,
          destination.longitude,
          destination.latitude
        )
      };
      
      // Update the ambulance
      this.ambulances = this.ambulances.map(a => 
        a.id === updatedAmbulance.id ? updatedAmbulance : a
      );
      
      // Notify subscribers
      this.notifySubscribers();
      
      // Return the ambulance id
      return updatedAmbulance.id;
    }
    
    return null;
  }

  getAmbulanceLocations(): MapLocation[] {
    return this.ambulances.map(ambulance => ({
      id: ambulance.id,
      longitude: ambulance.longitude,
      latitude: ambulance.latitude,
      type: 'ambulance',
      name: `Ambulance ${ambulance.callSign}`,
      status: ambulance.status,
      distance: ambulance.distance
    }));
  }
}

// Singleton instance
export const mapboxAmbulanceService = new MapboxAmbulanceService();

// Hook for tracking ambulances in real-time using Mapbox
export function useMapboxAmbulanceTracking(trackingEnabled = true) {
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
          mapboxAmbulanceService.setUserLocation(newLocation);
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
      mapboxAmbulanceService.startTracking();
      
      // Subscribe to updates
      const unsubscribe = mapboxAmbulanceService.subscribe((updatedAmbulances) => {
        setAmbulances(updatedAmbulances);
      });
      
      return () => {
        unsubscribe();
        // Only stop tracking when unmounting if we started it
        mapboxAmbulanceService.stopTracking();
      };
    }
  }, [isTracking]);
  
  // Convert ambulances to map locations
  const ambulanceLocations: MapLocation[] = mapboxAmbulanceService.getAmbulanceLocations();
  
  const toggleTracking = () => {
    setIsTracking(prev => !prev);
  };
  
  const dispatchAmbulanceToLocation = (reportId: string, destination: { 
    latitude: number, 
    longitude: number, 
    address?: string 
  }) => {
    return mapboxAmbulanceService.dispatchAmbulance(reportId, destination);
  };
  
  return {
    ambulances,
    ambulanceLocations,
    isTracking,
    toggleTracking,
    dispatchAmbulanceToLocation,
    userLocation
  };
}
