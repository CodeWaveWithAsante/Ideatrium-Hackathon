'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Image from 'next/image';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setStatus('error');
          return;
        }

        if (session) {
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
      }
    };

    checkSession();
  }, []);

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        toast.error('Password reset failed', {
          description: error.message,
        });
        return;
      }

      setStatus('success');
      toast.success('Password updated successfully!', {
        description: 'You can now sign in with your new password.',
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred', {
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Image 
                  src="/logo.svg" 
                  alt="Ideatrium Logo" 
                  width={24} 
                  height={24} 
                  className="brightness-0 invert"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Ideatrium
            </h1>
          </div>
          <CardTitle className="text-xl">Reset Your Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-muted-foreground">Verifying reset link...</p>
            </div>
          )}

          {status === 'ready' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            className="pr-12 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            disabled={isSubmitting}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
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
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </Form>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Password Updated!
              </h3>
              <p className="text-muted-foreground">
                Your password has been successfully updated. Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Invalid Reset Link
              </h3>
              <p className="text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button 
                onClick={handleReturnHome}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Return to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}