
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignUp = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      await register(values.name, values.email, values.password);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-700/30 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="bg-gradient-to-b from-blue-500 to-cyan-400 p-5 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-1">RoadSafe</h1>
          <p className="text-gray-300 mb-8">Your safety companion on every journey</p>
          
          <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl mb-4">
            <h2 className="text-xl font-medium text-white mb-6">Create Account</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Full Name" 
                            className="pl-10 bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white h-12 rounded-lg"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Email" 
                            type="email" 
                            className="pl-10 bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white h-12 rounded-lg"
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
                            className="pl-10 bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white h-12 rounded-lg"
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
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Confirm Password" 
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10 bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white h-12 rounded-lg"
                            {...field} 
                            disabled={isLoading}
                          />
                          <button 
                            type="button"
                            onClick={toggleConfirmPasswordVisibility} 
                            className="absolute right-3 top-3 text-gray-400"
                          >
                            {showConfirmPassword ? (
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
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold h-12 rounded-lg mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="mt-4">
            <Link 
              to="/login" 
              className="text-sm flex items-center justify-center text-gray-300 hover:text-white"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Already have an account? Login
            </Link>
          </div>
          
          <p className="mt-6 text-xs text-gray-400">
            By continuing, you agree to our <a href="#" className="text-blue-400">Terms & Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
