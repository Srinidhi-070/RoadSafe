import { toast } from 'sonner';
import { mapService } from './MapService';
import type { Location } from '@/components/MapView';

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
  // Bangalore center coordinates
  private userLocation: { longitude: number, latitude: number } = { longitude: 77.5946, latitude: 12.9716 };
  private targetLocation: { longitude: number, latitude: number } | null = null;

  constructor() {
    // Initialize with Bangalore ambulances
    this.createBangaloreAmbulances();
  }

  private createBangaloreAmbulances() {
    const { longitude, latitude } = this.userLocation;
    this.ambulances = [
      {
        id: 'amb-ka-01',
        callSign: 'KA-01-108',
        longitude: longitude + 0.015,
        latitude: latitude + 0.008,
        status: 'enroute',
        speed: 35, // Adjusted for Bangalore traffic
        distance: 1.2,
        eta: 4
      },
      {
        id: 'amb-ka-02',
        callSign: 'KA-02-108',
        longitude: longitude - 0.02,
        latitude: latitude - 0.015,
        status: 'waiting',
        speed: 0,
        distance: 2.1,
        eta: 6
      },
      {
        id: 'amb-ka-03',
        callSign: 'KA-03-108',
        longitude: longitude + 0.04,
        latitude: latitude - 0.03,
        status: 'dispatched',
        speed: 25, // Slower due to traffic
        distance: 3.8,
        eta: 9
      },
      {
        id: 'amb-manipal',
        callSign: 'Manipal-AMB',
        longitude: 77.7499,
        latitude: 12.9698,
        status: 'waiting',
        speed: 0,
        distance: 5.2,
        eta: 12
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
      
      // Update ETA based on distance and speed (accounting for Bangalore traffic)
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
    }, 3000); // Slightly slower updates for realism
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
      
      // Moving ambulances should get closer to the target (slower in Bangalore traffic)
      const moveFactor = ambulance.status === 'enroute' ? 0.0003 : 0.0001; // Slower movement
      
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
      
      // Update speed - accounting for Bangalore traffic conditions
      const newSpeed = newStatus === 'arrived' 
        ? 0
        : ambulance.status === 'enroute'
          ? Math.max(8, 35 - (1.2 - newDistance) * 25) // Lower max speed due to traffic
          : 15;
      
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
        speed: 15, // Starting speed in Bangalore traffic
        // Calculate initial distance
        distance: this.calculateDistance(
          availableAmbulance.longitude,
          availableAmbulance.latitude,
          destination.longitude,
          destination.latitude
        )
      };
      
      // Calculate initial ETA (accounting for traffic)
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
            ? { ...a, status: 'enroute', speed: 35 } 
            : a
        );
        this.notifySubscribers();
      }, 8000); // Longer dispatch time
      
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

  getAmbulanceLocations(): Location[] {
    return this.ambulances.map(ambulance => ({
      id: ambulance.id,
      lat: ambulance.latitude,
      lng: ambulance.longitude,
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
