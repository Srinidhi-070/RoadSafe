
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
        'flex items-start gap-3 max-w-[90%] w-full',
        isUser 
          ? 'flex-row-reverse self-end ml-auto' 
          : 'self-start mr-auto',
        className
      )}
    >
      <Avatar
        className={cn(
          'h-8 w-8 flex-shrink-0 border',
          isUser 
            ? 'bg-primary border-primary/30 order-2' 
            : 'bg-muted border-muted/50 order-1'
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
      
      <div 
        className={cn(
          'space-y-1 flex-1',
          isUser ? 'text-right order-1' : 'text-left order-2'
        )}
      >
        <div
          className={cn(
            'inline-block px-4 py-2 rounded-lg max-w-full',
            isUser 
              ? 'bg-primary text-primary-foreground rounded-tr-none ml-auto' 
              : 'bg-secondary text-secondary-foreground rounded-tl-none mr-auto'
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
