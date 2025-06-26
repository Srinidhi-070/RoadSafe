
import React, { useState, useEffect } from 'react';
import { MessageCircle, Brain, X, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { enhancedAiService } from '@/services/EnhancedAiService';
import { toast } from 'sonner';

interface AiMapAssistantProps {
  userLocation?: { latitude: number; longitude: number };
  emergencyType?: string;
  isVisible: boolean;
  onToggle: () => void;
}

const AiMapAssistant: React.FC<AiMapAssistantProps> = ({
  userLocation,
  emergencyType = 'general',
  isVisible,
  onToggle
}) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && messages.length === 0) {
      // Initialize with welcome message
      setMessages([{
        text: "Hello! I'm your AI emergency assistant. I can help you with emergency guidance, nearby services, and first aid instructions. How can I assist you?",
        isUser: false
      }]);
    }
  }, [isVisible, messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const locationContext = userLocation ? {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      } : undefined;

      const response = await enhancedAiService.getEmergencyGuidance(userMessage, locationContext);
      
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I'm having trouble connecting right now. For immediate emergencies, please call your local emergency services.", 
        isUser: false 
      }]);
      toast.error('AI assistant temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-32 left-5 z-30 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-all duration-200 active:scale-95"
        aria-label="Open AI Assistant"
      >
        <Brain className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-32 left-5 right-5 z-30 max-w-sm mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary" />
              AI Emergency Assistant
            </CardTitle>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Close AI Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="max-h-64 overflow-y-auto space-y-3 scrollbar-hide">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-3 py-2 rounded-2xl text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about emergencies, first aid, or nearby services..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiMapAssistant;
