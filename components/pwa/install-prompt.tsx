'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  Sparkles,
  Zap,
  Shield,
  Wifi
} from 'lucide-react';
import { pwaManager, type PWAInstallState } from '@/lib/pwa';
import { toast } from 'sonner';
import Image from 'next/image';

export function InstallPrompt() {
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    platform: 'unknown',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Listen for install state changes
    const unsubscribe = pwaManager.onStateChange((state) => {
      setInstallState(state);
      
      // Show prompt if installable and not dismissed
      if (state.isInstallable && !dismissed && !state.isInstalled) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    });

    // Initial state check
    setInstallState(pwaManager.getInstallState());

    return unsubscribe;
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await pwaManager.install();
      
      if (success) {
        toast.success('Ideatrium installed!', {
          description: 'You can now access Ideatrium from your home screen.',
        });
        setIsVisible(false);
      } else {
        toast.error('Installation cancelled', {
          description: 'You can install Ideatrium later from your browser menu.',
        });
      }
    } catch (error) {
      toast.error('Installation failed', {
        description: 'Please try again or install from your browser menu.',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    toast.info('Install prompt dismissed', {
      description: 'You can still install Ideatrium from your browser menu.',
    });
  };

  const getInstallIcon = () => {
    switch (installState.platform) {
      case 'ios':
      case 'android':
        return Smartphone;
      case 'desktop':
        return Monitor;
      default:
        return Download;
    }
  };

  const getInstallText = () => {
    switch (installState.platform) {
      case 'ios':
        return 'Add to Home Screen';
      case 'android':
        return 'Install App';
      case 'desktop':
        return 'Install Ideatrium';
      default:
        return 'Install App';
    }
  };

  const getPlatformInstructions = () => {
    switch (installState.platform) {
      case 'ios':
        return 'Tap the share button and select "Add to Home Screen"';
      case 'android':
        return 'Tap "Install" to add Ideatrium to your home screen';
      case 'desktop':
        return 'Click "Install" to add Ideatrium to your desktop';
      default:
        return 'Install Ideatrium for the best experience';
    }
  };

  if (!isVisible || installState.isInstalled || isDismissed) {
    return null;
  }

  const InstallIcon = getInstallIcon();

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-blue-200 dark:border-blue-800 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Image 
                  src="/logo.svg" 
                  alt="Ideatrium Logo" 
                  width={24} 
                  height={24} 
                  className="brightness-0 invert"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">Install Ideatrium</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  PWA
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {getPlatformInstructions()}
              </p>
              
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-green-600" />
                  <span>Faster loading</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Wifi className="h-3 w-3 text-blue-600" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 text-purple-600" />
                  <span>Secure & private</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="h-3 w-3 text-orange-600" />
                  <span>Native feel</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {getInstallText()}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}