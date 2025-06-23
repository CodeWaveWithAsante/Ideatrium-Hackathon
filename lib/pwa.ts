'use client';

// PWA utilities and helpers
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installStateListeners: ((state: PWAInstallState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyStateChange();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyStateChange();
    });

    // Check if already installed
    if (this.isStandalone()) {
      this.notifyStateChange();
    }
  }

  public getInstallState(): PWAInstallState {
    return {
      isInstallable: !!this.deferredPrompt,
      isInstalled: this.isStandalone(),
      isStandalone: this.isStandalone(),
      platform: this.getPlatform(),
    };
  }

  public async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.notifyStateChange();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA install failed:', error);
      return false;
    }
  }

  public onStateChange(listener: (state: PWAInstallState) => void) {
    this.installStateListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.installStateListeners.indexOf(listener);
      if (index > -1) {
        this.installStateListeners.splice(index, 1);
      }
    };
  }

  private notifyStateChange() {
    const state = this.getInstallState();
    this.installStateListeners.forEach(listener => listener(state));
  }

  private isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  private getPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    
    if (/android/.test(userAgent)) {
      return 'android';
    }
    
    if (/windows|macintosh|linux/.test(userAgent)) {
      return 'desktop';
    }
    
    return 'unknown';
  }
}

// Service Worker registration and management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailableListeners: (() => void)[] = [];

  public async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registered successfully');

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      return true;
    } catch (error) {
      console.log('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  public async update(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
      return false;
    }
  }

  public async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  public onUpdateAvailable(listener: () => void) {
    this.updateAvailableListeners.push(listener);
    
    return () => {
      const index = this.updateAvailableListeners.indexOf(listener);
      if (index > -1) {
        this.updateAvailableListeners.splice(index, 1);
      }
    };
  }

  private notifyUpdateAvailable() {
    this.updateAvailableListeners.forEach(listener => listener());
  }
}

// Offline storage manager
export class OfflineStorageManager {
  private dbName = 'ideabox-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  public async init(): Promise<boolean> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.log('❌ IndexedDB failed to open');
        reject(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB opened successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('pendingActions')) {
          const store = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'key' });
        }
      };
    });
  }

  public async storePendingAction(action: any): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      
      const actionWithTimestamp = {
        ...action,
        timestamp: Date.now(),
      };

      const request = store.add(actionWithTimestamp);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  public async getPendingActions(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  public async removePendingAction(id: number): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  public async storeOfflineData(key: string, data: any): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.put({ key, data, timestamp: Date.now() });
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  public async getOfflineData(key: string): Promise<any | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => resolve(null);
    });
  }
}

// Network status manager
export class NetworkManager {
  private listeners: ((isOnline: boolean) => void)[] = [];
  private isOnline: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public onNetworkChange(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }
}

// Singleton instances
export const pwaManager = new PWAManager();
export const serviceWorkerManager = new ServiceWorkerManager();
export const offlineStorageManager = new OfflineStorageManager();
export const networkManager = new NetworkManager();

// Utility functions
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
}

export function canInstallPWA(): boolean {
  return pwaManager.getInstallState().isInstallable;
}

export function isPWAInstalled(): boolean {
  return pwaManager.getInstallState().isInstalled;
}