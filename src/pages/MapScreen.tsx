
import React, { useState, useEffect, useMemo } from 'react';
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
    setSelectedFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const filterData = [
    { id: 'hospital', label: 'Hospitals', icon: Hospital, color: 'bg-emerald-500', activeColor: 'bg-emerald-500 text-white border-emerald-400' },
    { id: 'ambulance', label: 'Ambulances', icon: Ambulance, color: 'bg-blue-500', activeColor: 'bg-blue-500 text-white border-blue-400' },
    { id: 'police', label: 'Police', icon: ShieldIcon, color: 'bg-indigo-500', activeColor: 'bg-indigo-500 text-white border-indigo-400' },
    { id: 'fire', label: 'Fire Dept.', icon: FlameIcon, color: 'bg-orange-500', activeColor: 'bg-orange-500 text-white border-orange-400' }
  ];

  // Memoize filtered locations to prevent unnecessary re-renders
  const filteredLocations = useMemo(() => {
    return locations.filter(location => 
      selectedFilters.includes(location.type) && 
      (searchQuery === '' || location.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [locations, selectedFilters, searchQuery]);

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
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      
      {/* Android-Optimized Top Section */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-3 px-4 safe-area-top">
        <AnimatedContainer className="space-y-4">
          {/* Enhanced Header with Material Design elements */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/home')}
              className="p-3 rounded-full bg-white/95 backdrop-blur-sm shadow-lg active:scale-95 transition-all duration-200 touch-manipulation"
            >
              <ArrowLeft className="h-6 w-6 text-gray-800" />
            </button>
            <div className="flex-1 text-center px-4">
              <h1 className="text-lg font-bold text-white drop-shadow-lg">Emergency Services</h1>
              <p className="text-xs text-white/80 drop-shadow">Bangalore • Live Updates</p>
            </div>
            <button
              onClick={toggleTracking}
              className={`p-3 rounded-full backdrop-blur-sm shadow-lg active:scale-95 transition-all duration-200 touch-manipulation ${
                isTracking ? 'bg-emerald-500/90 text-white' : 'bg-white/90 text-gray-600'
              }`}
            >
              {isTracking ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Enhanced Search Bar with Android styling */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search emergency services in Bangalore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 placeholder-gray-500 text-base touch-manipulation"
            />
            <button
              onClick={handleGetCurrentLocation}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors active:scale-95 touch-manipulation"
            >
              <Locate className="h-5 w-5" />
            </button>
          </div>
          
          {/* Enhanced Filter Chips with Material Design */}
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {filterData.map((filter) => {
              const isActive = selectedFilters.includes(filter.id);
              const IconComponent = filter.icon;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center px-4 py-3 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 shadow-md text-sm font-medium min-w-max touch-manipulation border-2 ${
                    isActive 
                      ? `${filter.activeColor} shadow-lg scale-105` 
                      : 'bg-white/90 text-gray-700 border-white/50'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  <span>{filter.label}</span>
                  {isActive && (
                    <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {filter.id === 'ambulance' ? ambulanceLocations.length : 
                       filteredLocations.filter(l => l.type === filter.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </AnimatedContainer>
      </div>
      
      {/* Enhanced Floating Action Button */}
      <div className="absolute bottom-32 right-5 z-30">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="p-4 rounded-full bg-primary shadow-2xl text-white active:scale-95 transition-all duration-200 transform hover:shadow-3xl touch-manipulation">
              <PanelLeft className="h-7 w-7" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[88vh] bg-white/98 backdrop-blur-sm rounded-t-3xl border-t-0 z-50 pb-safe-bottom">
            <SheetHeader className="pb-6 pt-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <SheetTitle className="text-xl font-bold text-center">Emergency Services</SheetTitle>
              <p className="text-sm text-gray-600 text-center">Bangalore • {filteredLocations.length + ambulanceLocations.length} services available</p>
            </SheetHeader>
            <div className="space-y-6 overflow-y-auto h-full pb-32 px-1">
              {/* Active Ambulances - Enhanced for Android */}
              {isTracking && ambulanceLocations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm py-3 -mx-4 px-4 z-10 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                      Live Ambulances
                    </h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {ambulanceLocations.length} active
                    </span>
                  </div>
                  {ambulanceLocations.map((amb) => (
                    <Card key={amb.id} className="overflow-hidden shadow-md border-0 bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Ambulance className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-gray-800 text-base truncate">{amb.name}</h4>
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {amb.status === 'enroute' ? 'En route to patient' : 
                                 amb.status === 'dispatched' ? 'Dispatched' : 
                                 amb.status === 'arrived' ? 'Arrived at scene' : 
                                 'Waiting for dispatch'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col items-end">
                            <StatusBadge status={amb.status as any} />
                            {amb.eta && amb.eta > 0 && (
                              <p className="text-base font-bold text-gray-800 mt-2">
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
              
              {/* Emergency Services - Enhanced for Android */}
              <div className="space-y-4">
                <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm py-3 -mx-4 px-4 z-10 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Hospital className="h-5 w-5 mr-3 text-emerald-600" />
                    Emergency Services
                  </h3>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredLocations.length} found
                  </span>
                </div>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : filteredLocations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No services found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search</p>
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <Card key={location.id} className="overflow-hidden shadow-md border-0 bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              location.type === 'hospital' ? 'bg-emerald-100' : 
                              location.type === 'police' ? 'bg-indigo-100' : 'bg-orange-100'
                            }`}>
                              {location.type === 'hospital' && <Hospital className="h-6 w-6 text-emerald-600" />}
                              {location.type === 'police' && <ShieldIcon className="h-6 w-6 text-indigo-600" />}
                              {location.type === 'fire' && <FlameIcon className="h-6 w-6 text-orange-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 text-base truncate">{location.name}</h4>
                              <p className="text-sm text-gray-600 flex items-center truncate mt-1">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{location.address}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col items-end">
                            <p className="text-base font-bold text-gray-800">{location.distance.toFixed(1)} km</p>
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 font-medium ${
                              location.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {location.isOpen ? '24/7' : 'Closed'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Enhanced Location FAB */}
      <div className="absolute bottom-32 left-5 z-20">
        <button
          onClick={handleGetCurrentLocation}
          className="p-3 rounded-full bg-white/95 backdrop-blur-sm shadow-xl text-gray-700 active:scale-95 transition-all duration-200 touch-manipulation"
        >
          <Locate className="h-6 w-6" />
        </button>
      </div>
      
      {/* Enhanced Live Tracking Widget */}
      {isTracking && getActiveAmbulanceData && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-emerald-500 text-white px-5 py-3 rounded-full shadow-xl flex items-center space-x-3 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <span className="text-base font-bold">
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
