
 
"use client";
import { useRef, useEffect, useState } from 'react';

export default function Brands() {
  // Updated brands list with only the requested brands and correct image paths
  const brands = [
    { id: 1, name: 'Ashok Leyland', logo: '/brands/ashok-leyland.png' },
    { id: 2, name: 'Bajaj Auto', logo: '/brands/bajaj.png' },
    { id: 3, name: 'Tata Motors', logo: '/brands/tata-motors.png' },
    { id: 4, name: 'Mahindra', logo: '/brands/automotive/mahindra.png' },
    { id: 5, name: 'Hyundai India', logo: '/brands/hyundai.png' },
    { id: 6, name: 'TVS Motors', logo: '/brands/automotive/tvs.png' },
    { id: 7, name: 'Royal Enfield', logo: '/brands/royal-enfield.png' },
    { id: 8, name: 'Honda Cars India', logo: '/brands/honda.png' },
    { id: 9, name: 'Maruti Suzuki', logo: '/brands/maruti-suzuki.png' },
  ];

  const brandsContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll configuration
  const ITEM_WIDTH_PX = 160; // Brand card width
  const ITEM_GAP_PX = 16; // Gap between brands
  const SCROLL_STEP_PX = ITEM_WIDTH_PX + ITEM_GAP_PX; // Scroll by one brand width

  // Pause auto-scroll when user interacts
  const pauseAutoScroll = () => {
    setIsAutoScrolling(false);
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  // Resume auto-scroll when cursor leaves
  const resumeAutoScroll = () => {
    setIsAutoScrolling(true);
  };

  // Resume auto-scroll after a delay (for mobile clicks)
  const resumeAutoScrollDelayed = () => {
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 1000); // Resume after 1 second
  };

  // Manual navigation with proper scrolling
  const scrollLeft = () => {
    pauseAutoScroll();
    const container = brandsContainerRef.current;
    if (!container) return;
    
    const currentScroll = container.scrollLeft;
    const singleSetWidth = brands.length * SCROLL_STEP_PX;
    
    if (currentScroll <= SCROLL_STEP_PX) {
      // Jump to the end of the second set for infinite scroll effect
      container.scrollTo({ left: singleSetWidth, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -SCROLL_STEP_PX, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    pauseAutoScroll();
    const container = brandsContainerRef.current;
    if (!container) return;
    
    const currentScroll = container.scrollLeft;
    const singleSetWidth = brands.length * SCROLL_STEP_PX;
    
    if (currentScroll >= singleSetWidth - SCROLL_STEP_PX) {
      // Jump to the beginning for infinite scroll effect
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: SCROLL_STEP_PX, behavior: 'smooth' });
    }
  };

  const promoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerFlash = () => {
    promoRefs.current.forEach(ref => {
      if (ref) {
        ref.classList.add('flash-active');
        
        setTimeout(() => {
          ref?.classList.remove('flash-active');
        }, 1000);
      }
    });
  };

  const handleBrandClick = (brandName: string) => {
    // Pause auto-scroll and resume after delay
    pauseAutoScroll();
    resumeAutoScrollDelayed();
    
    // Set a timeout to detect slow navigation
    const slowNavigationTimeout = setTimeout(() => {
      console.log(`🐌 Slow navigation detected for brands`);
      document.dispatchEvent(new CustomEvent('navigationStart'));
    }, 300);
    
    // Navigate to shop page with brand filter
    window.location.href = `/shop?brands=${encodeURIComponent(brandName)}`;
    
    // Clear timeout if navigation was fast
    setTimeout(() => {
      clearTimeout(slowNavigationTimeout);
    }, 500);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollInterval.current = setInterval(() => {
        const container = brandsContainerRef.current;
        if (!container) return;
        
        const currentScroll = container.scrollLeft;
        const singleSetWidth = brands.length * SCROLL_STEP_PX;
        
        if (currentScroll >= singleSetWidth - SCROLL_STEP_PX) {
          // Reset to beginning for infinite scroll
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: SCROLL_STEP_PX, behavior: 'smooth' });
        }
      }, 3000); // Scroll every 3 seconds
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isAutoScrolling, brands.length]);

  useEffect(() => {
    // Initial flash after 2 seconds
    const initialTimer = setTimeout(() => {
      triggerFlash();
      // Then repeat every 3 seconds
      animationInterval.current = setInterval(triggerFlash, 6000);
    }, 9000);

    return () => {
      clearTimeout(initialTimer);
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto py-6 sm:py-10 text-black">
      {/* Header with arrows */}
      <div className="flex justify-between items-center mb-6 sm:mb-8 px-4 sm:px-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Featured Brands</h1>
        <div className="flex space-x-4">
          <button 
            onClick={scrollLeft}
            className="p-2 rounded-full hover:bg-gray-300 transition touch-manipulation select-none"
            style={{ touchAction: 'manipulation' }}
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 rounded-full hover:bg-gray-300 transition touch-manipulation select-none"
            style={{ touchAction: 'manipulation' }}
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Brand Row Container */}
      <div className="px-4 sm:px-20 mb-6 sm:mb-8">
        {/* Brand Row - Show 7 brands with navigation */}
        <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
          <div 
            ref={brandsContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide"
            onMouseEnter={pauseAutoScroll}
            onMouseLeave={resumeAutoScroll}
            onTouchStart={pauseAutoScroll}
            onTouchEnd={resumeAutoScrollDelayed}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* First set of brands for infinite scroll */}
            {brands.map((brand) => (
              <div key={`first-${brand.id}`} className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all rounded-lg p-4 sm:p-5 h-28 sm:h-32 w-36 sm:w-40 cursor-pointer"
                  onClick={() => handleBrandClick(brand.name)}
                >
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    onError={(e) => {
                      // Fallback to a generic car icon if image fails to load
                      e.currentTarget.src = '/car-bg.png';
                    }}
                  />
                </div>
                <p className="text-sm sm:text-base text-center font-medium text-gray-700 leading-tight mt-3">
                  {brand.name}
                </p>
              </div>
            ))}
            
            {/* Second set of brands for infinite scroll */}
            {brands.map((brand) => (
              <div key={`second-${brand.id}`} className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all rounded-lg p-4 sm:p-5 h-28 sm:h-32 w-36 sm:w-40 cursor-pointer"
                  onClick={() => handleBrandClick(brand.name)}
                >
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    onError={(e) => {
                      // Fallback to a generic car icon if image fails to load
                      e.currentTarget.src = '/car-bg.png';
                    }}
                  />
                </div>
                <p className="text-sm sm:text-base text-center font-medium text-gray-700 leading-tight mt-3">
                  {brand.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promotional Posters
      <div className='bg-white pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-20'>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          <div 
            ref={el => { promoRefs.current[0] = el; }}
            className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <button className='bg-white p-2 sm:p-3 font-bold absolute bottom-4 sm:bottom-7 left-4 sm:left-7 rounded-lg cursor-pointer w-[100px] sm:w-[130px] text-sm sm:text-base hover:bg-gray-100 transition-colors'>Shop Now ➜</button>
            <img 
              src="/posters/poster1.png" 
              alt="Promotional Poster 1" 
              className="w-full h-auto"
            />
          </div>
          <div 
            ref={el => { promoRefs.current[1] = el; }}
            className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <button className='bg-white p-2 sm:p-3 font-bold absolute bottom-4 sm:bottom-7 left-4 sm:left-7 rounded-lg cursor-pointer w-[100px] sm:w-[130px] text-sm sm:text-base hover:bg-gray-100 transition-colors'>Shop Now ➜</button>
            <img 
              src="/posters/poster2.png" 
              alt="Promotional Poster 2" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div> */}
    </div>
  );
}