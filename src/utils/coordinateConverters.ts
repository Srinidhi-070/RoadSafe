
// Helper functions to convert between different coordinate formats

/**
 * Convert latitude/longitude format to lat/lng format
 */
export function toLatLng(coordinates: { latitude: number, longitude: number }) {
  return {
    lat: coordinates.latitude,
    lng: coordinates.longitude
  };
}

/**
 * Convert lat/lng format to latitude/longitude format
 */
export function toLatitudeLongitude(coordinates: { lat: number, lng: number }) {
  return {
    latitude: coordinates.lat,
    longitude: coordinates.lng
  };
}
