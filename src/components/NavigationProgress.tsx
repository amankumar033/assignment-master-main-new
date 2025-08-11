'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const NavigationProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Complete navigation when pathname changes (page has loaded)
    if (!isLoading) return;
    setProgress(100);
    // keep the bar visible longer to ensure visual success and page loading
    const t = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 800); // Increased from 300ms to 800ms
    return () => clearTimeout(t);
  }, [pathname, isLoading]);

  // Reset progress when component mounts on a new page
  useEffect(() => {
    setProgress(0);
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleStart = () => {
      console.log('NavigationProgress: Starting progress bar');
      setIsLoading(true);
      setProgress(0);
      
      // Faster, more responsive progress simulation
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(timer);
            return 85;
          }
          // Faster initial progress, then slow down
          const delta = prev < 40 ? 15 : prev < 70 ? 8 : 3;
          return prev + delta;
        });
      }, 50); // Faster updates
    };

    const handleComplete = () => {
      console.log('NavigationProgress: Completing progress bar');
      setProgress(100);
      const t = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(t);
    };

    // Listen for custom navigation events
    const handleNavigationStart = () => handleStart();
    const handleNavigationComplete = () => handleComplete();

    // Listen for actual page load events
    const handlePageLoad = () => {
      if (isLoading) {
        handleComplete();
      }
    };

    const handleDOMContentLoaded = () => {
      if (isLoading) {
        handleComplete();
      }
    };

    // Handle history changes
    const handleRouteChangeComplete = () => {
      if (isLoading) handleComplete();
    };

    // Add event listeners for navigation
    document.addEventListener('navigationStart', handleNavigationStart);
    document.addEventListener('navigationComplete', handleNavigationComplete);
    window.addEventListener('load', handlePageLoad);
    window.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    
    // Listen for Next.js router events
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChangeComplete);
    }

    return () => {
      document.removeEventListener('navigationStart', handleNavigationStart);
      document.removeEventListener('navigationComplete', handleNavigationComplete);
      window.removeEventListener('load', handlePageLoad);
      window.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handleRouteChangeComplete);
      }
    };
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[1700]">
      <div 
        className="h-1 bg-gradient-to-r from-[#D27208] to-orange-500 transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default NavigationProgress;
