
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEmergency } from '@/contexts/EmergencyContext';
import AnimatedContainer from '@/components/AnimatedContainer';

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
    <div className="min-h-screen pt-6 pb-20 px-4 bg-background">
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
      <AnimatedContainer animation="scale-in" className="mb-6">
        <Alert variant="destructive" className="border-emergency bg-emergency/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-emergency font-bold">
            Emergency Assistance Requested
          </AlertTitle>
          <AlertDescription>
            {isContacting ? (
              <span>Contacting emergency services in {countdown} seconds...</span>
            ) : emergencyStatus === 'contacting' ? (
              <span>Contacting emergency services...</span>
            ) : emergencyStatus === 'dispatched' ? (
              <span>Emergency services have been notified and are on the way!</span>
            ) : (
              <span>Failed to contact emergency services. Please try calling directly.</span>
            )}
          </AlertDescription>
        </Alert>
      </AnimatedContainer>

      {/* Emergency actions */}
      <AnimatedContainer animation="fade-in" delay={200} className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold">Emergency Contacts</h2>
        
        {/* Default emergency services */}
        <div className="bg-card rounded-lg border p-4 flex items-center justify-between hover:bg-card/80 transition-colors">
          <div className="flex items-center">
            <div className="bg-emergency/10 rounded-full p-3 mr-3">
              <Phone className="h-5 w-5 text-emergency" />
            </div>
            <div>
              <h3 className="font-medium">Emergency Services</h3>
              <p className="text-sm text-muted-foreground">911</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-emergency text-emergency hover:bg-emergency/10"
            onClick={() => window.open('tel:911')}
          >
            Call
          </Button>
        </div>
        
        {/* User's emergency contacts */}
        {contacts.map((contact) => (
          <div 
            key={contact.id}
            className="bg-card rounded-lg border p-4 flex items-center justify-between hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-primary/10 rounded-full p-3 mr-3">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">{contact.relationship}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`tel:${contact.phone}`)}
            >
              Call
            </Button>
          </div>
        ))}
      </AnimatedContainer>

      {/* Cancel button */}
      {isContacting && (
        <AnimatedContainer animation="fade-in" delay={300}>
          <Button 
            variant="outline" 
            className="w-full border-destructive text-destructive"
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
