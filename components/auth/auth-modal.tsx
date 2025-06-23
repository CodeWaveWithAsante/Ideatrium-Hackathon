'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  signInSchema, 
  signUpSchema, 
  resetPasswordSchema,
  type SignInFormData,
  type SignUpFormData,
  type ResetPasswordFormData,
} from '@/lib/validations';
import Image from 'next/image';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  // Form instances
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const getAuthErrorMessage = (error: any) => {
    const message = error?.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('Signup is disabled')) {
      return 'Account registration is currently disabled. Please contact support.';
    }
    if (message.includes('Email rate limit exceeded')) {
      return 'Too many email attempts. Please wait a few minutes before trying again.';
    }
    if (message.includes('For security purposes')) {
      return 'Account temporarily locked for security. Please try again later or reset your password.';
    }
    if (message.includes('Failed to fetch')) {
      return 'Connection error. Please check your internet connection and try again.';
    }
    if (message.includes('Authentication is not available')) {
      return 'Authentication service is not configured. Please contact support.';
    }
    
    return message || 'An unexpected error occurred. Please try again.';
  };

  const handleSignIn = async (data: SignInFormData) => {
    if (!supabaseConfigured) {
      toast.error('Configuration Error', {
        description: 'Authentication is not properly configured. Please contact support.',
        duration: 8000,
      });
      return;
    }

    setLoading(true);
    try {
      await signIn(data.email, data.password);
      onOpenChange(false);
      signInForm.reset();
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error('Sign in failed', {
        description: errorMessage,
        duration: 6000,
        action: error?.message?.includes('Email not confirmed') ? {
          label: 'Resend Email',
          onClick: () => setActiveTab('reset'),
        } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    if (!supabaseConfigured) {
      toast.error('Configuration Error', {
        description: 'Authentication is not properly configured. Please contact support.',
        duration: 8000,
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
      onOpenChange(false);
      signUpForm.reset();
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error('Sign up failed', {
        description: errorMessage,
        duration: 6000,
        action: error?.message?.includes('already registered') ? {
          label: 'Sign In',
          onClick: () => setActiveTab('signin'),
        } : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!supabaseConfigured) {
      toast.error('Configuration Error', {
        description: 'Authentication is not properly configured. Please contact support.',
        duration: 8000,
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(data.email);
      resetForm.reset();
      setActiveTab('signin');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error('Password reset failed', {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      // Reset all forms when closing
      signInForm.reset();
      signUpForm.reset();
      resetForm.reset();
      setShowPassword(false);
    }
    onOpenChange(newOpen);
  };

  // Show configuration warning if Supabase is not configured
  if (!supabaseConfigured) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 overflow-hidden bg-white bg-opacity-95 dark:bg-slate-900 dark:bg-opacity-95 backdrop-blur-xl border-white border-opacity-20 dark:border-slate-700 dark:border-opacity-50">
          <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 p-8 text-white">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">Configuration Required</DialogTitle>
                  <DialogDescription className="text-orange-100 mt-1">
                    Authentication service needs to be set up
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-orange-500" />
              <h3 className="text-lg font-semibold">Supabase Configuration Missing</h3>
              <p className="text-muted-foreground">
                To use authentication features, please configure your Supabase credentials in the environment variables.
              </p>
              <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 p-4 rounded-lg text-left">
                <p className="text-sm font-medium mb-2">Required environment variables:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
              <Button onClick={() => handleOpenChange(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
 <DialogContent className="sm:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[700px] max-h-[95vh] md:max-h-[95vh] flex flex-col p-0 overflow-hidden bg-white bg-opacity-95 dark:bg-slate-900 dark:bg-opacity-95 backdrop-blur-xl border-white border-opacity-20 dark:border-slate-700 dark:border-opacity-50 "
>
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <Image 
                  src="/logo.svg" 
                  alt="Ideatrium Logo" 
                  width={24} 
                  height={24} 
                  className="brightness-0 invert"
                />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Welcome to Ideatrium</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Transform your thoughts into actionable ideas
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Sparkles className="h-4 w-4" />
              <span>Join thousands of creative minds worldwide</span>
            </div>
          </DialogHeader>
        </div>

        <div 
          
           className="px-8 pb-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
    "
          >  
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="signin" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Sign Up</TabsTrigger>
              <TabsTrigger value="reset" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-4">
                  <CardTitle className="text-xl">Welcome back</CardTitle>
                  <CardDescription className="text-base">
                    Sign in to access your ideas and continue your creative journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...signInForm}>
                    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-5">
                      <FormField
                        control={signInForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Email address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                  disabled={loading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signInForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter your password"
                                  className="pl-10 pr-12 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                  disabled={loading}
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={loading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-4">
                  <CardTitle className="text-xl">Create your account</CardTitle>
                  <CardDescription className="text-base">
                    Join Ideatrium and start organizing your creative thoughts
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-5">
                      <FormField
                        control={signUpForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Display Name (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="text"
                                  placeholder="Your display name"
                                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                  disabled={loading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signUpForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Email address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                  disabled={loading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signUpForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Create a password"
                                  className="pl-10 pr-12 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                  disabled={loading}
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={loading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signUpForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Confirm your password"
                                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                  disabled={loading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>

                      <div className="text-xs text-muted-foreground text-center bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span><strong>Email verification required:</strong> We'll send you a confirmation link to verify your account.</span>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reset" className="mt-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-4">
                  <CardTitle className="text-xl">Reset your password</CardTitle>
                  <CardDescription className="text-base">
                    Enter your email address and we'll send you a reset link
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-5">
                      <FormField
                        control={resetForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Email address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                  disabled={loading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending reset link...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>

                      <div className="text-xs text-muted-foreground text-center bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span><strong>Check your email:</strong> We'll send you a secure link to reset your password.</span>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}