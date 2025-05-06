
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Phone, Info, Locate, AlertTriangle } from 'lucide-react';

interface EmergencyContact {
  country: string;
  code: string;
  number: string;
  ambulance?: string;
  police?: string;
  fire?: string;
}

// Common emergency numbers by country
const emergencyNumbers: EmergencyContact[] = [
  { country: 'United States', code: 'US', number: '911' },
  { country: 'United Kingdom', code: 'GB', number: '999', ambulance: '999', police: '999', fire: '999' },
  { country: 'Australia', code: 'AU', number: '000', ambulance: '000', police: '000', fire: '000' },
  { country: 'Canada', code: 'CA', number: '911' },
  { country: 'New Zealand', code: 'NZ', number: '111', ambulance: '111', police: '111', fire: '111' },
  { country: 'India', code: 'IN', number: '112', ambulance: '108', police: '100', fire: '101' },
  { country: 'China', code: 'CN', number: '120', ambulance: '120', police: '110', fire: '119' },
  { country: 'Japan', code: 'JP', number: '119', ambulance: '119', police: '110', fire: '119' },
  { country: 'Germany', code: 'DE', number: '112', ambulance: '112', police: '110', fire: '112' },
  { country: 'France', code: 'FR', number: '112', ambulance: '15', police: '17', fire: '18' },
  { country: 'Italy', code: 'IT', number: '112', ambulance: '118', police: '113', fire: '115' },
  { country: 'Spain', code: 'ES', number: '112', ambulance: '112', police: '091', fire: '080' },
  { country: 'Brazil', code: 'BR', number: '192', ambulance: '192', police: '190', fire: '193' },
  { country: 'Russia', code: 'RU', number: '112', ambulance: '103', police: '102', fire: '101' },
  { country: 'South Africa', code: 'ZA', number: '10111', ambulance: '10177', police: '10111', fire: '10177' },
  { country: 'Mexico', code: 'MX', number: '911' },
  // Default fallback
  { country: 'International', code: 'INTL', number: '112' }
];

const EmergencyContacts: React.FC = () => {
  const [localEmergency, setLocalEmergency] = useState<EmergencyContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function detectLocation() {
      try {
        // Try to get precise location first
        if (navigator.geolocation) {
          setIsLoading(true);
          
          navigator.geolocation.getCurrentPosition(
            async position => {
              try {
                const { latitude, longitude } = position.coords;
                
                // Use reverse geocoding to get country info
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                );
                
                if (response.ok) {
                  const data = await response.json();
                  const countryCode = data.address?.country_code?.toUpperCase() || 'INTL';
                  
                  // Find matching emergency number
                  const emergency = emergencyNumbers.find(e => e.code === countryCode) || 
                                   emergencyNumbers.find(e => e.code === 'INTL')!;
                  
                  setLocalEmergency(emergency);
                } else {
                  // Fallback to general emergency number
                  setLocalEmergency(emergencyNumbers.find(e => e.code === 'INTL')!);
                }
              } catch (error) {
                console.error("Error detecting location:", error);
                // Fallback to general emergency number
                setLocalEmergency(emergencyNumbers.find(e => e.code === 'INTL')!);
              } finally {
                setIsLoading(false);
              }
            },
            error => {
              console.error("Geolocation error:", error);
              // Fallback to general emergency number
              setLocalEmergency(emergencyNumbers.find(e => e.code === 'INTL')!);
              setIsLoading(false);
            },
            { timeout: 5000, enableHighAccuracy: false }
          );
        } else {
          // Fallback for browsers without geolocation
          setLocalEmergency(emergencyNumbers.find(e => e.code === 'INTL')!);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Location detection failed:", error);
        setLocalEmergency(emergencyNumbers.find(e => e.code === 'INTL')!);
        setIsLoading(false);
      }
    }

    detectLocation();
  }, []);

  const handleEmergencyCall = () => {
    if (localEmergency) {
      toast.info(`Calling emergency number: ${localEmergency.number}`);
      window.location.href = `tel:${localEmergency.number}`;
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="bg-card animate-pulse p-4 rounded-lg">
          <div className="h-6 w-2/3 bg-muted rounded mb-2"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      ) : localEmergency ? (
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-danger/10 p-3 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-danger mr-2" />
              <h3 className="font-medium">Local Emergency Services</h3>
            </div>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-2 text-sm text-muted-foreground">
              {localEmergency.country}
            </div>
            
            <button
              onClick={handleEmergencyCall}
              className="w-full py-3 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md flex items-center justify-center font-medium transition-colors"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Emergency: {localEmergency.number}
            </button>
            
            {showDetails && (
              <div className="mt-4 pt-4 border-t text-sm space-y-2">
                <h4 className="font-medium mb-2">Specific services:</h4>
                {localEmergency.ambulance && (
                  <div className="flex justify-between">
                    <span>Ambulance</span>
                    <a href={`tel:${localEmergency.ambulance}`} className="text-primary">
                      {localEmergency.ambulance}
                    </a>
                  </div>
                )}
                {localEmergency.police && (
                  <div className="flex justify-between">
                    <span>Police</span>
                    <a href={`tel:${localEmergency.police}`} className="text-primary">
                      {localEmergency.police}
                    </a>
                  </div>
                )}
                {localEmergency.fire && (
                  <div className="flex justify-between">
                    <span>Fire</span>
                    <a href={`tel:${localEmergency.fire}`} className="text-primary">
                      {localEmergency.fire}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">
            Unable to determine local emergency number.
            Default emergency: <strong>112</strong> (international)
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
