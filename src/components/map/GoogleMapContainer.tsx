
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import MapMarker, { Location } from './MapMarker';

interface GoogleMapContainerProps {
  locations: Location[];
  centerLocation: { lat: number; lng: number };
  zoom: number;
  interactive: boolean;
  selectedMarker: Location | null;
  setSelectedMarker: (marker: Location | null) => void;
}

const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  locations,
  centerLocation,
  zoom,
  interactive,
  selectedMarker,
  setSelectedMarker
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoadError, setMapLoadError] = useState<boolean>(false);
  
  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle map unmount
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Handle click on marker
  const handleMarkerClick = (location: Location) => {
    setSelectedMarker(location);
  };

  // Close info window
  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  // Fit bounds to include all markers
  useEffect(() => {
    if (mapRef.current && locations.length > 1) {
      try {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach(location => {
          bounds.extend(new google.maps.LatLng(location.lat, location.lng));
        });
        mapRef.current.fitBounds(bounds, 50); // 50px padding
      } catch (error) {
        console.error("Error fitting bounds:", error);
        setMapLoadError(true);
      }
    }
  }, [locations]);

  if (mapLoadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center p-4">
          <p className="text-destructive">Map failed to load</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '100%'
      }}
      center={centerLocation}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: !interactive,
        scrollwheel: interactive,
        zoomControl: interactive,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: interactive,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }}
    >
      {locations.map((location) => (
        <MapMarker
          key={location.id}
          location={location}
          onMarkerClick={handleMarkerClick}
          isSelected={selectedMarker?.id === location.id}
          onInfoWindowClose={handleInfoWindowClose}
        />
      ))}
    </GoogleMap>
  );
};

export default GoogleMapContainer;
