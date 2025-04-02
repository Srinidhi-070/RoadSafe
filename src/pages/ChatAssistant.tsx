
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, Loader2, MicIcon, StopCircleIcon, Settings, X, Volume2, VolumeX } from 'lucide-react';
import ChatBubble from '@/components/ChatBubble';
import AnimatedContainer from '@/components/AnimatedContainer';
import { useChatbot } from '@/contexts/ChatbotContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// Web Speech API interfaces
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const ChatAssistant = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    messages, 
    isProcessing, 
    sendMessage, 
    clearMessages,
    useAi,
    setUseAi,
    apiKey,
    setApiKey
  } = useChatbot();
  
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        toast.info('Listening... Speak now');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
          toast.error('Speech recognition error: ' + event.error);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      toast.error('Speech recognition is not supported in this browser');
    }

    // Initialize speech synthesis
    speechSynthesisRef.current = new SpeechSynthesisUtterance();
    speechSynthesisRef.current.lang = 'en-US';
    speechSynthesisRef.current.rate = 1.0;
    speechSynthesisRef.current.pitch = 1.0;
    
    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping recognition
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak bot messages when they arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && !lastMessage.isUser && isSpeechEnabled && !isProcessing && speechSynthesisRef.current) {
      speechSynthesisRef.current.text = lastMessage.text;
      window.speechSynthesis.speak(speechSynthesisRef.current);
    }
  }, [messages, isProcessing, isSpeechEnabled]);
  
  // Handle keyboard visibility changes
  useEffect(() => {
    const originalHeight = window.innerHeight;
    
    const handleResize = () => {
      // If the window height decreases significantly, assume keyboard is open
      const newHeight = window.innerHeight;
      const heightDifference = originalHeight - newHeight;
      const keyboardOpen = heightDifference > 100;
      
      setIsKeyboardOpen(keyboardOpen);
      if (keyboardOpen) {
        setKeyboardHeight(heightDifference);
        // When keyboard opens, scroll to bottom with a slight delay
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        setKeyboardHeight(0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    await sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      // Cancel any ongoing speech before recording
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      recognitionRef.current.start();
    }
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(prev => !prev);
    
    if (isSpeechEnabled) {
      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      toast.info('Text-to-speech disabled');
    } else {
      toast.info('Text-to-speech enabled');
    }
  };
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };
  
  const handleAiToggle = (checked: boolean) => {
    setUseAi(checked);
    if (checked && !apiKey) {
      setSettingsOpen(true);
      toast.info('Please enter an API key to use AI responses');
    }
  };
  
  // Calculate bottom padding to avoid keyboard overlap
  const bottomPadding = isKeyboardOpen ? keyboardHeight : 0;
  
  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80"
      ref={chatContainerRef}
      style={{ paddingBottom: bottomPadding }}
    >
      {/* Header - Always visible */}
      <AnimatedContainer className="p-4 flex-shrink-0 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
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
          
          <div className="flex items-center gap-2">
            {/* Text-to-Speech Toggle */}
            <Button
              onClick={toggleSpeech}
              variant="ghost"
              className="rounded-full p-2.5"
              size="icon"
              title={isSpeechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
            >
              {isSpeechEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            
            {/* Settings Dialog */}
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full p-2.5"
                    size="icon"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[40vh] pb-safe">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Chat Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="use-ai-mobile" className="flex items-center gap-2">
                          Use AI Responses
                          {useAi && !apiKey && (
                            <span className="text-xs text-yellow-500">API key required</span>
                          )}
                        </Label>
                        <Switch 
                          id="use-ai-mobile" 
                          checked={useAi}
                          onCheckedChange={handleAiToggle}
                        />
                      </div>
                      
                      {useAi && (
                        <div className="space-y-2">
                          <Label htmlFor="api-key-mobile">API Key</Label>
                          <div className="relative">
                            <Input
                              id="api-key-mobile"
                              type="password"
                              placeholder="Enter your HuggingFace API key"
                              value={apiKey}
                              onChange={handleApiKeyChange}
                              className="pr-8"
                            />
                            {apiKey && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setApiKey('')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            API key is set! You can now use AI responses.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full p-2.5"
                    size="icon"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Chat Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="use-ai" className="flex items-center gap-2">
                        Use AI Responses
                        {useAi && !apiKey && (
                          <span className="text-xs text-yellow-500">API key required</span>
                        )}
                      </Label>
                      <Switch 
                        id="use-ai" 
                        checked={useAi}
                        onCheckedChange={handleAiToggle}
                      />
                    </div>
                    
                    {useAi && (
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="api-key"
                            type="password"
                            placeholder="Enter your HuggingFace API key"
                            value={apiKey}
                            onChange={handleApiKeyChange}
                            className="pr-8"
                          />
                          {apiKey && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setApiKey('')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          API key is set! You can now use AI responses.
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              onClick={clearMessages}
              variant="ghost"
              className="rounded-full p-2.5 hover:bg-destructive/10 hover:text-destructive"
              size="icon"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* AI status indicator */}
        {useAi && (
          <div className="flex items-center text-xs mt-2 text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-amber-500'} mr-1`}></div>
            {apiKey ? "AI mode active" : "AI mode enabled (needs API key)"}
          </div>
        )}
      </AnimatedContainer>
      
      {/* Chat area - Scrollable */}
      <ScrollArea className="flex-1 px-4 pb-4 pt-2">
        <div className="space-y-4">
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
          
          <div ref={messagesEndRef} className="pt-2" />
        </div>
      </ScrollArea>
      
      {/* Input area - Fixed at bottom */}
      <div className={`sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm pt-3 px-4 ${isKeyboardOpen ? 'pb-2' : 'pb-8'} z-20`}>
        <div className="relative flex items-center">
          <button
            onClick={toggleRecording}
            className={`absolute left-4 p-2 rounded-full ${isRecording ? 'text-emergency bg-emergency/10' : 'text-muted-foreground'} hover:text-primary transition-colors z-10`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? (
              <StopCircleIcon className="h-5 w-5 animate-pulse" />
            ) : (
              <MicIcon className="h-5 w-5" />
            )}
          </button>
          
          {isMobile ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for first aid assistance..."
              className="w-full min-h-[44px] max-h-[120px] bg-muted/70 border-none rounded-full py-2.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner resize-none"
              disabled={isProcessing || isRecording}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for first aid assistance..."
              className="w-full bg-muted/70 border-none rounded-full py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
              disabled={isProcessing || isRecording}
            />
          )}
          
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            className="absolute right-4 p-2 rounded-full text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:text-muted-foreground disabled:bg-transparent z-10"
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
