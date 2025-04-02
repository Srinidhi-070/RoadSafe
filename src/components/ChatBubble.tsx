
import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: Date;
  className?: string;
}

const ChatBubble = ({ 
  message, 
  isUser = false, 
  timestamp = new Date(),
  className 
}: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 max-w-[80%]',
        isUser ? 'flex-row-reverse self-end' : 'self-start',
        className
      )}
    >
      <Avatar
        className={cn(
          'h-8 w-8 border',
          isUser ? 'bg-primary border-primary/30' : 'bg-muted border-muted/50'
        )}
      >
        <AvatarFallback className="text-xs">
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-1">
        <div
          className={cn(
            'px-4 py-2 rounded-lg',
            isUser 
              ? 'bg-primary text-primary-foreground rounded-tr-none' 
              : 'bg-secondary text-secondary-foreground rounded-tl-none'
          )}
        >
          {message}
        </div>
        <div 
          className={cn(
            'text-xs text-muted-foreground',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
