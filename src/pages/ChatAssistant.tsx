
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, Loader2, MicIcon, StopCircleIcon } from 'lucide-react';
import ChatBubble from '@/components/ChatBubble';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useChatbot } from '@/contexts/ChatbotContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const ChatAssistant = () => {
  const navigate = useNavigate();
  const { messages, isProcessing, sendMessage, clearMessages } = useChatbot();
  
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    await sendMessage(input);
    setInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleRecording = () => {
    // In a real implementation, this would use the Web Speech API or a similar service
    if (isRecording) {
      setIsRecording(false);
      toast.info('Voice recording stopped');
    } else {
      setIsRecording(true);
      toast.info('Listening... Speak now');
      
      // Simulate speech recognition after 2 seconds
      setTimeout(() => {
        setIsRecording(false);
        setInput('How do I perform CPR?');
        toast.success('Voice recognized: "How do I perform CPR?"');
      }, 2000);
    }
  };
  
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 flex flex-col bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <AnimatedContainer className="mb-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="mr-3 rounded-full p-2.5 hover:bg-primary/10"
              size="icon"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">First Aid Assistant</h1>
          </div>
          <Button
            onClick={clearMessages}
            variant="ghost"
            className="rounded-full p-2.5 hover:bg-destructive/10 hover:text-destructive"
            size="icon"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </AnimatedContainer>
      
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scroll-hidden pr-1">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        
        {isProcessing && (
          <div className="flex items-center space-x-2 text-muted-foreground p-3 bg-primary/5 rounded-xl max-w-[80%]">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
            <span className="text-xs">AI assistant is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm pt-3 pb-8 rounded-t-xl shadow-lg">
        <div className="relative flex items-center">
          <button
            onClick={toggleRecording}
            className={`absolute left-4 p-2 rounded-full ${isRecording ? 'text-emergency bg-emergency/10' : 'text-muted-foreground'} hover:text-primary transition-colors`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? (
              <StopCircleIcon className="h-5 w-5 animate-pulse" />
            ) : (
              <MicIcon className="h-5 w-5" />
            )}
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for first aid assistance..."
            className="w-full bg-muted/70 border-none rounded-full py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
            disabled={isProcessing || isRecording}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            className="absolute right-4 p-2 rounded-full text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:text-muted-foreground disabled:bg-transparent"
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
