import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { getAiResponse } from '@/services/AiChatService';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotContextProps {
  messages: Message[];
  isProcessing: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  useAi: boolean;
  setUseAi: (value: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ChatbotContext = createContext<ChatbotContextProps | undefined>(undefined);

// Default HuggingFace API Key - use a dedicated API key for this app
const DEFAULT_API_KEY = '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';

export const ChatbotProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAi, setUseAi] = useState(true); // Default to true since we have an API key
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  
  // Load previous chat and settings from localStorage
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatbotMessages');
      const storedUseAi = localStorage.getItem('chatbotUseAi');
      const storedApiKey = localStorage.getItem('chatbotApiKey');
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        // Add a welcome message if no previous messages
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "Hello, I'm your First Aid Assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
      if (storedUseAi) {
        setUseAi(JSON.parse(storedUseAi));
      }
      
      if (storedApiKey && storedApiKey !== DEFAULT_API_KEY) {
        setApiKey(storedApiKey);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatbotMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatbotUseAi', JSON.stringify(useAi));
  }, [useAi]);
  
  useEffect(() => {
    if (apiKey !== DEFAULT_API_KEY) {
      localStorage.setItem('chatbotApiKey', apiKey);
    }
  }, [apiKey]);
  
  // Predefined responses for first aid scenarios
  const firstAidResponses = {
    'bleeding': "For bleeding: 1) Apply direct pressure with a clean cloth 2) Elevate the injured area 3) If bleeding continues, apply more layers without removing the first cloth 4) Seek immediate medical attention for severe bleeding.",
    
    'burn': "For burns: 1) Cool under running water for 10-20 minutes 2) Remove any jewelry/tight items 3) Don't pop blisters 4) Cover with sterile gauze 5) Seek medical help for severe or chemical burns.",
    
    'choking': "For choking: 1) Give 5 back blows between shoulder blades 2) If unsuccessful, give 5 abdominal thrusts (Heimlich maneuver) 3) Alternate between back blows and thrusts 4) If person becomes unconscious, start CPR.",
    
    'fracture': "For suspected fracture: 1) Don't move the injured area 2) Apply ice pack wrapped in cloth 3) Immobilize the injured part 4) Seek immediate medical attention.",
    
    'heart attack': "For heart attack: 1) Call emergency services immediately 2) Help person sit and rest 3) Loosen tight clothing 4) Give aspirin if available and no known allergies 5) Be prepared to perform CPR.",
    
    'seizure': "For seizure: 1) Clear the area of hazards 2) Cushion their head 3) Don't restrain them 4) Time the seizure 5) Turn them on their side when movement stops 6) Stay with them until fully recovered.",
    
    'snake bite': "For snake bite: 1) Keep person calm and still 2) Remove constricting items 3) Mark the bite location and time 4) Don't apply tourniquet or ice 5) Seek immediate medical help.",
    
    'sprain': "For sprain: Remember RICE: 1) Rest the injured area 2) Ice for 20 minutes every 2-3 hours 3) Compress with elastic bandage 4) Elevate above heart level.",
    
    'stroke': "For stroke signs, remember FAST: F - Face drooping, A - Arm weakness, S - Speech difficulty, T - Time to call emergency services immediately.",
    
    'unconscious': "For unconscious person: 1) Check responsiveness 2) Open airway 3) Check breathing 4) If breathing, place in recovery position 5) If not breathing, start CPR 6) Call emergency services.",
    
    'cpr': "Adult CPR steps: 1) Check scene safety 2) Call emergency services 3) 30 chest compressions (100-120/minute) 4) 2 rescue breaths 5) Continue 30:2 ratio until help arrives or person shows signs of life.",
    
    'allergic': "For severe allergic reaction: 1) Check for epinephrine auto-injector 2) Help them use it if available 3) Call emergency services 4) Keep them calm and lying flat 5) Monitor breathing and consciousness.",
    
    'default': "I'm your First Aid Assistant. Please describe the emergency situation (like bleeding, burns, choking, etc.) and I'll provide specific first aid instructions. In life-threatening situations, always call emergency services first."
  };
  
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      let responseText = '';
      
      // If AI is enabled and API key is provided, try to get AI response
      if (useAi && apiKey) {
        try {
          responseText = await getAiResponse(text, apiKey);
        } catch (error) {
          console.error('AI response error:', error);
          toast.error('Error getting AI response, falling back to predefined responses');
          responseText = getKeywordBasedResponse(text);
        }
      } else {
        // Use regular keyword matching
        responseText = getKeywordBasedResponse(text);
      }
      
      // Add AI or keyword-based response
      const botMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getKeywordBasedResponse = (text: string): string => {
    const lowerCaseText = text.toLowerCase();
    
    // Check for common synonyms and variations
    if (lowerCaseText.includes('bleeding') || lowerCaseText.includes('blood')) {
      return firstAidResponses.bleeding;
    } else if (lowerCaseText.includes('burn') || lowerCaseText.includes('scalded') || lowerCaseText.includes('hot')) {
      return firstAidResponses.burn;
    } else if (lowerCaseText.includes('chok') || lowerCaseText.includes("can't breathe")) {
      return firstAidResponses.choking;
    } else if (lowerCaseText.includes('break') || lowerCaseText.includes('fracture') || lowerCaseText.includes('broken')) {
      return firstAidResponses.fracture;
    } else if (lowerCaseText.includes('heart') || lowerCaseText.includes('chest pain')) {
      return firstAidResponses.heart_attack;
    } else if (lowerCaseText.includes('seizure') || lowerCaseText.includes('fit')) {
      return firstAidResponses.seizure;
    } else if (lowerCaseText.includes('snake')) {
      return firstAidResponses.snake_bite;
    } else if (lowerCaseText.includes('sprain') || lowerCaseText.includes('twisted')) {
      return firstAidResponses.sprain;
    } else if (lowerCaseText.includes('stroke')) {
      return firstAidResponses.stroke;
    } else if (lowerCaseText.includes('unconscious') || lowerCaseText.includes('passed out')) {
      return firstAidResponses.unconscious;
    } else if (lowerCaseText.includes('cpr') || lowerCaseText.includes('resuscitation')) {
      return firstAidResponses.cpr;
    } else if (lowerCaseText.includes('allerg') || lowerCaseText.includes('anaphyla')) {
      return firstAidResponses.allergic;
    }
    
    return firstAidResponses.default;
  };
  
  const clearMessages = () => {
    // Keep only the welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hello, I'm your First Aid Assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };
  
  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isProcessing,
        sendMessage,
        clearMessages,
        useAi,
        setUseAi,
        apiKey,
        setApiKey
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  
  return context;
};
