
// Simulates real-time ambulance location updates
import { Location } from '@/components/MapView';

export interface AmbulanceVehicle {
  id: string;
  callSign: string;
  lat: number;
  lng: number;
  status: 'enroute' | 'arrived' | 'waiting' | 'dispatched' | 'completed';
  speed: number; // in km/h
  heading: number; // in degrees, 0 is north
  destination?: {
    lat: number;
    lng: number;
    address?: string;
  };
  reportId?: string;
}

class AmbulanceTrackingService {
  private ambulances: AmbulanceVehicle[] = [];
  private listeners: ((ambulances: AmbulanceVehicle[]) => void)[] = [];
  private updateInterval: number | null = null;
  
  constructor() {
    // Initialize with some mock ambulances
    this.ambulances = [
      {
        id: 'amb-1',
        callSign: 'Alpha-12',
        lat: 40.7138,
        lng: -74.0030,
        status: 'dispatched',
        speed: 0,
        heading: 0
      },
      {
        id: 'amb-2',
        callSign: 'Bravo-45',
        lat: 40.7180,
        lng: -74.0080,
        status: 'waiting',
        speed: 0,
        heading: 90
      }
    ];
  }
  
  // Start simulating ambulance movement at regular intervals
  startTracking() {
    if (this.updateInterval) return;
    
    this.updateInterval = window.setInterval(() => {
      this.updateAmbulancePositions();
    }, 1000);
  }
  
  // Stop simulating
  stopTracking() {
    if (this.updateInterval) {
      window.clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  // Subscribe to ambulance updates
  subscribe(callback: (ambulances: AmbulanceVehicle[]) => void) {
    this.listeners.push(callback);
    // Immediately send current state
    callback([...this.ambulances]);
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  // Convert ambulances to map location format
  getAmbulancesAsMapLocations(): Location[] {
    return this.ambulances.map(ambulance => ({
      id: ambulance.id,
      lat: ambulance.lat,
      lng: ambulance.lng,
      type: 'ambulance',
      status: ambulance.status,
      name: `Ambulance ${ambulance.callSign} (${ambulance.speed} km/h)`
    }));
  }
  
  // Get a specific ambulance by ID
  getAmbulanceById(id: string): AmbulanceVehicle | undefined {
    return this.ambulances.find(amb => amb.id === id);
  }
  
  // Dispatch an ambulance to a specific location
  dispatchAmbulance(reportId: string, destination: { lat: number, lng: number, address?: string }) {
    // Find an available ambulance
    const availableAmbulance = this.ambulances.find(amb => 
      amb.status === 'waiting' || !amb.reportId
    );
    
    if (availableAmbulance) {
      availableAmbulance.status = 'dispatched';
      availableAmbulance.destination = destination;
      availableAmbulance.reportId = reportId;
      
      // Calculate heading toward destination
      const deltaLng = destination.lng - availableAmbulance.lng;
      const deltaLat = destination.lat - availableAmbulance.lat;
      availableAmbulance.heading = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
      
      // Notify listeners of the update
      this.notifyListeners();
      
      return availableAmbulance.id;
    }
    
    return null;
  }
  
  // Simulate movement of all ambulances
  private updateAmbulancePositions() {
    const updatedAmbulances = this.ambulances.map(ambulance => {
      // Only move ambulances that are dispatched or en route
      if (ambulance.status !== 'dispatched' && ambulance.status !== 'enroute') {
        return ambulance;
      }
      
      if (ambulance.status === 'dispatched') {
        // Accelerate when first dispatched
        ambulance.speed = Math.min(ambulance.speed + 5, 60);
        ambulance.status = 'enroute';
      }
      
      if (!ambulance.destination) {
        // No destination, slow down
        ambulance.speed = Math.max(ambulance.speed - 5, 0);
        return ambulance;
      }
      
      // Calculate distance to destination
      const deltaLat = ambulance.destination.lat - ambulance.lat;
      const deltaLng = ambulance.destination.lng - ambulance.lng;
      const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
      
      // If close to destination, slow down and eventually arrive
      if (distance < 0.0005) { // Really close
        ambulance.status = 'arrived';
        ambulance.speed = 0;
        return ambulance;
      } else if (distance < 0.002) { // Getting close, slow down
        ambulance.speed = Math.max(ambulance.speed - 3, 10);
      }
      
      // Move toward destination
      const moveFactor = (ambulance.speed / 3600) * 0.009; // Convert km/h to appropriate coordinate change
      
      // Update position based on heading
      const radianHeading = ambulance.heading * (Math.PI / 180);
      ambulance.lat += Math.cos(radianHeading) * moveFactor;
      ambulance.lng += Math.sin(radianHeading) * moveFactor;
      
      return ambulance;
    });
    
    this.ambulances = updatedAmbulances;
    this.notifyListeners();
  }
  
  // Notify all listeners of ambulance updates
  private notifyListeners() {
    this.listeners.forEach(callback => {
      callback([...this.ambulances]);
    });
  }
}

// Singleton instance
export const ambulanceService = new AmbulanceTrackingService();
