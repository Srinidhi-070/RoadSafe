import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Locate, Hospital, Ambulance, Filter, PanelLeft } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import BottomNavigation from '@/components/BottomNavigation';
import StatusBadge from '@/components/StatusBadge';
import { useAmbulanceTracking } from '@/hooks/useAmbulanceTracking';
import { toast } from 'sonner';
import AmbulanceMap from '@/components/AmbulanceMap';
import { useIsMobile } from '@/hooks/use-mobile';

interface LocationItem {
  id: string;
  name: string;
  type: 'hospital' | 'ambulance' | 'police' | 'fire';
  distance: number; // in km
  address: string;
  isOpen: boolean;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

// Custom components for icons
const ShieldIcon = ({ className }: { className?: string }) => (
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

const FlameIcon = ({ className }: { className?: string }) => (
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

const MapScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['hospital', 'ambulance']);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const isMobile = useIsMobile();
  
  const [locations, setLocations] = useState<LocationItem[]>([]);
  
  // Use the ambulance tracking hook
  const { 
    ambulanceLocations, 
    isTracking, 
    toggleTracking, 
    userLocation,
    getActiveAmbulance
  } = useAmbulanceTracking();
  
  // Mobile-first approach: Default panel state
  useEffect(() => {
    // On mobile, default to closed panel
    if (isMobile) {
      setIsPanelOpen(false);
    }
  }, [isMobile]);
  
  // Simulate loading locations
  useEffect(() => {
    const loadLocations = async () => {
      // Reduced timeout for faster loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for demo - using longitude/latitude format for Mapbox
      const mockLocations: LocationItem[] = [
        {
          id: '1',
          name: 'City General Hospital',
          type: 'hospital',
          distance: 1.2,
          address: '123 Main St, Cityville',
          isOpen: true,
          coordinates: {
            longitude: -74.0055,
            latitude: 40.7160
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
            longitude: -74.0090,
            latitude: 40.7110
          }
        },
        {
          id: '3',
          name: 'Downtown Police Station',
          type: 'police',
          distance: 3.1,
          address: '789 Central Blvd, Cityville',
          isOpen: true,
          coordinates: {
            longitude: -74.0100,
            latitude: 40.7080
          }
        },
        {
          id: '4',
          name: 'Eastside Fire Department',
          type: 'fire',
          distance: 4.2,
          address: '101 Elm St, Cityville',
          isOpen: true,
          coordinates: {
            longitude: -73.9950,
            latitude: 40.7190
          }
        }
      ];
      
      setLocations(mockLocations);
      setIsLoading(false);
    };
    
    loadLocations();
  }, []);
  
  const handleGetCurrentLocation = () => {
    toast.info('Getting your current location...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success('Location updated');
        },
        () => {
          toast.error('Could not get your location');
        },
        { timeout: 3000, enableHighAccuracy: true } // Use high accuracy for mobile
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
  
  // Toggle the side panel
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };
  
  return (
    <div className="min-h-screen pt-6 pb-20 relative">
      {/* Map View - Full Screen */}
      <div className="absolute inset-0 pt-16 pb-20">
        <AmbulanceMap 
          className="h-full" 
          showControls={true}
          interactive={true}
          zoom={12}
        />
      </div>
      
      {/* Header - Mobile optimized */}
      <div className="absolute top-0 left-0 right-0 pt-3 px-3 z-10 bg-gradient-to-b from-background via-background/95 to-transparent pb-6">
        <AnimatedContainer className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/home')}
                className="mr-3 p-2 rounded-full bg-background/90 hover:bg-muted transition-colors shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold">Nearby Services</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTracking}
                className={`p-2 rounded-full transition-colors shadow-sm bg-background/90 ${
                  isTracking ? 'text-success' : 'text-muted-foreground'
                }`}
                title={isTracking ? "Live tracking on" : "Live tracking off"}
              >
                <div className={`h-2 w-2 rounded-full ${isTracking ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
              </button>
              <button
                onClick={togglePanel}
                className={`p-2 rounded-full transition-colors shadow-sm bg-background/90 ${
                  isPanelOpen ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </AnimatedContainer>
        
        {/* Search bar - Mobile optimized */}
        <AnimatedContainer animation="fade-in" delay={100} className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hospitals, ambulances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-background/90 backdrop-blur-sm shadow-sm border border-muted/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <button
              onClick={handleGetCurrentLocation}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
            >
              <Locate className="h-4 w-4" />
            </button>
          </div>
        </AnimatedContainer>
      </div>
      
      {/* Mobile-Optimized Sliding Panel */}
      <div 
        className={`absolute inset-y-0 py-20 left-0 w-full max-w-[85%] z-20 transition-transform duration-300 ${
          isPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto bg-background/95 backdrop-blur-sm border-r shadow-lg p-3">
          {/* Panel Header */}
          <div className="mb-3">
            <h2 className="font-medium text-base">Emergency Services</h2>
            
            {/* Filters - Mobile optimized */}
            <div className="mt-2">
              <h3 className="text-xs font-medium mb-2">Filter By Service Type</h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => toggleFilter('hospital')}
                  className={`flex items-center px-2.5 py-1 rounded-full text-xs ${
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
                  className={`flex items-center px-2.5 py-1 rounded-full text-xs ${
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
                  className={`flex items-center px-2.5 py-1 rounded-full text-xs ${
                    selectedFilters.includes('police') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <ShieldIcon className="h-3 w-3 mr-1" />
                  Police
                </button>
                <button
                  onClick={() => toggleFilter('fire')}
                  className={`flex items-center px-2.5 py-1 rounded-full text-xs ${
                    selectedFilters.includes('fire') 
                      ? 'bg-destructive text-destructive-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <FlameIcon className="h-3 w-3 mr-1" />
                  Fire Dept.
                </button>
              </div>
            </div>
          </div>
          
          {/* Locations list - Mobile optimized */}
          <div className="space-y-3">
            {/* Active Ambulances section */}
            {isTracking && ambulanceLocations.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-medium text-info">Active Ambulances</h3>
                  <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded-full flex items-center">
                    <Ambulance className="h-3 w-3 mr-1" />
                    {ambulanceLocations.length} Units
                  </span>
                </div>
                
                <div className="space-y-2">
                  {ambulanceLocations.map((amb) => (
                    <div 
                      key={amb.id} 
                      className="bg-info/5 border border-info/20 rounded-lg p-3 hover:border-info/40 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-info/10 text-info">
                          <Ambulance className="h-5 w-5" />
                        </div>
                        
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{amb.name}</h3>
                            <StatusBadge status={(amb.status || 'waiting') as any} className="text-xs" />
                          </div>
                          <div className="mt-1 flex justify-between items-center">
                            <span className="text-xs">
                              {amb.status === 'enroute' ? 'En route to patient' : 
                               amb.status === 'dispatched' ? 'Dispatched' : 
                               amb.status === 'arrived' ? 'Arrived at scene' : 
                               'Waiting for dispatch'}
                            </span>
                            {amb.eta && (
                              <span className="text-xs font-medium">
                                ETA: {amb.eta} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fixed Locations - Mobile optimized */}
            <div>
              <h3 className="text-xs font-medium mb-1.5">Medical Facilities</h3>
              
              {isLoading ? (
                // Loading skeleton
                Array(3).fill(null).map((_, index) => (
                  <div key={index} className="bg-card border rounded-lg p-4 mb-2 animate-pulse">
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
              ) : (
                <div className="space-y-2">
                  {locations.filter(
                    location => 
                      selectedFilters.includes(location.type) && 
                      (searchQuery === '' || location.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length > 0 ? (
                    locations.filter(
                      location => 
                        selectedFilters.includes(location.type) && 
                        (searchQuery === '' || location.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).map((location) => (
                      <div 
                        key={location.id} 
                        className="bg-card border rounded-lg p-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            location.type === 'hospital' ? 'bg-primary/10 text-primary' : 
                            location.type === 'ambulance' ? 'bg-info/10 text-info' :
                            location.type === 'police' ? 'bg-primary/10 text-primary' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {location.type === 'hospital' && <Hospital className="h-5 w-5" />}
                            {location.type === 'ambulance' && <Ambulance className="h-5 w-5" />}
                            {location.type === 'police' && <ShieldIcon className="h-5 w-5" />}
                            {location.type === 'fire' && <FlameIcon className="h-5 w-5" />}
                          </div>
                          
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{location.name}</h3>
                              <span className="text-sm font-medium ml-2 flex-shrink-0">
                                {location.distance.toFixed(1)} km
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
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
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No services found matching your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Add a handle or indicator for the panel */}
        <div 
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 rounded-full p-1.5 bg-primary shadow-lg"
          onClick={togglePanel}
        >
          <PanelLeft className="h-3.5 w-3.5 text-white" style={{ transform: isPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default MapScreen;
