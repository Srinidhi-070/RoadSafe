
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      await login(values.email, values.password);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 bg-gray-700/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <img 
              src="/lovable-uploads/babc7f96-a784-4583-bc62-5b6f7f92da8b.png" 
              alt="RoadSafe Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">RoadSafe</h1>
          <p className="text-gray-300 mb-6 sm:mb-8">Your safety companion on every journey</p>
          
          <div className="bg-gray-800/40 backdrop-blur-sm p-4 sm:p-6 rounded-xl mb-4">
            <h2 className="text-xl font-medium text-white mb-6">Welcome Back</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Email" 
                            type="email" 
                            className="pl-10 bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white h-11 sm:h-12 rounded-lg"
                            {...field} 
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Password" 
                            type={showPassword ? "text" : "password"}
                            className="pl-10 bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white h-11 sm:h-12 rounded-lg"
                            {...field} 
                            disabled={isLoading}
                          />
                          <button 
                            type="button"
                            onClick={togglePasswordVisibility} 
                            className="absolute right-3 top-3 text-gray-400"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 sm:h-12 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-sm text-gray-300 hover:text-white">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <div className="relative py-4 sm:py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-4 text-sm text-gray-400">OR</span>
            </div>
          </div>
          
          <Link to="/signup">
            <Button variant="outline" className="w-full border-gray-600 text-blue-400 hover:text-white hover:bg-gray-700 h-11 sm:h-12 rounded-lg">
              Create Account
            </Button>
          </Link>
          
          <p className="mt-6 text-xs text-gray-400">
            By continuing, you agree to our <a href="#" className="text-blue-400">Terms & Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
