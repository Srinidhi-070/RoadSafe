
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface Location {
  id: string;
  lat: number;
  lng: number;
  type: 'accident' | 'ambulance' | 'hospital' | 'user' | 'police' | 'fire';
  status?: 'enroute' | 'arrived' | 'waiting' | 'dispatched' | 'completed';
  name?: string;
}

interface MapViewProps {
  className?: string;
  locations?: Location[];
  centerLocation?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
}

// You would typically store this in environment variables
// For demonstration purposes we'll use a temporary token input field
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsbnp5bDR5dzAyYTMyaXBiaWkwNDM2cW8ifQ.Jm0J_Ve5RlZIl_q24Q8JKg';

const MapView: React.FC<MapViewProps> = ({ 
  className, 
  locations = [], 
  centerLocation = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  interactive = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userToken, setUserToken] = useState<string>(MAPBOX_TOKEN);
  const [showTokenInput, setShowTokenInput] = useState<boolean>(!MAPBOX_TOKEN);

  // Initialize map when the component mounts
  useEffect(() => {
    if (!mapContainer.current || !userToken) return;

    mapboxgl.accessToken = userToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [centerLocation.lng, centerLocation.lat],
        zoom: zoom,
        interactive: interactive,
      });

      // Add navigation controls if interactive
      if (interactive) {
        map.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );
      }

      map.current.on('load', () => {
        setIsMapLoaded(true);
      });

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
      setShowTokenInput(true);
    }
  }, [centerLocation.lat, centerLocation.lng, zoom, interactive, userToken]);

  // Handle markers whenever locations change or map loads
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear any existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for each location
    locations.forEach(location => {
      // Create custom element for marker
      const el = document.createElement('div');
      el.className = 'marker';
      
      // Style based on location type
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      
      // Set background color based on type
      switch (location.type) {
        case 'accident':
          el.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'; // Red
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
          break;
        case 'ambulance':
          el.style.backgroundColor = 'rgba(59, 130, 246, 0.9)'; // Blue
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M17 11h-1v1h1"></path><path d="M11 11v-3h3"></path><path d="M6 11h.01"></path><path d="M22 11h.01"></path></svg>`;
          break;
        case 'hospital':
          el.style.backgroundColor = 'rgba(16, 185, 129, 0.9)'; // Green
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
          break;
        case 'police':
          el.style.backgroundColor = 'rgba(79, 70, 229, 0.9)'; // Indigo
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
          break;
        case 'fire':
          el.style.backgroundColor = 'rgba(245, 158, 11, 0.9)'; // Amber
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;
          break;
        case 'user':
        default:
          el.style.backgroundColor = 'rgba(139, 92, 246, 0.9)'; // Purple
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="10"></circle></svg>`;
      }
      
      // Add pulse effect if status is active
      if (location.status === 'enroute' || location.status === 'dispatched') {
        const pulse = document.createElement('div');
        pulse.className = 'pulse';
        pulse.style.position = 'absolute';
        pulse.style.width = '35px';
        pulse.style.height = '35px';
        pulse.style.borderRadius = '50%';
        pulse.style.backgroundColor = el.style.backgroundColor.replace('0.9', '0.4');
        pulse.style.animation = 'pulse 1.5s infinite';
        el.appendChild(pulse);
        
        // Add keyframes for pulse animation
        if (!document.getElementById('pulse-keyframes')) {
          const style = document.createElement('style');
          style.id = 'pulse-keyframes';
          style.innerHTML = `
            @keyframes pulse {
              0% {
                transform: scale(0.5);
                opacity: 1;
              }
              100% {
                transform: scale(1.5);
                opacity: 0;
              }
            }
          `;
          document.head.appendChild(style);
        }
      }
      
      // Create popup with information if name exists
      let popup;
      if (location.name) {
        popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>${location.name}</strong>${location.status ? `<br><span>${location.status}</span>` : ''}`);
      }
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup ? popup : undefined)
        .addTo(map.current!);
        
      markersRef.current.push(marker);
    });
    
    // Adjust map view to fit all markers if there are any
    if (locations.length > 1 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14
      });
    }
  }, [locations, isMapLoaded]);

  return (
    <div className={cn('w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden', className)}>
      {showTokenInput && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm mb-2">Enter your Mapbox access token:</p>
          <input 
            type="text" 
            value={userToken} 
            onChange={(e) => setUserToken(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-xs"
            placeholder="pk.eyJ1Ijoi..."
          />
          <button 
            onClick={() => setShowTokenInput(false)} 
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            Set Token
          </button>
          <a 
            href="https://account.mapbox.com/access-tokens/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 mt-2"
          >
            Get a token from Mapbox
          </a>
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
      
      {!isMapLoaded && !showTokenInput && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
