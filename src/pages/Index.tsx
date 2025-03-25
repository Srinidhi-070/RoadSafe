
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageCircle, Shield, MapPin, Users, ArrowRight } from 'lucide-react';
import ActionCard from '@/components/ActionCard';
import EmergencyButton from '@/components/EmergencyButton';
import AnimatedContainer from '@/components/AnimatedContainer';
import StatusBadge from '@/components/StatusBadge';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reports } = useEmergency();
  const [showWelcome, setShowWelcome] = useState(true);

  // Get the most recent report
  const latestReport = reports.length > 0 
    ? reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    : null;

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
