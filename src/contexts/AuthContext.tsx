
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Enhanced check for existing session with improved persistence
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage for existing user
        const storedUser = localStorage.getItem('smartCrashUser');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          
          // If user is on login/signup page but already authenticated, redirect to home
          if (['/login', '/signup', '/'].includes(location.pathname)) {
            navigate('/home', { replace: true });
          }
        } else if (location.pathname !== '/landing' && 
                  location.pathname !== '/login' && 
                  location.pathname !== '/signup') {
          // If no user found and not on public routes, redirect to landing
          navigate('/landing', { replace: true });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('smartCrashUser');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [location.pathname, navigate]);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for demo
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: email,
        phone: '+1 (555) 123-4567'
      };
      
      setUser(mockUser);
      localStorage.setItem('smartCrashUser', JSON.stringify(mockUser));
      
      // Get the return URL from location state or default to home
      const from = (location.state as any)?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user creation for demo
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
      };
      
      setUser(mockUser);
      localStorage.setItem('smartCrashUser', JSON.stringify(mockUser));
      
      // Navigate to home after successful registration
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartCrashUser');
    navigate('/landing', { replace: true });
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
