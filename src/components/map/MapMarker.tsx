
import { Marker, InfoWindow } from '@react-google-maps/api';
import React from 'react';

export interface Location {
  id: string;
  lat: number;
  lng: number;
  type: 'accident' | 'ambulance' | 'hospital' | 'user' | 'police' | 'fire';
  status?: 'enroute' | 'arrived' | 'waiting' | 'dispatched' | 'completed';
  name?: string;
  eta?: number;
  distance?: number;
}

interface MapMarkerProps {
  location: Location;
  onMarkerClick: (location: Location) => void;
  isSelected: boolean;
  onInfoWindowClose: () => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ 
  location, 
  onMarkerClick, 
  isSelected,
  onInfoWindowClose
}) => {
  // Get marker icon based on location type
  const getMarkerIcon = (locationType: string, status?: string) => {
    const isActive = status === 'enroute' || status === 'dispatched';
    
    // Define SVG icons and colors based on type
    let fillColor = '#3B82F6'; // Default blue
    
    switch (locationType) {
      case 'accident':
        fillColor = '#EF4444'; // Red
        break;
      case 'ambulance':
        fillColor = '#3B82F6'; // Blue
        break;
      case 'hospital':
        fillColor = '#10B981'; // Green
        break;
      case 'police':
        fillColor = '#4F46E5'; // Indigo
        break;
      case 'fire':
        fillColor = '#F59E0B'; // Amber
        break;
      case 'user':
        fillColor = '#8B5CF6'; // Purple
        break;
      default:
        fillColor = '#3B82F6'; // Blue
    }
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: fillColor,
      fillOpacity: 0.9,
      strokeWeight: 1.5,
      strokeColor: 'white',
      scale: 9,
      labelOrigin: new google.maps.Point(0, -2)
    };
  };

  return (
    <>
      <Marker
        key={location.id}
        position={{ lat: location.lat, lng: location.lng }}
        icon={getMarkerIcon(location.type, location.status)}
        onClick={() => onMarkerClick(location)}
        animation={google.maps.Animation.DROP}
        title={location.name || location.type}
      />
      
      {isSelected && (
        <InfoWindow
          position={{ lat: location.lat, lng: location.lng }}
          onCloseClick={onInfoWindowClose}
        >
          <div className="p-1">
            <strong>{location.name || location.type}</strong>
            {location.status && (
              <div className="text-xs mt-1">Status: {location.status}</div>
            )}
            {location.eta !== undefined && (
              <div className="text-xs mt-1">ETA: {location.eta} min</div>
            )}
            {location.distance !== undefined && (
              <div className="text-xs mt-1">Distance: {
                location.distance < 1000 
                  ? `${Math.round(location.distance)}m` 
                  : `${(location.distance / 1000).toFixed(1)}km`
              }</div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default MapMarker;
