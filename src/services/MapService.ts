
import mapboxgl from 'mapbox-gl';

// Mapbox access token and Google Maps API key
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1haS1kZW1vIiwiYSI6ImNsdmkzbGl2bzFlbm4ya3J0Mmx5YWI2aTQifQ.GsUyyKxmVhyyu5F3jKrSwA';
export const GOOGLE_MAPS_API_KEY = 'AIzaSyA1DUCXVkJUuzQcucV8J2Le3EHStEDNZmQ';

// Initialize Mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

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

// Map service with methods for common map operations
class MapService {
  /**
   * Fetch a route between two points using Mapbox Directions API
   */
  async getRoute(start: Coordinates, end: Coordinates): Promise<RouteData | null> {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  }

  /**
   * Calculate ETA based on distance and average speed
   */
  calculateETA(distanceInMeters: number, speedKmh: number = 40): number {
    // Convert distance to km and calculate time in hours, then convert to minutes
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
}

// Export singleton instance
export const mapService = new MapService();

export default mapService;
