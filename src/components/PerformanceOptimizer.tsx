'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

const PerformanceOptimizer = ({ children }: PerformanceOptimizerProps) => {
  const pathname = usePathname();

  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    // Preload critical CSS and JS
    const criticalResources = [
      '/api/categories', // Preload categories API
      '/api/products/featured', // Preload featured products
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }, []);

  // Optimize images
  const optimizeImages = useCallback(() => {
    // Add loading="lazy" to images that are not in viewport
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }, []);

  // Optimize navigation
  const optimizeNavigation = useCallback(() => {
    // Add smooth scrolling to anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href') || '');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }, []);

  // Optimize forms
  const optimizeForms = useCallback(() => {
    // Add debouncing to form inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach(input => {
      let timeout: NodeJS.Timeout;
      input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          // Handle input optimization here
          const target = e.target as HTMLInputElement;
          if (target.value.length > 0) {
            target.classList.add('has-value');
          } else {
            target.classList.remove('has-value');
          }
        }, 300);
      });
    });
  }, []);

  // Optimize scroll performance
  const optimizeScroll = useCallback(() => {
    let ticking = false;
    
    const updateScroll = () => {
      // Add scroll-based optimizations here
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', requestTick);
    };
  }, []);

  useEffect(() => {
    // Run optimizations when pathname changes
    preloadCriticalResources();
    optimizeImages();
    optimizeNavigation();
    optimizeForms();
    const cleanupScroll = optimizeScroll();

    return () => {
      cleanupScroll();
    };
  }, [pathname, preloadCriticalResources, optimizeImages, optimizeNavigation, optimizeForms, optimizeScroll]);

  // Add performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor navigation performance
      const navigationStart = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationStart) {
        console.log('Page Load Time:', navigationStart.loadEventEnd - navigationStart.loadEventStart);
        console.log('DOM Content Loaded:', navigationStart.domContentLoadedEventEnd - navigationStart.domContentLoadedEventStart);
      }
    }
  }, [pathname]);

  return <>{children}</>;
};

export default PerformanceOptimizer;
