
import { getAiResponse } from './AiChatService';

interface EmergencyAnalysis {
  severity: 'minor' | 'moderate' | 'severe';
  recommendedServices: string[];
  immediateActions: string[];
  confidence: number;
  description: string;
}

interface LocationContext {
  lat: number;
  lng: number;
  address?: string;
}

export class EnhancedAiService {
  private static instance: EnhancedAiService;
  private apiKey: string = '';

  static getInstance(): EnhancedAiService {
    if (!EnhancedAiService.instance) {
      EnhancedAiService.instance = new EnhancedAiService();
    }
    return EnhancedAiService.instance;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeEmergencyImage(imageData: string): Promise<EmergencyAnalysis> {
    try {
      // Simulate advanced AI image analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock advanced analysis - in real implementation, this would use computer vision AI
      const severities: ('minor' | 'moderate' | 'severe')[] = ['minor', 'moderate', 'severe'];
      const randomSeverity = severities[Math.floor(Math.random() * 3)];
      
      const serviceRecommendations = this.getServiceRecommendations(randomSeverity);
      const immediateActions = this.getImmediateActions(randomSeverity);
      
      return {
        severity: randomSeverity,
        recommendedServices: serviceRecommendations,
        immediateActions: immediateActions,
        confidence: Math.round((0.75 + Math.random() * 0.2) * 100) / 100,
        description: this.generateAnalysisDescription(randomSeverity)
      };
    } catch (error) {
      console.error('Error analyzing emergency image:', error);
      throw new Error('Failed to analyze emergency image');
    }
  }

  async getEmergencyGuidance(situation: string, location?: LocationContext): Promise<string> {
    try {
      const locationContext = location ? 
        `Location: ${location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}. ` : '';
      
      const prompt = `${locationContext}Emergency situation: ${situation}. Provide immediate first aid guidance and emergency response steps.`;
      
      if (this.apiKey) {
        return await getAiResponse(prompt, this.apiKey);
      } else {
        // Fallback guidance
        return this.getFallbackGuidance(situation);
      }
    } catch (error) {
      console.error('Error getting emergency guidance:', error);
      return this.getFallbackGuidance(situation);
    }
  }

  async recommendNearbyServices(location: LocationContext, emergencyType: string): Promise<string[]> {
    // This would integrate with the map services
    const baseServices = ['Hospital', 'Police Station', 'Fire Department'];
    
    switch (emergencyType.toLowerCase()) {
      case 'medical':
        return ['Nearest Hospital', 'Emergency Medical Services', 'Pharmacy'];
      case 'fire':
        return ['Fire Department', 'Emergency Services', 'Hospital'];
      case 'crime':
        return ['Police Station', 'Emergency Services', 'Safe Location'];
      default:
        return baseServices;
    }
  }

  private getServiceRecommendations(severity: string): string[] {
    switch (severity) {
      case 'severe':
        return ['Ambulance', 'Police', 'Fire Department', 'Hospital'];
      case 'moderate':
        return ['Ambulance', 'Police', 'Hospital'];
      case 'minor':
        return ['Police', 'Medical Services'];
      default:
        return ['Emergency Services'];
    }
  }

  private getImmediateActions(severity: string): string[] {
    switch (severity) {
      case 'severe':
        return [
          'Call emergency services immediately',
          'Ensure scene safety',
          'Check for injuries',
          'Provide first aid if trained',
          'Clear traffic if safe to do so'
        ];
      case 'moderate':
        return [
          'Call emergency services',
          'Check for injuries',
          'Move to safety if possible',
          'Document the scene'
        ];
      case 'minor':
        return [
          'Ensure everyone is safe',
          'Document the incident',
          'Exchange information if applicable',
          'Contact insurance if needed'
        ];
      default:
        return ['Assess the situation', 'Call for help if needed'];
    }
  }

  private generateAnalysisDescription(severity: string): string {
    switch (severity) {
      case 'severe':
        return 'Severe emergency detected. Multiple emergency services may be required. Immediate professional response recommended.';
      case 'moderate':
        return 'Moderate emergency detected. Professional assessment and response recommended.';
      case 'minor':
        return 'Minor incident detected. Standard reporting and documentation may be sufficient.';
      default:
        return 'Emergency situation detected. Professional assessment recommended.';
    }
  }

  private getFallbackGuidance(situation: string): string {
    return `Emergency guidance for: ${situation}\n\n1. Ensure your safety first\n2. Call emergency services if needed\n3. Provide first aid if trained\n4. Stay calm and follow emergency protocols\n\nFor specific medical emergencies, always consult with emergency services immediately.`;
  }
}

export const enhancedAiService = EnhancedAiService.getInstance();
