'use client';

import { useEffect, useState } from 'react';
import { SwipeGesture, PullToRefresh, useMobileGestures } from './pwa/mobile-gestures';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Archive,
  Edit2,
  Trash2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  className?: string;
}

export function MobileOptimizedCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onEdit,
  onArchive,
  onDelete,
  onFavorite,
  className = '',
}: MobileOptimizedCardProps) {
  const { isMobile } = useMobileGestures();
  const [showActions, setShowActions] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipeLeft = () => {
    if (isMobile) {
      setSwipeDirection('left');
      setShowActions(true);
      onSwipeLeft?.();
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowActions(false);
        setSwipeDirection(null);
      }, 3000);
    }
  };

  const handleSwipeRight = () => {
    if (isMobile) {
      setSwipeDirection('right');
      setShowActions(true);
      onSwipeRight?.();
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowActions(false);
        setSwipeDirection(null);
      }, 3000);
    }
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <SwipeGesture
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        threshold={60}
        className="relative"
      >
        {/* Background Actions */}
        {showActions && (
          <div className="absolute inset-0 flex items-center justify-between px-4 z-0">
            {swipeDirection === 'left' && (
              <div className="flex items-center gap-2 ml-auto">
                {onArchive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onArchive}
                    className="bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    className="bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            
            {swipeDirection === 'right' && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onFavorite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onFavorite}
                    className="bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div 
          className={`relative z-10 transition-transform duration-200 ${
            showActions 
              ? swipeDirection === 'left' 
                ? 'transform -translate-x-4' 
                : 'transform translate-x-4'
              : ''
          }`}
        >
          {children}
        </div>
      </SwipeGesture>

      {/* Swipe Indicators */}
      {isMobile && (
        <div className="absolute top-1/2 transform -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none opacity-30">
          <ChevronRight className="h-4 w-4 text-blue-500" />
          <ChevronLeft className="h-4 w-4 text-orange-500" />
        </div>
      )}
    </div>
  );
}

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: MobileBottomSheetProps) {
  const { isMobile } = useMobileGestures();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isMobile || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

interface MobileFabProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
}

export function MobileFab({
  onClick,
  icon,
  label,
  className = '',
}: MobileFabProps) {
  const { isMobile } = useMobileGestures();

  if (!isMobile) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 ${className}`}
      size="lg"
    >
      {icon}
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </Button>
  );
}

// Hook for mobile-specific optimizations
export function useMobileOptimizations() {
  const { isMobile } = useMobileGestures();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      // Detect virtual keyboard on mobile
      const heightDiff = window.screen.height - window.innerHeight;
      setIsKeyboardOpen(heightDiff > 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  return {
    isMobile,
    isKeyboardOpen,
  };
}