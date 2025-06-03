import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Locate, Hospital, Ambulance, Filter, PanelLeft, Eye, EyeOff } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import BottomNavigation from '@/components/BottomNavigation';
import StatusBadge from '@/components/StatusBadge';
import { useAmbulanceTracking } from '@/hooks/useAmbulanceTracking';
import { toast } from 'sonner';
import AmbulanceMap from '@/components/AmbulanceMap';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';

interface LocationItem {
  id: string;
  name: string;
  type: 'hospital' | 'ambulance' | 'police' | 'fire';
  distance: number;
  address: string;
  isOpen: boolean;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

// Custom icons
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const FlameIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const MapScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['hospital', 'ambulance']);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const [locations, setLocations] = useState<LocationItem[]>([]);
  
  const { 
    ambulanceLocations, 
    isTracking, 
    toggleTracking, 
    userLocation,
    getActiveAmbulance
  } = useAmbulanceTracking();
  
  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockLocations: LocationItem[] = [
        {
          id: '1',
          name: 'City General Hospital',
          type: 'hospital',
          distance: 1.2,
          address: '123 Main St, Cityville',
          isOpen: true,
          coordinates: { longitude: -74.0055, latitude: 40.7160 }
        },
        {
          id: '2',
          name: 'Southside Medical Center',
          type: 'hospital',
          distance: 2.5,
          address: '456 Oak Ave, Cityville',
          isOpen: true,
          coordinates: { longitude: -74.0090, latitude: 40.7110 }
        },
        {
          id: '3',
          name: 'Downtown Police Station',
          type: 'police',
          distance: 3.1,
          address: '789 Central Blvd, Cityville',
          isOpen: true,
          coordinates: { longitude: -74.0100, latitude: 40.7080 }
        },
        {
          id: '4',
          name: 'Eastside Fire Department',
          type: 'fire',
          distance: 4.2,
          address: '101 Elm St, Cityville',
          isOpen: true,
          coordinates: { longitude: -73.9950, latitude: 40.7190 }
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
        { timeout: 3000, enableHighAccuracy: true }
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

  const filterData = [
    { id: 'hospital', label: 'Hospitals', icon: Hospital, color: 'bg-primary', activeColor: 'bg-primary text-white' },
    { id: 'ambulance', label: 'Ambulances', icon: Ambulance, color: 'bg-info', activeColor: 'bg-info text-white' },
    { id: 'police', label: 'Police', icon: ShieldIcon, color: 'bg-blue-600', activeColor: 'bg-blue-600 text-white' },
    { id: 'fire', label: 'Fire Dept.', icon: FlameIcon, color: 'bg-orange-600', activeColor: 'bg-orange-600 text-white' }
  ];

  const getActiveAmbulanceData = getActiveAmbulance();
  
  return (
    <div className="min-h-screen relative bg-gray-900">
      {/* Full Screen Map */}
      <AmbulanceMap 
        className="absolute inset-0" 
        showControls={false}
        interactive={true}
        zoom={12}
      />
      
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      
      {/* Top Section with Search and Filters */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-4 px-4">
        <AnimatedContainer className="space-y-4">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/home')}
              className="p-3 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-lg font-bold text-white drop-shadow-lg">Emergency Services</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTracking}
                className={`p-3 rounded-full backdrop-blur-sm shadow-lg transition-all duration-200 ${
                  isTracking ? 'bg-green-500/90 text-white' : 'bg-white/90 text-gray-600'
                }`}
              >
                {isTracking ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search hospitals, ambulances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 placeholder-gray-500"
            />
            <button
              onClick={handleGetCurrentLocation}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
            >
              <Locate className="h-5 w-5" />
            </button>
          </div>
          
          {/* Horizontal Scrollable Filter Chips */}
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {filterData.map((filter) => {
              const isActive = selectedFilters.includes(filter.id);
              const IconComponent = filter.icon;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    isActive 
                      ? `${filter.activeColor} shadow-lg` 
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </AnimatedContainer>
      </div>
      
      {/* Floating Action Buttons */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-3 z-20">
        <button
          onClick={handleGetCurrentLocation}
          className="p-4 rounded-full bg-white/95 backdrop-blur-sm shadow-xl text-gray-700 hover:bg-white hover:shadow-2xl transition-all duration-200 transform hover:scale-110"
        >
          <Locate className="h-6 w-6" />
        </button>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="p-4 rounded-full bg-white/95 backdrop-blur-sm shadow-xl text-gray-700 hover:bg-white hover:shadow-2xl transition-all duration-200 transform hover:scale-110">
              <PanelLeft className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] bg-white/95 backdrop-blur-sm">
            <SheetHeader>
              <SheetTitle>Emergency Services</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6 overflow-y-auto">
              {/* Active Ambulances */}
              {isTracking && ambulanceLocations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Ambulance className="h-5 w-5 mr-2 text-blue-600" />
                    Active Ambulances
                  </h3>
                  {ambulanceLocations.map((amb, index) => (
                    <Card key={amb.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <Ambulance className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{amb.name}</h4>
                              <p className="text-sm text-gray-600">
                                {amb.status === 'enroute' ? 'En route to patient' : 
                                 amb.status === 'dispatched' ? 'Dispatched' : 
                                 amb.status === 'arrived' ? 'Arrived at scene' : 
                                 'Waiting for dispatch'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={amb.status as any} />
                            {amb.eta && amb.eta > 0 && (
                              <p className="text-lg font-bold text-gray-800 mt-1">
                                {amb.eta} min
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Medical Facilities */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Hospital className="h-5 w-5 mr-2 text-green-600" />
                  Medical Facilities
                </h3>
                {locations.filter(location => 
                  selectedFilters.includes(location.type) && 
                  (searchQuery === '' || location.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map((location, index) => (
                  <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            location.type === 'hospital' ? 'bg-green-100' : 
                            location.type === 'police' ? 'bg-blue-100' : 'bg-orange-100'
                          }`}>
                            {location.type === 'hospital' && <Hospital className="h-6 w-6 text-green-600" />}
                            {location.type === 'police' && <ShieldIcon className="h-6 w-6 text-blue-600" />}
                            {location.type === 'fire' && <FlameIcon className="h-6 w-6 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{location.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {location.address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">{location.distance.toFixed(1)} km</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            location.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {location.isOpen ? 'Open 24/7' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Live Tracking Widget */}
      {isTracking && getActiveAmbulanceData && (
        <div className="absolute bottom-24 left-4 z-20">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <span className="text-sm font-medium">
              Live Tracking • ETA {getActiveAmbulanceData.eta} min
            </span>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default MapScreen;
