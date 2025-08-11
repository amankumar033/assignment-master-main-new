
 
"use client";
import { useRef, useEffect } from 'react';
import { useInstantNavigation } from '@/hooks/useInstantNavigation';

export default function Brands() {
  const { navigate } = useInstantNavigation();
  const brands = [
    { id: 1, name: 'Nike', logo: '/brands/images/1.png' },
    { id: 2, name: 'Adidas', logo: '/brands/images/2.png' },
    { id: 3, name: 'Apple', logo: '/brands/images/3.png' },
    { id: 4, name: 'Samsung', logo: '/brands/images/4.png' },
    { id: 5, name: 'Sony', logo: '/brands/images/5.png' },
    { id: 6, name: 'Microsoft', logo: '/brands/images/6.png' },
    { id: 7, name: 'Amazon', logo: '/brands/images/7.png' },
    { id: 8, name: 'Google', logo: '/brands/images/8.png' },
    { id: 9, name: 'Tesla', logo: '/brands/images/9.png' },
    { id: 10, name: 'Intel', logo: '/brands/images/10.png' },
    { id: 11, name: 'Coca-Cola', logo: '/brands/images/11.png' },
    { id: 12, name: 'Pepsi', logo: '/brands/images/12.png' },
    { id: 13, name: 'McDonalds', logo: '/brands/images/13.png' },
    { id: 14, name: 'Starbucks', logo: '/brands/images/14.png' },
  ];

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
      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-4 sm:px-20 text-black">Featured Brands</h1>
      
      {/* Brand Grid Container */}
      <div className="px-4 sm:px-20 mb-6 sm:mb-8">
        {/* Brand Grid - All brands in one continuous grid */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 bg-gray-100 p-4 sm:p-6 rounded-lg">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all rounded-lg p-2 sm:p-4 lg:p-6 h-16 sm:h-24 lg:h-32 w-[calc(33.333%-1rem)] sm:w-[calc(25%-1.5rem)] lg:w-[calc(14.285%-2.25rem)] cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
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