
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Upload, Check, Loader2 } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import StatusBadge from '@/components/StatusBadge';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useEmergency } from '@/contexts/EmergencyContext';
import { toast } from 'sonner';

const ReportAccident = () => {
  const navigate = useNavigate();
  const { createReport } = useEmergency();
  
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    severity: 'minor' | 'moderate' | 'severe';
    confidence: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleImageSelect = (file: File) => {
    setImage(file);
    setAnalysisResult(null);
  };
  
  const analyzeImage = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result for demo
      const mockSeverities: ('minor' | 'moderate' | 'severe')[] = ['minor', 'moderate', 'severe'];
      const mockResult = {
        severity: mockSeverities[Math.floor(Math.random() * 3)],
        confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100 // Between 0.7 and 0.95
      };
      
      setAnalysisResult(mockResult);
      toast.success('Image analysis completed');
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
      
      // Use browser geolocation API to get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const reportId = await createReport({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        severity: analysisResult.severity,
        description,
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
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Report Accident</h1>
        </div>
      </AnimatedContainer>
      
      {/* Instructions */}
      <AnimatedContainer animation="fade-in" delay={100} className="mb-6">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm">
            Upload an image of the accident scene. Our AI will analyze the severity and help coordinate emergency response.
          </p>
        </div>
      </AnimatedContainer>
      
      {/* Image upload */}
      <AnimatedContainer animation="fade-in" delay={200} className="mb-6">
        <div className="space-y-4">
          <h2 className="font-medium">Accident Image</h2>
          <ImageUploader 
            onImageSelect={handleImageSelect}
            className="min-h-48"
          />
          
          {image && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Analyze with AI
                </>
              )}
            </button>
          )}
        </div>
      </AnimatedContainer>
      
      {/* Analysis result */}
      {analysisResult && (
        <AnimatedContainer animation="scale-in" className="mb-6">
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">AI Analysis Results</h3>
              <Check className="h-5 w-5 text-success" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severity:</span>
                <StatusBadge status={analysisResult.severity} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <span className="font-medium">{Math.round(analysisResult.confidence * 100)}%</span>
              </div>
            </div>
            
            {analysisResult.severity === 'severe' && (
              <div className="flex items-start bg-emergency/10 text-emergency rounded-md p-3">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  This appears to be a severe accident. We recommend immediate emergency services dispatch.
                </p>
              </div>
            )}
          </div>
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
            placeholder="Describe the accident situation, any injuries, or other important details..."
            className="w-full min-h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </AnimatedContainer>
      
      {/* Submit button */}
      <AnimatedContainer animation="fade-in" delay={400}>
        <button
          onClick={handleSubmitReport}
          disabled={!image || !analysisResult || isSubmitting}
          className="w-full flex items-center justify-center bg-emergency hover:bg-emergency/90 text-emergency-foreground py-4 px-6 rounded-lg font-medium transition-colors disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting Report...
            </>
          ) : (
            'Submit Emergency Report'
          )}
        </button>
      </AnimatedContainer>
    </div>
  );
};

export default ReportAccident;
