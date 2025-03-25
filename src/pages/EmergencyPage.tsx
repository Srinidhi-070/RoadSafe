
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEmergency } from '@/contexts/EmergencyContext';
import AnimatedContainer from '@/components/AnimatedContainer';
import { Card, CardContent } from '@/components/ui/card';

const EmergencyPage = () => {
  const navigate = useNavigate();
  const { contacts, createReport } = useEmergency();
  const [isContacting, setIsContacting] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [emergencyStatus, setEmergencyStatus] = useState('initializing');

  useEffect(() => {
    // Simulate emergency services being contacted
    if (isContacting) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsContacting(false);
            setEmergencyStatus('contacting');
            // Simulate creating an emergency report
            handleCreateEmergencyReport();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isContacting]);

  const handleCreateEmergencyReport = async () => {
    try {
      // Create a report with default severe status
      await createReport({
        location: {
          lat: 37.7749, // Default location (can be replaced with actual geolocation)
          lng: -122.4194
        },
        severity: 'severe',
        description: 'Emergency button activated by user',
      });
      
      setEmergencyStatus('dispatched');
    } catch (error) {
      console.error('Failed to create emergency report:', error);
      setEmergencyStatus('failed');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-6 pb-20 px-4 bg-gradient-to-b from-background to-background/80">
      <AnimatedContainer animation="fade-in" className="mb-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="p-0 mr-2" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Emergency Response</h1>
        </div>
      </AnimatedContainer>

      {/* Status alert */}
      <AnimatedContainer animation="scale-in" className="mb-8">
        <Alert variant="destructive" className="border-emergency bg-emergency/10 shadow-md">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-emergency font-bold text-lg">
            Emergency Assistance Requested
          </AlertTitle>
          <AlertDescription className="mt-2">
            {isContacting ? (
              <span className="text-base">Contacting emergency services in <span className="font-bold text-emergency">{countdown}</span> seconds...</span>
            ) : emergencyStatus === 'contacting' ? (
              <span className="text-base">Contacting emergency services...</span>
            ) : emergencyStatus === 'dispatched' ? (
              <span className="text-base">Emergency services have been notified and are on the way!</span>
            ) : (
              <span className="text-base">Failed to contact emergency services. Please try calling directly.</span>
            )}
          </AlertDescription>
        </Alert>
      </AnimatedContainer>

      {/* Emergency actions */}
      <AnimatedContainer animation="fade-in" delay={200} className="space-y-5 mb-8">
        <h2 className="text-xl font-semibold mb-3">Emergency Contacts</h2>
        
        {/* Default emergency services */}
        <Card className="border-none shadow-lg bg-card hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-emergency/15 rounded-full p-3 mr-4">
                  <Phone className="h-6 w-6 text-emergency" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Emergency Services</h3>
                  <p className="text-sm text-muted-foreground">911</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-emergency text-emergency hover:bg-emergency/10 font-medium"
                onClick={() => window.open('tel:911')}
              >
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* User's emergency contacts */}
        {contacts.map((contact) => (
          <Card 
            key={contact.id}
            className="border-none shadow-lg bg-card hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-primary/15 rounded-full p-3 mr-4">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="font-medium"
                  onClick={() => window.open(`tel:${contact.phone}`)}
                >
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </AnimatedContainer>

      {/* Cancel button */}
      {isContacting && (
        <AnimatedContainer animation="fade-in" delay={300}>
          <Button 
            variant="outline" 
            className="w-full border-destructive text-destructive text-base py-6 shadow-md"
            onClick={handleCancel}
          >
            Cancel Emergency
          </Button>
        </AnimatedContainer>
      )}
    </div>
  );
};

export default EmergencyPage;
