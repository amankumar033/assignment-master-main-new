'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset progress when route changes
    setProgress(0);
    setIsVisible(true);

    // Simulate progress
    const timer = setTimeout(() => {
      setProgress(30);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(60);
    }, 300);

    const timer3 = setTimeout(() => {
      setProgress(90);
    }, 500);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }, 700);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div 
        className="h-1 bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
