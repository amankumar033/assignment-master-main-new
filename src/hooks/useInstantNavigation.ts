'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export const useInstantNavigation = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useCallback(async (href: string, options?: { 
    showProgress?: boolean; 
    instant?: boolean;
    onStart?: () => void;
    onComplete?: () => void;
    setLoading?: (loading: boolean) => void;
  }) => {
    const { showProgress = true, instant = true, onStart, onComplete, setLoading } = options || {};

    if (isNavigating) return;
    
    setIsNavigating(true);
    if (setLoading) setLoading(true);

    // Immediate UI feedback
    if (onStart) onStart();
    
    if (showProgress) {
      // Dispatch custom event for progress bar
      document.dispatchEvent(new CustomEvent('navigationStart', { 
        detail: { href, instant } 
      }));
    }

    try {
      if (instant) {
        // Prefetch to speed up navigation
        try {
          // @ts-ignore - Next Router prefetch is available in app router
          router.prefetch?.(href);
        } catch {}

        // For instant navigation, update URL immediately for visual feedback
        window.history.pushState({}, '', href);
        
        // Very small delay, then actually navigate
        setTimeout(() => {
          router.push(href);
          
          // Fallback completion if Next events don't fire
          setTimeout(() => {
            setIsNavigating(false);
            if (setLoading) setLoading(false);
            if (showProgress) {
              document.dispatchEvent(new CustomEvent('navigationComplete'));
            }
            if (onComplete) onComplete();
          }, 300); // Reduced from 700ms to 300ms
        }, 30); // Reduced from 60ms to 30ms
      } else {
        // Regular navigation
        router.push(href);
        
        setTimeout(() => {
          setIsNavigating(false);
          if (setLoading) setLoading(false);
          if (onComplete) onComplete();
        }, 200);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
      if (setLoading) setLoading(false);
      if (onComplete) onComplete();
    }
  }, [router, isNavigating]);

  return { 
    navigate,
    isNavigating 
  };
};
