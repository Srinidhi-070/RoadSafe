
import React from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';

interface EmergencyAnalysis {
  severity: 'minor' | 'moderate' | 'severe';
  recommendedServices: string[];
  immediateActions: string[];
  confidence: number;
  description: string;
}

interface AiEmergencyAnalysisProps {
  analysis: EmergencyAnalysis;
  location?: { lat: number; lng: number; address?: string };
}

const AiEmergencyAnalysis: React.FC<AiEmergencyAnalysisProps> = ({ 
  analysis, 
  location 
}) => {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-success" />
            AI Emergency Analysis
          </CardTitle>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Confidence</div>
            <div className="font-bold">{Math.round(analysis.confidence * 100)}%</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Severity Assessment */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Severity Level:</span>
          <StatusBadge status={analysis.severity} />
        </div>
        
        {/* Description */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm">{analysis.description}</p>
        </div>
        
        {/* Location Info */}
        {location && (
          <div className="flex items-start space-x-3">
            <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Incident Location</div>
              <div className="text-xs text-muted-foreground truncate">
                {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              </div>
            </div>
          </div>
        )}
        
        {/* Recommended Services */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
            Recommended Emergency Services
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {analysis.recommendedServices.map((service, index) => (
              <div 
                key={index}
                className="bg-muted/30 rounded-md px-3 py-2 text-sm text-center font-medium"
              >
                {service}
              </div>
            ))}
          </div>
        </div>
        
        {/* Immediate Actions */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-info" />
            Immediate Actions Required
          </h4>
          <ul className="space-y-2">
            {analysis.immediateActions.map((action, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Severe Emergency Warning */}
        {analysis.severity === 'severe' && (
          <div className="bg-emergency/10 border border-emergency/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-emergency flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-emergency mb-1">Critical Emergency Detected</div>
                <p className="text-sm text-emergency/80">
                  This appears to be a severe emergency requiring immediate professional response. 
                  Emergency services dispatch is highly recommended.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiEmergencyAnalysis;
