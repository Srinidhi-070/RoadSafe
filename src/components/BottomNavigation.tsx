
import React from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Home, AlertCircle, MessageCircle, MapPin, User } from 'lucide-react';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const BottomNavigation = () => {
  const location = useLocation();
  
  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
      path: '/home'  // Changed from '/' to '/home' to match the correct route
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: 'Report',
      path: '/report'
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Chat',
      path: '/chat'
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: 'Map',
      path: '/map'
    },
    {
      icon: <User className="h-5 w-5" />,
      label: 'Profile',
      path: '/profile'
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center px-4 py-2 text-sm transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-full transition-colors',
                isActive && 'bg-primary/10'
              )}>
                {item.icon}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
