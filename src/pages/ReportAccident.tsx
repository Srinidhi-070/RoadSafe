
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Upload, Check, Loader2, Brain } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import StatusBadge from '@/components/StatusBadge';
import AnimatedContainer from '@/components/AnimatedContainer';
import AiEmergencyAnalysis from '@/components/AiEmergencyAnalysis';
import { useEmergency } from '@/contexts/EmergencyContext';
import { enhancedAiService } from '@/services/EnhancedAiService';
import { toast } from 'sonner';

const ReportAccident = () => {
  const navigate = useNavigate();
  const { createReport } = useEmergency();
  
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    severity: 'minor' | 'moderate' | 'severe';
    recommendedServices: string[];
    immediateActions: string[];
    confidence: number;
    description: string;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleImageSelect = (file: File) => {
    setImage(file);
    setAnalysisResult(null);
  };
  
  const analyzeImage = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    
    try {
      // Convert image to base64 for analysis
      const reader = new FileReader();
      reader.readAsDataURL(image);
      
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
      });
      
      // Use enhanced AI service for analysis
      const analysis = await enhancedAiService.analyzeEmergencyImage(imageBase64);
      setAnalysisResult(analysis);
      
      toast.success('AI analysis completed');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSubmitReport = async () => {
    if (!image || !analysisResult) {
      toast.error('Please upload and analyze an image first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(image);
      
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
      });
      
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setUserLocation(location);
      
      const reportId = await createReport({
        location,
        severity: analysisResult.severity,
        description: description || analysisResult.description,
        images: [imageBase64]
      });
      
      toast.success('Emergency report submitted successfully');
      navigate(`/report/${reportId}`);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-6 pb-20 px-4">
      {/* Header */}
      <AnimatedContainer className="mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/home')}
            className="mr-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">AI-Enhanced Emergency Report</h1>
            <p className="text-sm text-muted-foreground">Advanced AI analysis for accurate emergency response</p>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Instructions */}
      <AnimatedContainer animation="fade-in" delay={100} className="mb-6">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border">
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Enhanced AI Analysis</p>
              <p className="text-xs text-muted-foreground">
                Our advanced AI will analyze your emergency image to determine severity, recommend appropriate services, and provide immediate action guidance.
              </p>
            </div>
          </div>
        </div>
      </AnimatedContainer>
      
      {/* Image upload */}
      <AnimatedContainer animation="fade-in" delay={200} className="mb-6">
        <div className="space-y-4">
          <h2 className="font-medium">Emergency Scene Image</h2>
          <ImageUploader 
            onImageSelect={handleImageSelect}
            className="min-h-48"
          />
          
          {image && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-70 shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing with Advanced AI...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Analyze with Enhanced AI
                </>
              )}
            </button>
          )}
        </div>
      </AnimatedContainer>
      
      {/* AI Analysis Results */}
      {analysisResult && (
        <AnimatedContainer animation="scale-in" className="mb-6">
          <AiEmergencyAnalysis 
            analysis={analysisResult} 
            location={userLocation || undefined}
          />
        </AnimatedContainer>
      )}
      
      {/* Description */}
      <AnimatedContainer animation="fade-in" delay={300} className="mb-8">
        <div className="space-y-2">
          <label htmlFor="description" className="font-medium">
            Additional Details (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the emergency situation, any injuries, or other important details..."
            className="w-full min-h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </AnimatedContainer>
      
      {/* Submit button */}
      <AnimatedContainer animation="fade-in" delay={400}>
        <button
          onClick={handleSubmitReport}
          disabled={!image || !analysisResult || isSubmitting}
          className="w-full flex items-center justify-center bg-gradient-to-r from-emergency to-emergency/80 hover:from-emergency/90 hover:to-emergency/70 text-emergency-foreground py-4 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-70 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting Emergency Report...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Submit AI-Enhanced Report
            </>
          )}
        </button>
      </AnimatedContainer>
    </div>
  );
};

export default ReportAccident;
