'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudOff
} from 'lucide-react';
import { networkManager } from '@/lib/pwa';
import { toast } from 'sonner';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    // Initial state
    setIsOnline(networkManager.getNetworkStatus());

    // Listen for network changes
    const unsubscribe = networkManager.onNetworkChange((online) => {
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineBanner(true);
        toast.warning('You\'re offline', {
          description: 'Changes will be saved locally and synced when you\'re back online.',
          duration: 5000,
        });
      } else {
        setShowOfflineBanner(false);
        toast.success('You\'re back online!', {
          description: 'Syncing your changes now...',
          duration: 3000,
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowOfflineBanner(false);
  };

  return (
    <>
      {/* Network Status Indicator */}
      <div className="fixed top-4 left-4 z-40">
        <Badge 
          variant={isOnline ? "secondary" : "destructive"}
          className={`gap-1 transition-all duration-300 ${
            isOnline 
              ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
              : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Offline
            </>
          )}
        </Badge>
      </div>

      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <CloudOff className="h-5 w-5 text-amber-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    Working Offline
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Your changes are being saved locally and will sync automatically when you're back online.
                  </p>
                  
                  {pendingChanges > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-700 dark:text-amber-300">
                        {pendingChanges} changes pending sync
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismiss}
                      className="text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sync Status Indicator */}
      {isOnline && pendingChanges > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600/20 border-t-blue-600"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Syncing {pendingChanges} changes...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}