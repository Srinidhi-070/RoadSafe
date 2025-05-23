
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageCircle, Shield, MapPin, Users, ArrowRight, Hospital, Plus, Bell, FileText } from 'lucide-react';
import ActionCard from '@/components/ActionCard';
import EmergencyButton from '@/components/EmergencyButton';
import AnimatedContainer from '@/components/AnimatedContainer';
import StatusBadge from '@/components/StatusBadge';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';
import MapboxMap, { MapLocation } from '@/components/MapboxMap';
import { useMapboxAmbulanceTracking } from '@/hooks/useMapboxAmbulanceTracking';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reports } = useEmergency();
  const { theme } = useTheme();
  const [showWelcome, setShowWelcome] = useState(true);

  // Get the most recent report
  const latestReport = reports.length > 0 
    ? reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    : null;
  
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  
  // Use the Mapbox ambulance tracking hook
  const { ambulanceLocations, userLocation } = useMapboxAmbulanceTracking(false);
  
  // Update map locations when user location changes
  useEffect(() => {
    if (!userLocation) return;
    
    const newLocations: MapLocation[] = [
      {
        id: 'user',
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        type: 'user',
        name: 'Your Location'
      }
    ];
    
    // Add ambulances if available
    if (ambulanceLocations && ambulanceLocations.length > 0) {
      newLocations.push(...ambulanceLocations);
    }
    
    // Add latest accident report if exists
    if (latestReport) {
      newLocations.push({
        id: latestReport.id,
        longitude: latestReport.location.lng,
        latitude: latestReport.location.lat,
        type: 'accident',
        name: 'Your Recent Accident'
      });
    }
    
    setMapLocations(newLocations);
  }, [userLocation, ambulanceLocations, latestReport]);

  const quickActions = [
    {
      title: 'Emergency',
      description: 'Get immediate help',
      icon: <Plus className="h-5 w-5" />,
      onClick: () => navigate('/emergency'),
      color: 'purple',
      className: 'h-40'
    },
    {
      title: 'First Aid Guide',
      description: 'Step-by-step instructions',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: () => navigate('/chat'),
      color: 'teal',
      className: 'h-40'
    },
    {
      title: 'Nearby Hospitals',
      description: 'Find medical facilities',
      icon: <Hospital className="h-5 w-5" />,
      onClick: () => navigate('/map'),
      color: 'peach',
      className: 'h-40'
    },
    {
      title: 'Report Accident',
      description: 'Document and submit details',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => navigate('/report'),
      color: 'orange',
      className: 'h-40'
    }
  ];
  
  const updates = [
    {
      title: 'Emergency case: Vehicle collision on Main St',
      time: '25 minutes ago'
    },
    {
      title: 'System update: AI detection improved by 15%',
      time: '1 hour ago'
    },
    {
      title: 'Weather alert: Heavy rain expected',
      time: '2 hours ago'
    }
  ];

  // Dynamically adjust background and text colors based on theme
  const bgClass = theme === 'dark' 
    ? 'bg-gradient-to-b from-gray-900 to-gray-950' 
    : 'bg-gradient-to-b from-indigo-50 to-blue-100';
  
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBgClass = theme === 'dark' 
    ? 'bg-gray-800/30 backdrop-blur-sm' 
    : 'bg-white/70 backdrop-blur-sm';
  const headerBgClass = theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600';

  return (
    <div className={`min-h-screen pt-6 pb-20 px-4 ${bgClass}`}>
      {/* Header with logo and notification */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${headerBgClass}`}>RoadSafe</h1>
        <button className={`p-2 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/50'} rounded-full`}>
          <Bell className={`h-5 w-5 ${textClass}`} />
        </button>
      </div>
      
      {/* Quick action cards in grid layout */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <AnimatedContainer 
            key={action.title} 
            animation="fade-in" 
            delay={300 + (index * 100)}
            className={action.className}
          >
            <ActionCard 
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              className={`h-full shadow-md ${
                theme === 'dark' ? (
                  index === 0 ? 'bg-indigo-500/80' : 
                  index === 1 ? 'bg-teal-500/80' : 
                  index === 2 ? 'bg-orange-400/80' : 
                  index === 3 ? 'bg-amber-500/80' :
                  'bg-white/10 backdrop-blur-sm'
                ) : (
                  index === 0 ? 'bg-indigo-400' : 
                  index === 1 ? 'bg-teal-400' : 
                  index === 2 ? 'bg-orange-300' : 
                  index === 3 ? 'bg-amber-400' :
                  'bg-white/80 backdrop-blur-sm'
                )
              }`}
              variant={index === 3 ? 'default' : 'default'}
            />
          </AnimatedContainer>
        ))}
      </div>
      
      {/* Stats section - Replacing the accident-free card with something more relevant */}
      <div className="flex justify-between mb-8">
        <div className={`${cardBgClass} p-4 rounded-xl flex-1 mr-2`}>
          <div className={`${mutedTextClass} text-sm`}>Available Emergency Services</div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>3 nearby</div>
        </div>
        <div className={`${cardBgClass} p-4 rounded-xl flex-1 ml-2`}>
          <div className={`${mutedTextClass} text-sm`}>Ambulance response time</div>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>5 min</div>
        </div>
      </div>
      
      {/* Live updates section */}
      <div className="mb-8">
        <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Live Updates</h2>
        <div className="space-y-3">
          {updates.map((update, index) => (
            <div key={index} className={`${cardBgClass} p-4 rounded-xl`}>
              <div className={`text-sm ${mutedTextClass}`}>{update.time}</div>
              <div className={textClass}>{update.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest report if exists - with Mapbox map */}
      {latestReport && (
        <AnimatedContainer animation="fade-in" delay={200} className="mb-8">
          <Card className={`border-none shadow-md ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/10' 
              : 'bg-gradient-to-r from-yellow-100 to-orange-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-medium text-lg ${textClass}`}>Latest Accident Report</h3>
                <StatusBadge status={latestReport.severity} />
              </div>
              <div className={`text-sm ${mutedTextClass} mb-3`}>
                {latestReport.timestamp.toLocaleString()}
              </div>
              
              {/* Add Mapbox map with accident location */}
              {userLocation && (
                <div className="mb-3">
                  <MapboxMap 
                    className="h-32 mb-2 rounded-md overflow-hidden"
                    locations={mapLocations}
                    centerLocation={userLocation}
                    zoom={11}
                    interactive={false}
                    lazy={true}
                  />
                </div>
              )}
              
              <div className={`mb-4 ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>
                {latestReport.description || 'No description provided.'}
              </div>
              <button 
                className={`flex items-center text-sm ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}
                onClick={() => navigate(`/report/${latestReport.id}`)}
              >
                View details <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}
    </div>
  );
};

export default Index;
