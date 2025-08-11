"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  image: string | null; // avoid Node Buffer type in client code
  created_at: string;
  updated_at: string;
  dealer_id: number;
}

const Categoriesalone = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Background colors for categories
  const bgColors = [
    "bg-blue-100", "bg-pink-100", "bg-green-100", "bg-purple-100", 
    "bg-red-100", "bg-yellow-100", "bg-indigo-100", "bg-orange-100", 
    "bg-teal-100", "bg-cyan-100", "bg-lime-100", "bg-emerald-100"
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.categories);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError('Error loading categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || !scrollContainerRef.current || categories.length === 0) return;

    const container = scrollContainerRef.current;
    const scrollStep = 200; // Scroll by 200px each time
    const scrollInterval = 3000; // Scroll every 3 seconds

    const interval = setInterval(() => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        // Reset to beginning when reaching the end
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, scrollInterval);

    setAutoScrollInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [categories.length, isAutoScrolling]);

  // Pause auto-scroll on user interaction
  const pauseAutoScroll = () => {
    setIsAutoScrolling(false);
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
    
    // Resume auto-scroll after 5 seconds of no interaction
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 5000);
  };

  // Manual navigation
  const scrollLeft = () => {
    pauseAutoScroll();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    pauseAutoScroll();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-5 bg-gray-100">
      <div className="flex justify-center flex-col">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Featured by Categories
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D27208]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            {error}
          </div>
        ) : (
          <div className="relative max-w-6xl mx-auto px-4">
            {/* Auto-scroll indicator */}
            {isAutoScrolling && (
              <div className="absolute top-0 right-4 z-10">
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Auto-scroll
                </div>
              </div>
            )}

            {/* Navigation arrows */}
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Categories container */}
            <div 
              ref={scrollContainerRef}
              className="flex space-x-4 min-w-max overflow-x-auto scrollbar-hide pb-4"
              onMouseEnter={pauseAutoScroll}
              onTouchStart={pauseAutoScroll}
            >
              {categories.map((category, index) => (
                <div 
                  key={category.category_id} 
                  className="flex flex-col items-center group flex-shrink-0 cursor-pointer"
                  onClick={pauseAutoScroll}
                >
                  <div className={`relative w-[100px] h-[100px] rounded-full overflow-hidden shadow-lg ${bgColors[index % bgColors.length]} group-hover:shadow-xl transition-all duration-300 hover:border-3 border-[#F29F05]`}>
                    {category.image ? (
                      <Image
                        src={`/api/categories/image/${category.category_id}`}
                        alt={category.name}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-center text-black transition-colors">
                    {category.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categoriesalone;