
// Google Maps service for common map operations
export const GOOGLE_MAPS_API_KEY = 'AIzaSyA1DUCXVkJUuzQcucV8J2Le3EHStEDNZmQ';

// Types
export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type RouteData = {
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  duration: number; // in seconds
  distance: number; // in meters
};

// Map service with methods for common map operations using Google Maps
class MapService {
  /**
   * Calculate ETA based on distance and average speed
   */
  calculateETA(distanceInMeters: number, speedKmh: number = 30): number {
    // Convert distance to km and calculate time in hours, then convert to minutes
    // Using 30 kmh as default for Bangalore traffic
    const distanceKm = distanceInMeters / 1000;
    const timeHours = distanceKm / speedKmh;
    const timeMinutes = Math.ceil(timeHours * 60);
    
    return timeMinutes;
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(start: Coordinates, end: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = start.latitude * Math.PI/180;
    const φ2 = end.latitude * Math.PI/180;
    const Δφ = (end.latitude-start.latitude) * Math.PI/180;
    const Δλ = (end.longitude-start.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

// Export singleton instance
export const mapService = new MapService();

export default mapService;
