
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Locate, Hospital, Ambulance, Filter, PanelLeft, Eye, EyeOff } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import BottomNavigation from '@/components/BottomNavigation';
import StatusBadge from '@/components/StatusBadge';
import { useAmbulanceTracking } from '@/hooks/useAmbulanceTracking';
import { toast } from 'sonner';
import AmbulanceMap from '@/components/AmbulanceMap';
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
  
  const [locations, setLocations] = useState<LocationItem[]>([]);
  
  const { 
    ambulanceLocations, 
    isTracking, 
    toggleTracking, 
    userLocation,
    getActiveAmbulance
  } = useAmbulanceTracking();
  
  // Load Bangalore locations
  useEffect(() => {
    const loadLocations = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Bangalore emergency services data
      const bangaloreLocations: LocationItem[] = [
        {
          id: '1',
          name: 'Manipal Hospital Whitefield',
          type: 'hospital',
          distance: 2.1,
          address: 'Survey No. 10P & 12P, Ramagondanahalli, Whitefield, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.7499, latitude: 12.9698 }
        },
        {
          id: '2',
          name: 'Apollo Hospital Bannerghatta',
          type: 'hospital',
          distance: 3.5,
          address: '154/11, Opposite IIM-B, Bannerghatta Road, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.6068, latitude: 12.8456 }
        },
        {
          id: '3',
          name: 'Fortis Hospital Cunningham Road',
          type: 'hospital',
          distance: 1.8,
          address: '14, Cunningham Road, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.5946, latitude: 12.9716 }
        },
        {
          id: '4',
          name: 'NIMHANS Hospital',
          type: 'hospital',
          distance: 4.2,
          address: 'Hosur Road, Near Dairy Circle, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.5946, latitude: 12.9298 }
        },
        {
          id: '5',
          name: 'Bangalore City Police Station',
          type: 'police',
          distance: 1.5,
          address: 'KR Market, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.5946, latitude: 12.9716 }
        },
        {
          id: '6',
          name: 'Koramangala Police Station',
          type: 'police',
          distance: 2.8,
          address: '80 Feet Road, Koramangala, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.6271, latitude: 12.9279 }
        },
        {
          id: '7',
          name: 'Bangalore Fire Station - MG Road',
          type: 'fire',
          distance: 2.2,
          address: 'Mahatma Gandhi Road, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.6033, latitude: 12.9716 }
        },
        {
          id: '8',
          name: 'Karnataka Fire & Emergency Services',
          type: 'fire',
          distance: 3.1,
          address: 'Indiranagar, Bangalore',
          isOpen: true,
          coordinates: { longitude: 77.6412, latitude: 12.9784 }
        }
      ];
      
      setLocations(bangaloreLocations);
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
    <div className="min-h-screen relative bg-gray-900 overflow-hidden">
      {/* Full Screen Map */}
      <AmbulanceMap 
        className="absolute inset-0" 
        showControls={false}
        interactive={true}
        zoom={13}
      />
      
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      
      {/* Mobile-Optimized Top Section */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-2 px-3 safe-area-top">
        <AnimatedContainer className="space-y-3">
          {/* Compact Header */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/home')}
              className="p-2.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-base font-bold text-white drop-shadow-lg truncate px-2">Emergency Services</h1>
            <button
              onClick={toggleTracking}
              className={`p-2.5 rounded-full backdrop-blur-sm shadow-lg active:scale-95 transition-all duration-200 ${
                isTracking ? 'bg-green-500/90 text-white' : 'bg-white/90 text-gray-600'
              }`}
            >
              {isTracking ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search in Bangalore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 placeholder-gray-500 text-sm"
            />
            <button
              onClick={handleGetCurrentLocation}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors active:scale-95"
            >
              <Locate className="h-4 w-4" />
            </button>
          </div>
          
          {/* Mobile Filter Chips */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {filterData.map((filter) => {
              const isActive = selectedFilters.includes(filter.id);
              const IconComponent = filter.icon;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 shadow-md text-xs font-medium min-w-max ${
                    isActive 
                      ? `${filter.activeColor} shadow-lg` 
                      : 'bg-white/90 text-gray-700'
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5 mr-1.5" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </AnimatedContainer>
      </div>
      
      {/* Mobile Floating Action Button */}
      <div className="absolute bottom-28 right-4 z-20">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="p-4 rounded-full bg-primary shadow-2xl text-white active:scale-95 transition-all duration-200 transform hover:shadow-3xl">
              <PanelLeft className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] bg-white/95 backdrop-blur-sm rounded-t-3xl border-t-0">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-lg">Emergency Services - Bangalore</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 overflow-y-auto h-full pb-6">
              {/* Active Ambulances - Mobile Optimized */}
              {isTracking && ambulanceLocations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center sticky top-0 bg-white/90 backdrop-blur-sm py-2 -mx-4 px-4 z-10">
                    <Ambulance className="h-4 w-4 mr-2 text-blue-600" />
                    Live Ambulances
                  </h3>
                  {ambulanceLocations.map((amb, index) => (
                    <Card key={amb.id} className="overflow-hidden shadow-sm border-0 bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Ambulance className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm truncate">{amb.name}</h4>
                              <p className="text-xs text-gray-600 truncate">
                                {amb.status === 'enroute' ? 'En route to patient' : 
                                 amb.status === 'dispatched' ? 'Dispatched' : 
                                 amb.status === 'arrived' ? 'Arrived at scene' : 
                                 'Waiting for dispatch'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <StatusBadge status={amb.status as any} />
                            {amb.eta && amb.eta > 0 && (
                              <p className="text-sm font-bold text-gray-800 mt-1">
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
              
              {/* Emergency Services - Mobile Optimized */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800 flex items-center sticky top-0 bg-white/90 backdrop-blur-sm py-2 -mx-4 px-4 z-10">
                  <Hospital className="h-4 w-4 mr-2 text-green-600" />
                  Emergency Services
                </h3>
                {locations.filter(location => 
                  selectedFilters.includes(location.type) && 
                  (searchQuery === '' || location.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map((location, index) => (
                  <Card key={location.id} className="overflow-hidden shadow-sm border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            location.type === 'hospital' ? 'bg-green-100' : 
                            location.type === 'police' ? 'bg-blue-100' : 'bg-orange-100'
                          }`}>
                            {location.type === 'hospital' && <Hospital className="h-5 w-5 text-green-600" />}
                            {location.type === 'police' && <ShieldIcon className="h-5 w-5 text-blue-600" />}
                            {location.type === 'fire' && <FlameIcon className="h-5 w-5 text-orange-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{location.name}</h4>
                            <p className="text-xs text-gray-600 flex items-center truncate">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{location.address}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-800">{location.distance.toFixed(1)} km</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            location.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {location.isOpen ? '24/7' : 'Closed'}
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
      
      {/* Mobile Location FAB */}
      <div className="absolute bottom-28 left-4 z-20">
        <button
          onClick={handleGetCurrentLocation}
          className="p-3 rounded-full bg-white/95 backdrop-blur-sm shadow-xl text-gray-700 active:scale-95 transition-all duration-200"
        >
          <Locate className="h-5 w-5" />
        </button>
      </div>
      
      {/* Mobile Live Tracking Widget */}
      {isTracking && getActiveAmbulanceData && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <span className="text-sm font-medium">
              Live • ETA {getActiveAmbulanceData.eta} min
            </span>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default MapScreen;
