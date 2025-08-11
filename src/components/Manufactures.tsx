import { useState } from 'react';
import { useInstantNavigation } from '@/hooks/useInstantNavigation';

export default function Manufacturers() {
  const { navigate } = useInstantNavigation();
  const manufacturers1 = [
    { id: 1, name: 'Bosch', logo: '/brands/1.png' },
    { id: 2, name: 'Brembo', logo: '/brands/2.png' },
    { id: 3, name: 'ACDelco', logo: '/brands/3.png' },
    { id: 4, name: 'Mann Filter', logo: '/brands/4.png' },
    { id: 5, name: 'Valeo', logo: '/brands/5.png' },
    { id: 6, name: 'NGK', logo: '/brands/6.png' },
    { id: 7, name: 'Febi', logo: '/brands/7.png' },
    { id: 8, name: 'ATE', logo: '/brands/8.png' },
    { id: 9, name: 'Sachs', logo: '/brands/1.png' },
    { id: 10, name: 'Luk', logo: '/brands/2.png' },
    { id: 11, name: 'Mahle', logo: '/brands/3.png' },
    { id: 12, name: 'Hella', logo: '/brands/4.png' },
    // Add more as needed
  ];
  const manufacturers2 = [
    { id: 1, name: 'Bosch', logo: '/brands/8.png' },
    { id: 2, name: 'Brembo', logo: '/brands/7.png' },
    { id: 3, name: 'ACDelco', logo: '/brands/6.png' },
    { id: 4, name: 'Mann Filter', logo: '/brands/4.png' },
    { id: 5, name: 'Valeo', logo: '/brands/5.png' },
    { id: 6, name: 'NGK', logo: '/brands/6.png' },
    { id: 7, name: 'Febi', logo: '/brands/7.png' },
    { id: 8, name: 'ATE', logo: '/brands/8.png' },
    { id: 9, name: 'Sachs', logo: '/brands/4.png' },
    { id: 10, name: 'Luk', logo: '/brands/3.png' },
    { id: 11, name: 'Mahle', logo: '/brands/2.png' },
    { id: 12, name: 'Hella', logo: '/brands/1.png' },
    // Add more as needed
  ];

  const [startIndex, setStartIndex] = useState(0);
  const visibleItems = 9; // Items visible at once
  const manufacturers = [...manufacturers1, ...manufacturers2];

  const nextSlide = () => {
    setStartIndex(prev => {
      const maxIndex = manufacturers1.length - visibleItems - 1; // Remove one position
      return prev + 1 > maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setStartIndex(prev => {
      const maxIndex = manufacturers1.length - visibleItems - 1; // Remove one position
      return prev - 1 < 0 ? maxIndex : prev - 1;
    });
  };
  return (
    <div className="container mx-auto pt-20 bg-white text-black px-1 sm:px-20 pb-10">
      {/* Header with arrows */}
      <div className="flex justify-between items-center mb-8 mt-9 sm:mt-0">
        <h2 className="text-3xl font-bold">Featured Manufacturers</h2>
        <div className="flex space-x-4">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full hover:bg-gray-300 transition"
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full  hover:bg-gray-300 transition"
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-300 " style={{ transform: `translateX(-${startIndex * (100/visibleItems)}%)` }}>
          {manufacturers1.map((brand) => (
            <div key={brand.id} className="flex-shrink-0 mr-4 cursor-pointer" onClick={() => navigate('/shop')}>
              <div className="flex flex-col items-center">
                <div className="w-30 h-30 rounded-full border-2 border-gray-200 p-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:border-2 hover:border-[#f29f05] bg-gray-100 hover:bg-white ">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-16 h-16 object-contain "
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex transition-transform duration-300 mt-5" style={{ transform: `translateX(-${startIndex * (100/visibleItems)}%)` }}>
          {manufacturers2.map((brand) => (
            <div key={brand.id} className="flex-shrink-0 mr-4 cursor-pointer" onClick={() => navigate('/shop')}>
              <div className="flex flex-col items-center">
                <div className="w-30 h-30 rounded-full border-2 border-gray-200 p-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:border-2 hover:border-[#f29f05] bg-gray-100 hover:bg-white ">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-16 h-16 object-contain "
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}