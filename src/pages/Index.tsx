
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageCircle, Shield, MapPin, Users, ArrowRight, Hospital } from 'lucide-react';
import ActionCard from '@/components/ActionCard';
import EmergencyButton from '@/components/EmergencyButton';
import AnimatedContainer from '@/components/AnimatedContainer';
import StatusBadge from '@/components/StatusBadge';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import MapView, { Location as MapLocation } from '@/components/MapView';
import { useAmbulanceTracking } from '@/hooks/useAmbulanceTracking';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reports } = useEmergency();
  const [showWelcome, setShowWelcome] = useState(true);

  // Get the most recent report
  const latestReport = reports.length > 0 
    ? reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    : null;
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<{
    id: string;
    name: string;
    distance: number;
    lat: number;
    lng: number;
  }[]>([]);
  
  // Use the ambulance tracking hook to get ambulance locations
  const { ambulanceLocations } = useAmbulanceTracking(false);
  
  // Get user location for map - with a fallback to avoid delay
  useEffect(() => {
    // Set default location immediately to prevent UI delay
    const defaultLocation = { 
      lat: 40.7128, 
      lng: -74.0060 
    };
    
    setUserLocation(defaultLocation);
    
    // Then try to get the actual location
    if (navigator.geolocation) {
      const timeoutId = setTimeout(() => {
        if (!userLocation || (userLocation.lat === defaultLocation.lat && userLocation.lng === defaultLocation.lng)) {
          toast.info("Using approximate location. Precise location still loading...");
        }
      }, 1000);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          clearTimeout(timeoutId);
          toast.error("Could not get your precise location. Using default.");
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
      
      return () => clearTimeout(timeoutId);
    }
  }, []);
  
  // Generate nearby hospitals when user location changes - do this asynchronously
  useEffect(() => {
    if (!userLocation) return;
    
    // Generate hospitals with a small timeout to not block rendering
    const generateHospitalsAsync = () => {
      setTimeout(() => {
        const hospitals = [
          {
            id: 'h1',
            name: 'City General Hospital',
            distance: 1.2,
            lat: userLocation.lat + 0.01,
            lng: userLocation.lng - 0.005
          },
          {
            id: 'h2',
            name: 'Mercy Medical Center',
            distance: 2.5,
            lat: userLocation.lat - 0.008,
            lng: userLocation.lng + 0.012
          },
          {
            id: 'h3',
            name: 'Community Health Hospital',
            distance: 3.7,
            lat: userLocation.lat + 0.015,
            lng: userLocation.lng + 0.008
          }
        ];
        
        setNearbyHospitals(hospitals);
      }, 100);
    };
    
    generateHospitalsAsync();
  }, [userLocation]);
  
  // Update map locations when user location or nearby hospitals change
  useEffect(() => {
    if (!userLocation) return;
    
    const newLocations: MapLocation[] = [
      {
        id: 'user',
        lat: userLocation.lat,
        lng: userLocation.lng,
        type: 'user',
        name: 'Your Location'
      }
    ];
    
    // Add nearby hospitals to map
    if (nearbyHospitals.length > 0) {
      nearbyHospitals.forEach(hospital => {
        newLocations.push({
          id: hospital.id,
          lat: hospital.lat,
          lng: hospital.lng,
          type: 'hospital',
          name: hospital.name
        });
      });
    }
    
    // Add ambulances if available
    if (ambulanceLocations.length > 0) {
      newLocations.push(...ambulanceLocations);
    }
    
    // Add latest accident report if exists
    if (latestReport) {
      newLocations.push({
        id: latestReport.id,
        lat: latestReport.location.lat,
        lng: latestReport.location.lng,
        type: 'accident',
        name: 'Your Recent Accident'
      });
    }
    
    setMapLocations(newLocations);
  }, [userLocation, nearbyHospitals, ambulanceLocations, latestReport]);

  const quickActions = [
    {
      title: 'Report Accident',
      description: 'Upload images and get AI analysis',
      icon: <AlertCircle className="h-5 w-5" />,
      onClick: () => navigate('/report'),
      color: 'red'
    },
    {
      title: 'First Aid Assistant',
      description: 'Get emergency medical guidance',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: () => navigate('/chat'),
      color: 'blue'
    },
    {
      title: 'Emergency Services',
      description: 'Contact police, ambulance or fire services',
      icon: <Shield className="h-5 w-5" />,
      onClick: () => navigate('/services'),
      color: 'purple'
    },
    {
      title: 'Nearby Hospitals',
      description: 'Find medical facilities near you',
      icon: <MapPin className="h-5 w-5" />,
      onClick: () => navigate('/map'),
      color: 'green'
    },
    {
      title: 'Emergency Contacts',
      description: 'Manage your emergency contacts',
      icon: <Users className="h-5 w-5" />,
      onClick: () => navigate('/profile'),
      color: 'teal'
    }
  ];

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 bg-gradient-to-b from-background to-background/80">
      {/* Welcome message */}
      {showWelcome && (
        <AnimatedContainer animation="fade-in" className="mb-6">
          <Card className="border-none shadow-md overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/10">
            <CardContent className="p-4 relative">
              <button 
                className="absolute top-2 right-2 text-primary" 
                onClick={() => setShowWelcome(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h2 className="font-semibold text-primary mb-1">Welcome to SmartCrash Assist</h2>
              <p className="text-sm text-primary/80">
                Your AI-powered companion for emergency situations. Report accidents, get first aid guidance, and connect to emergency services.
              </p>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {/* Header section */}
      <AnimatedContainer className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Hello, {user?.name || 'there'}
        </h1>
        <p className="text-muted-foreground">
          Smart emergency assistance at your fingertips
        </p>
      </AnimatedContainer>

      {/* Emergency button - Now much bigger */}
      <AnimatedContainer animation="scale-in" delay={100} className="mb-10 flex justify-center">
        <EmergencyButton 
          onClick={() => navigate('/emergency')}
          size="lg"
          className="w-40 h-40 text-xl font-bold"
        />
      </AnimatedContainer>

      {/* Latest report if exists */}
      {latestReport && (
        <AnimatedContainer animation="fade-in" delay={200} className="mb-8">
          <Card className="border-none shadow-md bg-gradient-to-r from-yellow-500/20 to-orange-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">Latest Accident Report</h3>
                <StatusBadge status={latestReport.severity} />
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {latestReport.timestamp.toLocaleString()}
              </div>
              
              {/* Add small map with accident location */}
              {userLocation && (
                <div className="mb-3">
                  <MapView 
                    className="h-32 mb-2 rounded-md overflow-hidden"
                    locations={mapLocations}
                    centerLocation={userLocation}
                    zoom={11}
                    interactive={false}
                  />
                </div>
              )}
              
              <div className="mb-4 text-foreground/90">
                {latestReport.description || 'No description provided.'}
              </div>
              <button 
                className="flex items-center text-sm text-primary font-medium"
                onClick={() => navigate(`/report/${latestReport.id}`)}
              >
                View details <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}
      
      {/* Map preview with nearby hospitals */}
      {!latestReport && (
        <AnimatedContainer animation="fade-in" delay={200} className="mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">Nearby Emergency Services</h3>
              </div>
              
              {userLocation && (
                <MapView 
                  className="h-40 mb-4 rounded-md overflow-hidden"
                  locations={mapLocations}
                  centerLocation={userLocation}
                  zoom={12}
                  interactive={false}
                />
              )}
              
              {/* Nearby Hospitals List - Load with minimal delay */}
              <div className="space-y-2 mb-3">
                <h4 className="text-sm font-medium flex items-center text-primary">
                  <Hospital className="h-4 w-4 mr-1" /> Nearby Hospitals
                </h4>
                <div className="space-y-2">
                  {nearbyHospitals.length > 0 ? (
                    nearbyHospitals.map(hospital => (
                      <div 
                        key={hospital.id} 
                        className="flex items-center justify-between p-2 bg-card border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                            <Hospital className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{hospital.name}</p>
                            <p className="text-xs text-muted-foreground">{hospital.distance.toFixed(1)} km away</p>
                          </div>
                        </div>
                        <button 
                          className="text-xs text-primary flex items-center"
                          onClick={() => navigate('/map')}
                        >
                          Directions <ArrowRight className="ml-1 h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-center">
                      <p className="text-sm text-muted-foreground">Loading nearby hospitals...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                className="flex items-center text-sm text-primary font-medium"
                onClick={() => navigate('/map')}
              >
                View all services <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {/* Quick actions */}
      <div className="space-y-4 mb-8">
        <AnimatedContainer animation="fade-in" delay={300}>
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quick Actions</h2>
        </AnimatedContainer>
        
        {quickActions.map((action, index) => (
          <AnimatedContainer 
            key={action.title} 
            animation="fade-in" 
            delay={400 + (index * 100)}
          >
            <ActionCard 
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              className="shadow-md"
              colorClass={action.color}
            />
          </AnimatedContainer>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
