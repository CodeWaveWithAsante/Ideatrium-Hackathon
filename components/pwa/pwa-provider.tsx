'use client';

import { useEffect } from 'react';
import { serviceWorkerManager, offlineStorageManager } from '@/lib/pwa';
import { InstallPrompt } from './install-prompt';
import { UpdatePrompt } from './update-prompt';
import { OfflineIndicator } from './offline-indicator';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    // Initialize PWA features
    const initPWA = async () => {
      try {
        // Register service worker
        const swRegistered = await serviceWorkerManager.register();
        if (swRegistered) {
          console.log('✅ PWA: Service Worker registered');
        }

        // Initialize offline storage
        const storageInitialized = await offlineStorageManager.init();
        if (storageInitialized) {
          console.log('✅ PWA: Offline storage initialized');
        }

        // Handle URL shortcuts
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        const view = urlParams.get('view');

        if (action === 'new-idea') {
          // Trigger new idea modal
          setTimeout(() => {
            const event = new CustomEvent('pwa-shortcut', { 
              detail: { action: 'new-idea' } 
            });
            window.dispatchEvent(event);
          }, 1000);
        }

        if (view === 'matrix') {
          // Switch to matrix view
          setTimeout(() => {
            const event = new CustomEvent('pwa-shortcut', { 
              detail: { action: 'matrix-view' } 
            });
            window.dispatchEvent(event);
          }, 1000);
        }

      } catch (error) {
        console.error('❌ PWA: Initialization failed:', error);
      }
    };

    initPWA();
  }, []);

  return (
    <>
      {children}
      <InstallPrompt />
      <UpdatePrompt />
      <OfflineIndicator />
    </>
  );
}