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
  darkMode?: boolean;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  className,
  locations = [],
  centerLocation = { longitude: -74.0060, latitude: 40.7128 },
  zoom = 12,
  interactive = true,
  lazy = false,
  showRoute = false,
  routeStart,
  routeEnd,
  onMapLoad,
  darkMode = false,
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
    
    // Create the map with dark theme
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      center: [centerLocation.longitude, centerLocation.latitude],
      zoom: zoom,
      interactive: interactive,
    });

    // Add navigation controls if interactive
    if (interactive) {
      mapInstance.addControl(
        new mapboxgl.NavigationControl({ 
          showCompass: false,
          showZoom: true 
        }), 
        'top-right'
      );
    }

    // Save map instance
    map.current = mapInstance;

    // Set up event handlers
    mapInstance.on('load', () => {
      setIsMapLoaded(true);
      
      // Add route source and layer with enhanced styling
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
          'line-color': darkMode ? '#60A5FA' : '#3B82F6',
          'line-width': 6,
          'line-opacity': 0.8
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
  }, [centerLocation, zoom, interactive, shouldInitialize, onMapLoad, darkMode]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !isMapLoaded || !locations.length) return;

    const updatedMarkers: { [key: string]: boolean } = {};

    // Add or update markers
    locations.forEach(location => {
      const id = location.id;
      updatedMarkers[id] = true;

      // Enhanced marker creation with better styling
      const createMarkerElement = (type: string, status?: string) => {
        const el = document.createElement('div');
        
        // Enhanced base styles
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        el.style.transition = 'all 0.3s ease';
        
        // Enhanced hover effect
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.1)';
          el.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });
        
        // Type-specific enhanced styles
        if (type === 'user') {
          el.style.backgroundColor = '#3B82F6';
          el.innerHTML = `<div style="width: 12px; height: 12px; background: white; border-radius: 50%; box-shadow: 0 0 0 3px #3B82F6;"></div>`;
        } else if (type === 'ambulance') {
          const bgColor = status === 'enroute' ? '#F97316' : '#8B5CF6';
          el.style.backgroundColor = bgColor;
          if (status === 'enroute') {
            el.style.animation = 'pulse 2s infinite';
            const style = document.createElement('style');
            style.textContent = `
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
                70% { box-shadow: 0 0 0 15px rgba(249, 115, 22, 0); }
                100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
              }
            `;
            document.head.appendChild(style);
          }
          el.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M7 17H5a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v3.3"></path>
            <path d="M11 16.5V17a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-.5a2 2 0 0 1 4 0z"></path>
            <path d="M13 11l2 2 4-4"></path>
            <path d="M15 5v6"></path>
          </svg>`;
        } else if (type === 'accident') {
          el.style.backgroundColor = '#EF4444';
          el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>`;
        } else if (type === 'hospital') {
          el.style.backgroundColor = '#10B981';
          el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
            <path d="M8 12h8"></path>
            <path d="M12 8v8"></path>
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
      className={cn('w-full h-64 bg-gray-900 rounded-lg relative overflow-hidden', className)} 
      ref={mapContainerRef}
    >
      {shouldInitialize ? (
        <div ref={mapContainer} className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
