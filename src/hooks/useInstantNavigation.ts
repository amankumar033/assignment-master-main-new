'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useInstantNavigation = () => {
  const router = useRouter();

  const navigate = useCallback((href: string, options?: { 
    showProgress?: boolean; 
    instant?: boolean;
    onStart?: () => void;
    onComplete?: () => void;
  }) => {
    const { showProgress = true, instant = true, onStart, onComplete } = options || {};

    // Immediate UI feedback
    if (onStart) onStart();
    
    if (showProgress) {
      // Dispatch custom event for progress bar
      document.dispatchEvent(new CustomEvent('navigationStart', { 
        detail: { href, instant } 
      }));
    }

    if (instant) {
      // Prefetch to speed up navigation
      try {
        // @ts-ignore - Next Router prefetch is available in app router
        router.prefetch?.(href);
      } catch {}

      // For instant navigation, update URL immediately for visual feedback
      window.history.pushState({}, '', href);
      
      // Small delay, then actually navigate
      setTimeout(() => {
        router.push(href);
        
        // Fallback completion if Next events don't fire
        setTimeout(() => {
          if (showProgress) {
            document.dispatchEvent(new CustomEvent('navigationComplete'));
          }
          if (onComplete) onComplete();
        }, 700);
      }, 60);
    } else {
      // Regular navigation
      router.push(href);
      
      if (onComplete) onComplete();
    }
  }, [router]);

  return { navigate };
};
