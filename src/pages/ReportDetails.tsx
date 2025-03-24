
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Phone, User, Ambulance } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import StatusBadge from '@/components/StatusBadge';
import MapView from '@/components/MapView';
import { useEmergency } from '@/contexts/EmergencyContext';
import { toast } from 'sonner';

const ReportDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReportById, getResponsesForReport } = useEmergency();
  
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoadingMap(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const report = id ? getReportById(id) : undefined;
  const responses = id ? getResponsesForReport(id) : [];
  
  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The accident report you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const callResponder = () => {
    const responder = responses[0]?.responderInfo;
    if (responder) {
      // In a real app, this would initiate a phone call
      toast.success(`Calling ${responder.name} at ${responder.contact}`);
    }
  };
  
  return (
    <div className="min-h-screen pt-6 pb-20 px-4">
      {/* Header */}
      <AnimatedContainer className="mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Accident Report</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {formatDate(report.timestamp)}
            </div>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Status section */}
      <AnimatedContainer animation="fade-in" delay={100} className="mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Accident Severity</div>
              <StatusBadge status={report.severity} className="text-sm py-1 px-3" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <StatusBadge status={report.status} className="text-sm py-1 px-3" />
            </div>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Map section */}
      <AnimatedContainer animation="fade-in" delay={200} className="mb-6">
        <div className="space-y-2">
          <h2 className="font-medium">Accident Location</h2>
          <MapView 
            className={`h-40 ${isLoadingMap ? 'animate-pulse' : ''}`}
            locations={[
              {
                id: report.id,
                lat: report.location.lat,
                lng: report.location.lng,
                type: 'accident'
              }
            ]}
            centerLocation={report.location}
          />
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            {report.location.address || 'Location coordinates recorded'}
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Description */}
      {report.description && (
        <AnimatedContainer animation="fade-in" delay={300} className="mb-6">
          <div className="space-y-2">
            <h2 className="font-medium">Description</h2>
            <div className="bg-muted p-3 rounded-lg text-sm">
              {report.description}
            </div>
          </div>
        </AnimatedContainer>
      )}
      
      {/* Emergency response section */}
      <AnimatedContainer animation="fade-in" delay={400} className="mb-8">
        <div className="space-y-4">
          <h2 className="font-medium">Emergency Response</h2>
          
          {responses.length > 0 ? (
            responses.map((response) => (
              <div key={response.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Ambulance className="h-5 w-5 mr-2 text-info" />
                    <span className="font-medium">
                      {response.responderType.charAt(0).toUpperCase() + response.responderType.slice(1)}
                    </span>
                  </div>
                  <StatusBadge status={response.status as any} />
                </div>
                
                {response.responderInfo && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{response.responderInfo.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{response.responderInfo.contact}</span>
                    </div>
                  </div>
                )}
                
                {response.eta !== undefined && (
                  <div className="bg-primary/10 rounded-md p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Estimated arrival in {response.eta} minutes
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-muted-foreground">
                Processing your emergency report...
              </div>
              <div className="mt-2 text-sm">
                Emergency services will be dispatched shortly.
              </div>
            </div>
          )}
        </div>
      </AnimatedContainer>
      
      {/* Action buttons */}
      {responses.length > 0 && responses[0].responderInfo && (
        <AnimatedContainer animation="scale-in" delay={500}>
          <button
            onClick={callResponder}
            className="w-full flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-lg font-medium transition-colors"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Responder
          </button>
        </AnimatedContainer>
      )}
    </div>
  );
};

export default ReportDetails;
