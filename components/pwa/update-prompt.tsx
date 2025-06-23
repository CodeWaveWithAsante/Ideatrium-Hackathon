'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  RefreshCw, 
  X, 
  Sparkles,
  Zap
} from 'lucide-react';
import { serviceWorkerManager } from '@/lib/pwa';
import { toast } from 'sonner';

export function UpdatePrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = serviceWorkerManager.onUpdateAvailable(() => {
      setIsVisible(true);
      toast.info('Update available!', {
        description: 'A new version of IdeaBox is ready to install.',
        duration: 8000,
      });
    });

    return unsubscribe;
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      await serviceWorkerManager.skipWaiting();
      toast.success('Update installed!', {
        description: 'IdeaBox will reload with the latest features.',
      });
    } catch (error) {
      toast.error('Update failed', {
        description: 'Please refresh the page manually to get the latest version.',
      });
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    toast.info('Update postponed', {
      description: 'You can update later by refreshing the page.',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-green-200 dark:border-green-800 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl">
                <Download className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">Update Available</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                A new version of IdeaBox is ready with improvements and bug fixes.
              </p>
              
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-green-600" />
                <span>Enhanced performance and new features</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Update Now
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="px-3"
                  disabled={isUpdating}
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