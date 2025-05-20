
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { mapService, MAPBOX_ACCESS_TOKEN } from '@/services/MapService';

// Define types for markers
export interface MapLocation {
  id: string;
  longitude: number;
  latitude: number;
  type: 'user' | 'ambulance' | 'accident' | 'hospital' | 'police' | 'fire';
  name?: string;
  status?: string;
  distance?: number;
  eta?: number;
}

interface MapboxMapProps {
  className?: string;
  locations?: MapLocation[];
  centerLocation?: { longitude: number; latitude: number };
  zoom?: number;
  interactive?: boolean;
  lazy?: boolean;
  showRoute?: boolean;
  routeStart?: { longitude: number; latitude: number };
  routeEnd?: { longitude: number; latitude: number };
  onMapLoad?: () => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  className,
  locations = [],
  centerLocation = { longitude: -74.0060, latitude: 40.7128 }, // Default to NYC
  zoom = 12,
  interactive = true,
  lazy = false,
  showRoute = false,
  routeStart,
  routeEnd,
  onMapLoad,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const [shouldInitialize, setShouldInitialize] = useState(!lazy);
  const routeRef = useRef<any>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || shouldInitialize) return;
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShouldInitialize(true);
        observer.current?.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (mapContainerRef.current) {
      observer.current.observe(mapContainerRef.current);
    }
    
    return () => {
      observer.current?.disconnect();
    };
  }, [lazy, shouldInitialize]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!shouldInitialize || !mapContainer.current) return;
    
    // Create the map
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLocation.longitude, centerLocation.latitude],
      zoom: zoom,
      interactive: interactive,
    });

    // Add navigation controls if interactive
    if (interactive) {
      mapInstance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    }

    // Save map instance
    map.current = mapInstance;

    // Set up event handlers
    mapInstance.on('load', () => {
      setIsMapLoaded(true);
      
      // Add route source and layer
      mapInstance.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
      
      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
      
      if (onMapLoad) {
        onMapLoad();
      }
    });

    // Cleanup on component unmount
    return () => {
      // Remove all markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      
      // Remove map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [centerLocation, zoom, interactive, shouldInitialize, onMapLoad]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !isMapLoaded || !locations.length) return;

    // Track which markers we've updated
    const updatedMarkers: { [key: string]: boolean } = {};

    // Add or update markers
    locations.forEach(location => {
      const id = location.id;
      updatedMarkers[id] = true;

      // Create HTML element for marker
      const createMarkerElement = (type: string, status?: string) => {
        const el = document.createElement('div');
        
        // Base styles
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        
        // Type-specific styles
        if (type === 'user') {
          el.style.backgroundColor = '#1EAEDB';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white">
            <circle cx="12" cy="12" r="10" fill="#1EAEDB" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white" stroke="none"/>
          </svg>`;
        } else if (type === 'ambulance') {
          const bgColor = status === 'enroute' ? '#F97316' : '#8B5CF6';
          el.style.backgroundColor = bgColor;
          el.style.boxShadow = status === 'enroute' ? '0 0 0 6px rgba(249, 115, 22, 0.3)' : 'none';
          el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17H5a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v3.3"></path>
            <path d="M11 16.5V17a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-.5a2 2 0 0 1 4 0z"></path>
            <path d="M13 11l2 2 4-4"></path>
            <path d="M15 5v6"></path>
          </svg>`;
          // Add animation for en route ambulances
          if (status === 'enroute') {
            el.style.animation = 'pulse 1.5s infinite';
            const style = document.createElement('style');
            style.textContent = `
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.6); }
                70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
              }
            `;
            document.head.appendChild(style);
          }
        } else if (type === 'accident') {
          el.style.backgroundColor = '#ea384c';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>`;
        } else if (type === 'hospital') {
          el.style.backgroundColor = '#9b87f5';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
            <path d="M8 12h8"></path>
            <path d="M12 8v8"></path>
          </svg>`;
        } else if (type === 'police') {
          el.style.backgroundColor = '#4F46E5';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>`;
        } else if (type === 'fire') {
          el.style.backgroundColor = '#F59E0B';
          el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>`;
        }
        
        return el;
      };

      // Create or update marker
      if (markersRef.current[id]) {
        // Update existing marker's position
        markersRef.current[id].setLngLat([location.longitude, location.latitude]);
      } else {
        // Create new marker
        const markerEl = createMarkerElement(location.type, location.status);
        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: 'center'
        })
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current);

        // Add popup with information if name exists
        if (location.name) {
          let popupContent = `<strong>${location.name}</strong>`;
          
          // Add distance if available
          if (location.distance !== undefined) {
            popupContent += `<br>Distance: ${mapService.formatDistance(location.distance * 1000)}`;
          }
          
          // Add ETA for ambulances
          if (location.type === 'ambulance' && location.eta !== undefined) {
            popupContent += `<br>ETA: ${location.eta} min`;
          }
          
          // Add status for ambulances
          if (location.type === 'ambulance' && location.status) {
            const statusText = location.status.charAt(0).toUpperCase() + location.status.slice(1);
            popupContent += `<br>Status: ${statusText}`;
          }
          
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupContent);
          
          marker.setPopup(popup);
        }

        markersRef.current[id] = marker;
      }
    });

    // Remove markers that are no longer in the locations array
    Object.keys(markersRef.current).forEach(id => {
      if (!updatedMarkers[id]) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Center map to fit all markers if there are multiple locations
    if (locations.length > 1 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      
      locations.forEach(location => {
        bounds.extend([location.longitude, location.latitude]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    } else if (locations.length === 1 && map.current) {
      // Center on the single location
      map.current.flyTo({
        center: [locations[0].longitude, locations[0].latitude],
        zoom: 14,
        speed: 1.2,
      });
    }
  }, [locations, isMapLoaded]);

  // Draw route between start and end points if enabled
  useEffect(() => {
    const drawRoute = async () => {
      if (!map.current || !isMapLoaded || !showRoute || !routeStart || !routeEnd) return;
      
      try {
        const routeData = await mapService.getRoute(routeStart, routeEnd);
        
        if (routeData && map.current) {
          const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
          
          if (source) {
            // Update the route line
            source.setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeData.geometry.coordinates
              }
            });
            
            // Save route data for later use
            routeRef.current = routeData;
          }
        }
      } catch (error) {
        console.error('Error drawing route:', error);
      }
    };
    
    drawRoute();
  }, [routeStart, routeEnd, showRoute, isMapLoaded]);

  return (
    <div 
      className={cn('w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden', className)} 
      ref={mapContainerRef}
    >
      {shouldInitialize ? (
        <div ref={mapContainer} className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Map loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
