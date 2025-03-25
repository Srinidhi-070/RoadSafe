import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Locate, Hospital, Ambulance, Filter, Shield, Flame } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import MapView, { Location as MapLocation } from '@/components/MapView';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  type: 'hospital' | 'ambulance' | 'police' | 'fire';
  distance: number; // in km
  address: string;
  isOpen: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const MapScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['hospital', 'ambulance']);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ 
    lat: 40.7128, 
    lng: -74.0060  // Default to NYC
  });
  
  // Simulate loading locations
  useEffect(() => {
    const loadLocations = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for demo
      const mockLocations: Location[] = [
        {
          id: '1',
          name: 'City General Hospital',
          type: 'hospital',
          distance: 1.2,
          address: '123 Main St, Cityville',
          isOpen: true,
          coordinates: {
            lat: 40.7160,
            lng: -74.0055
          }
        },
        {
          id: '2',
          name: 'Southside Medical Center',
          type: 'hospital',
          distance: 2.5,
          address: '456 Oak Ave, Cityville',
          isOpen: true,
          coordinates: {
            lat: 40.7110,
            lng: -74.0090
          }
        },
        {
          id: '3',
          name: 'Rapid Response Ambulance',
          type: 'ambulance',
          distance: 0.8,
          address: 'Mobile Unit - Currently 0.8km away',
          isOpen: true,
          coordinates: {
            lat: 40.7138,
            lng: -74.0030
          }
        },
        {
          id: '4',
          name: 'Downtown Police Station',
          type: 'police',
          distance: 3.1,
          address: '789 Central Blvd, Cityville',
          isOpen: true,
          coordinates: {
            lat: 40.7080,
            lng: -74.0100
          }
        },
        {
          id: '5',
          name: 'Eastside Fire Department',
          type: 'fire',
          distance: 4.2,
          address: '101 Elm St, Cityville',
          isOpen: true,
          coordinates: {
            lat: 40.7190,
            lng: -73.9950
          }
        }
      ];
      
      setLocations(mockLocations);
      
      // Convert locations to map markers
      const mapMarkers: MapLocation[] = mockLocations.map(loc => ({
        id: loc.id,
        lat: loc.coordinates.lat,
        lng: loc.coordinates.lng,
        type: loc.type,
        name: loc.name
      }));
      
      // Add user location
      mapMarkers.push({
        id: 'user',
        lat: userLocation.lat,
        lng: userLocation.lng,
        type: 'user',
        name: 'Your Location'
      });
      
      setMapLocations(mapMarkers);
      setIsLoading(false);
    };
    
    loadLocations();
  }, [userLocation]);
  
  const handleGetCurrentLocation = () => {
    toast.info('Getting your current location...');
    
    // In a real app, we would use the Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          toast.success('Location updated');
        },
        () => {
          // Fallback if geolocation fails
          toast.error('Could not get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };
  
  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  
  const filteredLocations = locations.filter(
    location => 
      selectedFilters.includes(location.type) && 
      (searchQuery === '' || location.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Filter map locations based on selected filters
  const filteredMapLocations = mapLocations.filter(loc => 
    loc.type === 'user' || selectedFilters.includes(loc.type as any)
  );
  
  return (
    <div className="min-h-screen pt-6 pb-20 px-4">
      {/* Header */}
      <AnimatedContainer className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="mr-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Nearby Services</h1>
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 rounded-full transition-colors ${
              filterOpen ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </AnimatedContainer>
      
      {/* Search bar */}
      <AnimatedContainer animation="fade-in" delay={100} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hospitals, ambulances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-muted border-none rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleGetCurrentLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
          >
            <Locate className="h-4 w-4" />
          </button>
        </div>
      </AnimatedContainer>
      
      {/* Filters */}
      {filterOpen && (
        <AnimatedContainer animation="scale-in" className="mb-4">
          <div className="bg-card border rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Filter By Service Type</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleFilter('hospital')}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs ${
                  selectedFilters.includes('hospital') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Hospital className="h-3 w-3 mr-1" />
                Hospitals
              </button>
              <button
                onClick={() => toggleFilter('ambulance')}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs ${
                  selectedFilters.includes('ambulance') 
                    ? 'bg-info text-info-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Ambulance className="h-3 w-3 mr-1" />
                Ambulances
              </button>
              <button
                onClick={() => toggleFilter('police')}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs ${
                  selectedFilters.includes('police') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Shield className="h-3 w-3 mr-1" />
                Police
              </button>
              <button
                onClick={() => toggleFilter('fire')}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs ${
                  selectedFilters.includes('fire') 
                    ? 'bg-emergency text-emergency-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Flame className="h-3 w-3 mr-1" />
                Fire Dept.
              </button>
            </div>
          </div>
        </AnimatedContainer>
      )}
      
      {/* Map */}
      <AnimatedContainer animation="fade-in" delay={200} className="mb-6">
        <MapView 
          className="h-64 rounded-lg overflow-hidden shadow-md border" 
          locations={filteredMapLocations}
          centerLocation={userLocation}
          zoom={13}
        />
      </AnimatedContainer>
      
      {/* Locations list */}
      <AnimatedContainer animation="fade-in" delay={300}>
        <h2 className="font-medium mb-3">Nearby Emergency Services</h2>
        
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(null).map((_, index) => (
              <div key={index} className="bg-card border rounded-lg p-4 animate-pulse">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="ml-3 space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : filteredLocations.length > 0 ? (
            filteredLocations.map((location, index) => (
              <AnimatedContainer 
                key={location.id} 
                animation="fade-in"
                delay={400 + (index * 100)}
                className="bg-card border rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    location.type === 'hospital' ? 'bg-primary/10 text-primary' : 
                    location.type === 'ambulance' ? 'bg-info/10 text-info' :
                    location.type === 'police' ? 'bg-primary/10 text-primary' :
                    'bg-emergency/10 text-emergency'
                  }`}>
                    {location.type === 'hospital' && <Hospital className="h-5 w-5" />}
                    {location.type === 'ambulance' && <Ambulance className="h-5 w-5" />}
                    {location.type === 'police' && <Shield className="h-5 w-5" />}
                    {location.type === 'fire' && <Flame className="h-5 w-5" />}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{location.name}</h3>
                      <span className="text-sm font-medium ml-2 flex-shrink-0">
                        {location.distance.toFixed(1)} km
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{location.address}</span>
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      {location.isOpen ? (
                        <span className="text-xs text-success">Open 24/7</span>
                      ) : (
                        <span className="text-xs text-destructive">Closed</span>
                      )}
                      <button className="text-xs text-primary hover:underline">
                        Get directions
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No services found matching your filters</p>
            </div>
          )}
        </div>
      </AnimatedContainer>
      
      <BottomNavigation />
    </div>
  );
};

// Internal components
const Shield = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const Flame = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

export default MapScreen;
