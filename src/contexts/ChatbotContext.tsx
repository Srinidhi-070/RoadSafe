import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

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
}

const ChatbotContext = createContext<ChatbotContextProps | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load previous chat from localStorage
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatbotMessages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        // Convert timestamp strings back to Date objects
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
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatbotMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Predefined responses for demo
  const firstAidResponses = {
    'bleeding': "To control bleeding: 1) Apply direct pressure on the wound with a clean cloth or bandage. 2) If possible, elevate the injured area above the heart. 3) Apply pressure to the artery if direct pressure doesn't stop the bleeding. 4) Only use a tourniquet as a last resort for life-threatening bleeding.",
    'cpr': "For CPR: 1) Ensure the scene is safe. 2) Check for responsiveness. 3) Call for help or ask someone to call emergency services. 4) Begin chest compressions: push hard and fast in the center of the chest, about 2 inches deep at a rate of 100-120 compressions per minute. 5) If trained, give rescue breaths. 6) Continue until help arrives.",
    'fracture': "For a suspected fracture: 1) Immobilize the injured area. 2) Apply a cold pack wrapped in cloth. 3) Elevate the injured area if possible. 4) Treat for shock if necessary. 5) Seek medical attention immediately.",
    'burn': "For burns: 1) Cool the burn with cool (not cold) running water for at least 10 minutes. 2) Cover with a clean, non-stick bandage. 3) Do not apply ice, butter, or any ointments. 4) For severe burns, seek medical attention immediately.",
    'choking': "For choking: 1) If the person can cough or speak, encourage them to cough. 2) If they cannot cough or speak, stand behind them and perform abdominal thrusts (Heimlich maneuver): place a fist with the thumb side just above their navel, grasp your fist with your other hand, and pull inward and upward sharply. 3) Repeat until the object is expelled or the person becomes unconscious. 4) If unconscious, begin CPR.",
    'default': "I'm here to provide first aid guidance. Please let me know what type of emergency situation you're dealing with (bleeding, burns, CPR, choking, fracture, etc.), and I'll provide step-by-step instructions."
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
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a response based on keywords in the user's message
      let responseText = firstAidResponses.default;
      
      const lowerCaseText = text.toLowerCase();
      
      if (lowerCaseText.includes('bleeding') || lowerCaseText.includes('blood')) {
        responseText = firstAidResponses.bleeding;
      } else if (lowerCaseText.includes('cpr') || lowerCaseText.includes('heart') || lowerCaseText.includes('unconscious')) {
        responseText = firstAidResponses.cpr;
      } else if (lowerCaseText.includes('fracture') || lowerCaseText.includes('broken bone') || lowerCaseText.includes('break')) {
        responseText = firstAidResponses.fracture;
      } else if (lowerCaseText.includes('burn') || lowerCaseText.includes('scalded')) {
        responseText = firstAidResponses.burn;
      } else if (lowerCaseText.includes('choking') || lowerCaseText.includes('can\'t breathe')) {
        responseText = firstAidResponses.choking;
      }
      
      // Add AI response
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
        clearMessages
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
