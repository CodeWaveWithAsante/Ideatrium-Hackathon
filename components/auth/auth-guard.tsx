'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from './auth-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, FolderSync as Sync, Shield, Users, Sparkles, Target, Brain, Zap, Lightbulb } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { SpinnerLoader } from "../spinner-loader";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <SpinnerLoader
        title="Loading..."
        message="Preparing your workspace"
      />
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        {/* Bolt Badge */}
        <div className="fixed top-4 right-4 z-50">
          <Link 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:scale-110 transition-transform duration-200 drop-shadow-lg hover:drop-shadow-xl"
          >
            <Image
              src="/black_circle_360x360.svg"
              alt="Built with Bolt"
              width={68}
              height={68}
              className="rounded-full bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
            />
          </Link>
        </div>
        <div className="w-full max-w-6xl 2xl:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <div className="flex items-center justify-center gap-4 mb-8 animate-in slide-in-from-top duration-700">
              <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl group-hover:scale-105 transition-transform duration-300">
                  <Lightbulb className="h-10 lg:h-12 w-10 lg:w-12 text-white" />
                </div>
              </div>
              
              <div className="text-left">
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Ideatrium
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mt-2">
                  Transform thoughts into action
                </p>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-700 delay-200">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Your personal idea management platform
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Capture brilliant ideas, prioritize with the Eisenhower Matrix, and transform concepts into actionable tasks. 
                Powered by AI insights and designed for creative minds.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Cloud,
                title: 'Cloud Sync',
                description: 'Access your ideas from any device with automatic synchronization and real-time updates',
                gradient: 'from-blue-500/10 to-cyan-500/10',
                iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                iconColor: 'text-blue-600',
                delay: 'delay-100'
              },
              {
                icon: Shield,
                title: 'Secure Storage',
                description: 'Your ideas are safely stored and backed up in the cloud with enterprise-grade security',
                gradient: 'from-green-500/10 to-emerald-500/10',
                iconBg: 'bg-green-100 dark:bg-green-900/30',
                iconColor: 'text-green-600',
                delay: 'delay-200'
              },
              {
                icon: Brain,
                title: 'AI Insights',
                description: 'Get intelligent suggestions and automated analysis powered by advanced AI technology',
                gradient: 'from-purple-500/10 to-pink-500/10',
                iconBg: 'bg-purple-100 dark:bg-purple-900/30',
                iconColor: 'text-purple-600',
                delay: 'delay-300'
              },
              {
                icon: Target,
                title: 'Smart Prioritization',
                description: 'Organize ideas using the Eisenhower Matrix and convert top priorities into actionable tasks',
                gradient: 'from-orange-500/10 to-red-500/10',
                iconBg: 'bg-orange-100 dark:bg-orange-900/30',
                iconColor: 'text-orange-600',
                delay: 'delay-400'
              },
              {
                icon: Sync,
                title: 'Real-time Updates',
                description: 'Changes sync instantly across all your devices with conflict resolution and version history',
                gradient: 'from-cyan-500/10 to-blue-500/10',
                iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
                iconColor: 'text-cyan-600',
                delay: 'delay-500'
              },
              {
                icon: Zap,
                title: 'Productivity Tools',
                description: 'Advanced filtering, bulk operations, keyboard shortcuts, and idea roulette for inspiration',
                gradient: 'from-yellow-500/10 to-orange-500/10',
                iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
                iconColor: 'text-yellow-600',
                delay: 'delay-600'
              }
            ].map((feature, index) => (
              <div key={index} className={`group relative animate-in slide-in-from-bottom duration-700 ${feature.delay}`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
                <Card className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 group-hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-4 p-3 ${feature.iconBg} rounded-xl w-fit group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-700">
            <Card className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50 overflow-hidden group hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-indigo-500/10 transition-all duration-300"></div>
              <CardContent className="relative p-12 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    <h3 className="text-2xl font-bold">Ready to get started?</h3>
                  </div>
                  
                  <p className="text-lg text-muted-foreground">
                    Join thousands of creative minds who use Ideatrium to capture, organize, and execute their best ideas.
                  </p>
                  
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Start Your Creative Journey
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    Free to start • No credit card required • Sync across all devices
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal} 
        />
      </div>
    );
  }

  return <>{children}</>;
}