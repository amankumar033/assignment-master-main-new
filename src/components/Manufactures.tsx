'use client';

import { useState } from 'react';

export default function Manufacturers() {
  // Balance the manufacturers into two equal rows
  const allManufacturers = [
    { id: 1, name: 'Mahindra & Mahindra', logo: '/brands/automotive/mahindra.png' },
    { id: 2, name: 'Toyota', logo: '/brands/automotive/toyota.png' },
    { id: 3, name: 'BMW', logo: '/brands/automotive/bmw.png' },
    { id: 4, name: 'Jaguar', logo: '/brands/automotive/jaguar.png' },
    { id: 5, name: 'Nissan', logo: '/brands/automotive/nissan.png' },
    { id: 6, name: 'Peugeot', logo: '/brands/automotive/peugeot.png' },
    { id: 7, name: 'Ford Mustang', logo: '/brands/automotive/ford.png' },
    { id: 8, name: 'Porsche', logo: '/brands/automotive/porsche.png' },
    { id: 9, name: 'Audi', logo: '/brands/automotive/audi.png' },
    { id: 10, name: 'TVS', logo: '/brands/automotive/tvs.png' },
    { id: 11, name: 'Robert Bosch GmbH', logo: '/brands/automotive/bosch.png' },
    { id: 12, name: 'Denso', logo: '/brands/automotive/denso.png' },
    { id: 13, name: 'Magna International', logo: '/brands/automotive/magna.png' },
    { id: 14, name: 'Continental AG', logo: '/brands/automotive/continental.png' },
    { id: 15, name: 'Mercedes-Benz', logo: '/brands/automotive/mercedes.png' },
    { id: 16, name: 'Renault', logo: '/brands/automotive/renault.png' },
    { id: 17, name: 'PSA', logo: '/brands/automotive/psa.png' },
    { id: 18, name: 'Suzuki', logo: '/brands/automotive/suzuki.png' },
    { id: 19, name: 'Mitsubishi', logo: '/brands/automotive/mitsubishi.png' },
    { id: 20, name: 'Tata', logo: '/brands/automotive/tata.png' },
    { id: 21, name: 'Daimler', logo: '/brands/automotive/daimler.png' },
  ];

  // Split into two balanced rows (11 in first row, 10 in second row)
  const manufacturers1 = allManufacturers.slice(0, 11);
  const manufacturers2 = allManufacturers.slice(11);

  const [startIndex, setStartIndex] = useState(0);
  const visibleItems = 9; // Items visible at once

  // Calculate the maximum scroll position
  const maxScroll = Math.max(0, Math.max(manufacturers1.length, manufacturers2.length) - visibleItems);

  const nextSlide = () => {
    setStartIndex(prev => {
      return prev + 1 > maxScroll ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setStartIndex(prev => {
      return prev - 1 < 0 ? maxScroll : prev - 1;
    });
  };

  const handleBrandClick = (manufacturerName: string) => {
    // Set a timeout to detect slow navigation
    const slowNavigationTimeout = setTimeout(() => {
      console.log(`🐌 Slow navigation detected for manufacturers`);
      document.dispatchEvent(new CustomEvent('navigationStart'));
    }, 300);
    
    // Navigate to shop page with manufacturer filter
    window.location.href = `/shop?manufacturers=${encodeURIComponent(manufacturerName)}`;
    
    // Clear timeout if navigation was fast
    setTimeout(() => {
      clearTimeout(slowNavigationTimeout);
    }, 500);
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
            className="p-2 rounded-full hover:bg-gray-300 transition"
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
        {/* First Row */}
        <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${startIndex * 11.11}%)` }}>
          {manufacturers1.map((brand) => (
            <div key={brand.id} className="flex-shrink-0 mr-4 cursor-pointer" onClick={() => handleBrandClick(brand.name)}>
              <div className="flex flex-col items-center">
                <div className="w-30 h-30 rounded-full border-2 border-gray-200 p-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:border-2 hover:border-[#f29f05] bg-white overflow-hidden">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-center mt-2 font-medium text-gray-700">{brand.name}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Second Row */}
        <div className="flex transition-transform duration-300 mt-5" style={{ transform: `translateX(-${startIndex * 11.11}%)` }}>
          {manufacturers2.map((brand) => (
            <div key={brand.id} className="flex-shrink-0 mr-4 cursor-pointer" onClick={() => handleBrandClick(brand.name)}>
              <div className="flex flex-col items-center">
                <div className="w-30 h-30 rounded-full border-2 border-gray-200 p-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:border-2 hover:border-[#f29f05] bg-white overflow-hidden">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-center mt-2 font-medium text-gray-700">{brand.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}