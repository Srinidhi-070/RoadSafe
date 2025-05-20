import { toast } from 'sonner';
import type { MapLocation } from '@/components/MapboxMap';
import { mapService } from './MapService';

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

class AmbulanceTrackingService {
  private ambulances: AmbulanceVehicle[] = [];
  private isTracking: boolean = false;
  private interval: NodeJS.Timeout | null = null;
  private subscribers: ((ambulances: AmbulanceVehicle[]) => void)[] = [];
  private userLocation: { longitude: number, latitude: number } = { longitude: -74.0060, latitude: 40.7128 };
  private targetLocation: { longitude: number, latitude: number } | null = null;

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

  setTargetLocation(location: { longitude: number, latitude: number } | null) {
    this.targetLocation = location;
    // Recalculate routes if target location changes
    if (location) {
      this.updateDistances();
    }
  }

  private updateDistances() {
    this.ambulances = this.ambulances.map(ambulance => {
      // Determine which location to calculate distance to
      const targetLoc = this.targetLocation || this.userLocation;
      
      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(
        ambulance.longitude, 
        ambulance.latitude,
        targetLoc.longitude,
        targetLoc.latitude
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
    // Haversine formula for more accurate distance calculation
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI/180);
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
      
      // Use target location if available, otherwise use user location
      const targetLoc = this.targetLocation || this.userLocation;
      
      // Moving ambulances should get closer to the target
      const moveFactor = ambulance.status === 'enroute' ? 0.0005 : 0.0002;
      
      // Update coordinates to move toward target
      const newLongitude = ambulance.longitude + (targetLoc.longitude - ambulance.longitude) * moveFactor;
      const newLatitude = ambulance.latitude + (targetLoc.latitude - ambulance.latitude) * moveFactor;
      
      // Calculate new distance
      const newDistance = this.calculateDistance(
        newLongitude,
        newLatitude,
        targetLoc.longitude,
        targetLoc.latitude
      );
      
      // If very close to destination and enroute, mark as arrived
      const newStatus = ambulance.status === 'enroute' && newDistance < 0.1
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

  dispatchAmbulance(reportId: string, destination: { longitude: number; latitude: number; address?: string }) {
    // Find an available ambulance
    const availableAmbulance = this.ambulances.find(a => a.status === 'waiting');
    
    if (availableAmbulance) {
      // Set the target location
      this.setTargetLocation(destination);
      
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
      
      // Calculate initial ETA
      updatedAmbulance.eta = updatedAmbulance.speed > 0 
        ? Math.ceil((updatedAmbulance.distance / updatedAmbulance.speed) * 60) 
        : 999;
      
      // Update the ambulance
      this.ambulances = this.ambulances.map(a => 
        a.id === updatedAmbulance.id ? updatedAmbulance : a
      );
      
      // After a short delay, change to enroute
      setTimeout(() => {
        this.ambulances = this.ambulances.map(a => 
          a.id === updatedAmbulance.id 
            ? { ...a, status: 'enroute', speed: 45 } 
            : a
        );
        this.notifySubscribers();
      }, 5000);
      
      // Notify subscribers
      this.notifySubscribers();
      
      // Start tracking if not already tracking
      if (!this.isTracking) {
        this.startTracking();
      }
      
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
      distance: ambulance.distance * 1000, // convert to meters for consistency
      eta: ambulance.eta
    }));
  }

  getActiveAmbulance(): AmbulanceVehicle | null {
    // Return the first en-route or dispatched ambulance
    return this.ambulances.find(a => a.status === 'enroute' || a.status === 'dispatched') || null;
  }

  getNearestAmbulance(): AmbulanceVehicle | null {
    // Get available ambulances
    const availableAmbulances = this.ambulances.filter(a => a.status === 'waiting');
    
    if (availableAmbulances.length === 0) {
      return null;
    }
    
    // Sort by distance and return the nearest
    return [...availableAmbulances].sort((a, b) => a.distance - b.distance)[0];
  }
}

// Singleton instance
export const ambulanceService = new AmbulanceTrackingService();

// Helper functions for calculations
export { mapService };
