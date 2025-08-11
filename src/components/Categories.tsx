"use client";
import { useEffect, useRef, useState } from 'react';
import Manufacturers from './Manufactures';
import { useInstantNavigation } from '@/hooks/useInstantNavigation';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  image: string | null; // avoid Node Buffer in client code
  created_at: string;
  updated_at: string;
  dealer_id: number;
}
interface AdvertisementImage {
  id: number;
  image: string;
  name: string;
}

const Categories = () => {
  const { navigate } = useInstantNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advertisements, setAdvertisements] = useState<AdvertisementImage[]>([]);
  const [adsLoading, setAdsLoading] = useState<boolean>(true);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);

  // Function to go to previous ad
  const goToPreviousAd = () => {
    const firstRowAds = [1, 2, 3]
      .map((id) => advertisements.find((a) => a.id === id))
      .filter(Boolean) as AdvertisementImage[];
    if (firstRowAds.length > 0) {
      setCurrentAdIndex((prevIndex) => 
        prevIndex === 0 ? firstRowAds.length - 1 : prevIndex - 1
      );
    }
  };

  // Function to go to next ad
  const goToNextAd = () => {
    const firstRowAds = [1, 2, 3]
      .map((id) => advertisements.find((a) => a.id === id))
      .filter(Boolean) as AdvertisementImage[];
    if (firstRowAds.length > 0) {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % firstRowAds.length);
    }
  };

  // Categories horizontal scroll: show up to 8 at a time in viewport
  const ITEM_WIDTH_PX = 116;
  const ITEM_GAP_PX = 25;
  const SCROLL_STEP_PX = ITEM_WIDTH_PX + ITEM_GAP_PX;

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

  // Fetch advertisements
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/advertisements');
        const data = await res.json();
        if (data.success) {
          setAdvertisements(data.advertisements as AdvertisementImage[]);
        }
      } catch (e) {
        console.error('Error loading advertisements', e);
      } finally {
        setAdsLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Render all categories; overflow will be horizontally scrollable

  // No carousel auto-scroll

   // Scroll to current index (dynamic item width)
  // No programmatic scrolling

  // No next navigation

  // No prev navigation

  const promoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const categoriesContainerRef = useRef<HTMLDivElement | null>(null);
  const animationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerFlash = () => {
    promoRefs.current.forEach(ref => {
      if (ref) {
        const flash = document.createElement('div');
        flash.className = 'flash-overlay';
        ref.appendChild(flash);
        
        setTimeout(() => {
          if (ref.contains(flash)) {
            ref.removeChild(flash);
          }
        }, 1000);
      }
    });
  };

  useEffect(() => {
    // Initial flash after 2 seconds
    const initialTimer = setTimeout(() => {
      triggerFlash();
      // Then repeat every 3 seconds
      animationInterval.current = setInterval(triggerFlash, 3000);
    }, 2000);

    return () => {
      clearTimeout(initialTimer);
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, []);

  // Auto-scroll the categories row horizontally (every 1s)
  useEffect(() => {
    const container = categoriesContainerRef.current;
    if (!container) return;

    // Clear any existing
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }

    autoScrollInterval.current = setInterval(() => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const nextLeft = container.scrollLeft + SCROLL_STEP_PX;
      if (nextLeft >= maxScrollLeft - 1) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: SCROLL_STEP_PX, behavior: 'smooth' });
      }
    }, 1000);

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [categories.length]);

  // Rotate first-row advertisement (IDs 1,2,3): one visible at a time, every 2s
  useEffect(() => {
    const orderedFirstRowAds = [1, 2, 3]
      .map((id) => advertisements.find((a) => a.id === id))
      .filter(Boolean) as AdvertisementImage[];
    if (orderedFirstRowAds.length === 0) return;
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % orderedFirstRowAds.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [advertisements]);

  return (
    <div className="min-h-screen mt-4 bg-gray-100 ">
      <div className="flex flex-col">

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D27208]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-16">
            {error}
          </div>
        ) : (
          <div className="max-w-full mx-auto px-4 relative">
            <div className="categories-heading">
              <h1 className="text-2xl font-bold text-gray-900">Featured by Categories</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                const container = categoriesContainerRef.current;
                if (!container) return;
                
                // Stop auto-scroll when user manually navigates
                if (autoScrollInterval.current) {
                  clearInterval(autoScrollInterval.current);
                  autoScrollInterval.current = null;
                }
                
                container.scrollBy({ left: -SCROLL_STEP_PX, behavior: 'smooth' });
                
                // Resume auto-scroll after 3 seconds of no manual interaction
                setTimeout(() => {
                  if (!autoScrollInterval.current) {
                    autoScrollInterval.current = setInterval(() => {
                      const maxScrollLeft = container.scrollWidth - container.clientWidth;
                      const nextLeft = container.scrollLeft + SCROLL_STEP_PX;
                      if (nextLeft >= maxScrollLeft - 1) {
                        container.scrollTo({ left: 0, behavior: 'smooth' });
                      } else {
                        container.scrollBy({ left: SCROLL_STEP_PX, behavior: 'smooth' });
                      }
                    }, 1000);
                  }
                }, 3000);
              }}
              className="absolute top-1/2 -translate-y-1/2 z-10 bg-transparent rounded-full p-3 transition-all duration-300 hover:scale-110"
              style={{ left: -60 }}
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div ref={categoriesContainerRef} className="categories-container">
              {categories.map((category) => (
                <div
                  key={category.category_id}
                  className="category-circle cursor-pointer"
                  onClick={() => {
                    navigate(`/shop?category=${category.slug}`);
                  }}
                >
                  <div className="circle">
                    <img 
                      src={`/api/categories/image/${category.category_id}`} 
                      alt={category.name}
                      onError={(e) => {
                        // Replace with placeholder on error
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEM2LjY2NjcgMjAgMjAgMjAgMjAgMjBDMjAgMjAgMzMuMzMzMyAyMCAyMCAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <span className="category-label">{category.name}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const container = categoriesContainerRef.current;
                if (!container) return;
                
                // Stop auto-scroll when user manually navigates
                if (autoScrollInterval.current) {
                  clearInterval(autoScrollInterval.current);
                  autoScrollInterval.current = null;
                }
                
                container.scrollBy({ left: SCROLL_STEP_PX, behavior: 'smooth' });
                
                // Resume auto-scroll after 3 seconds of no manual interaction
                setTimeout(() => {
                  if (!autoScrollInterval.current) {
                    autoScrollInterval.current = setInterval(() => {
                      const maxScrollLeft = container.scrollWidth - container.clientWidth;
                      const nextLeft = container.scrollLeft + SCROLL_STEP_PX;
                      if (nextLeft >= maxScrollLeft - 1) {
                        container.scrollTo({ left: 0, behavior: 'smooth' });
                      } else {
                        container.scrollBy({ left: SCROLL_STEP_PX, behavior: 'smooth' });
                      }
                    }, 1000);
                  }
                }, 3000);
              }}
              className="absolute top-1/2 -translate-y-1/2 z-10 bg-transparent rounded-full p-3 transition-all duration-300 hover:scale-110"
              style={{ right: -60 }}
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <style jsx>{`
              .categories-heading {
                width: 100%;
                max-width: 1244px;
                margin: 0 auto 12px auto;
                position: static;
                top: auto;
              }
              .categories-container {
                display: flex;
                justify-content: flex-start;
                width: 100%;
                max-width: 1244px; /* exactly 9 items visible: 9*116 + 8*25 */
                margin: 0 auto;
                flex-wrap: nowrap;
                overflow-x: auto;
                -ms-overflow-style: none; /* IE and old Edge */
                scrollbar-width: none; /* Firefox */
                gap: 25px;
                height: 180px; /* increased container height */
                align-items: center;
                padding: 12px 0 0 0; /* reduce bottom padding by 12px */
              }
              .categories-container::-webkit-scrollbar { display: none; }
              .category-circle {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 0;
                flex: 0 0 auto;
                width: 116px;
              }
              .circle {
                width: 116px;
                height: 116px;
                border-radius: 50%;
                background-color: #e0e0e0;
                margin-bottom: 8px; /* restore original; container bottom spacing adjusted instead */
                box-sizing: border-box;
                border: 3px solid transparent;
                overflow: hidden;
                transition: transform 150ms ease, border-color 150ms ease;
              }
              .category-circle:hover .circle {
                border-color: #D27208;
                transform: scale(1.043); /* ~ +5px growth on 116px element */
              }
              .circle img { width: 100%; height: 100%; object-fit: cover; display: block; }
              .category-label {
                font-family: Arial, sans-serif;
                font-size: 14px;
                color: #333;
                text-align: center;
              }
            `}</style>
          </div>
        )}
      </div>

              {/* Advertisements section */}
        <div className="w-full bg-white mt-5 pt-12 ">
          <div style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Row 1: single visible ad cycling through IDs 1,2,3 every 2s with arrows and progress bar */}
        <div className="mx-auto relative">
          {(() => {
            const firstRowAds = [1, 2, 3]
              .map((id) => advertisements.find((a) => a.id === id))
              .filter(Boolean) as AdvertisementImage[];
            const activeAd = firstRowAds.length ? firstRowAds[currentAdIndex % firstRowAds.length] : null;
            
            if (!activeAd || firstRowAds.length === 0) return null;
            
            return (
              <div>
                {/* Advertisement container with arrows and progress dots overlay */}
                <div className="relative rounded-lg overflow-hidden h-[400px]">
                  <img src={activeAd.image} alt={activeAd.name} className="w-full h-[400px] object-cover" />
                  
                  {/* Left Arrow */}
                  {firstRowAds.length > 1 && (
                    <button
                      onClick={goToPreviousAd}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                      style={{ fontSize: '48px' }}
                    >
                      &#8249;
                    </button>
                  )}
                  
                  {/* Right Arrow */}
                  {firstRowAds.length > 1 && (
                    <button
                      onClick={goToNextAd}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                      style={{ fontSize: '48px' }}
                    >
                      &#8250;
                    </button>
                  )}
                  
                  {/* Progress Bar - Overlaid on advertisement */}
                  {firstRowAds.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                      {firstRowAds.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentAdIndex % firstRowAds.length
                              ? 'bg-orange-500 w-8'
                              : 'bg-gray-300 w-2'
                          }`}
                          onClick={() => setCurrentAdIndex(index)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Row 2: Ads 4 and 5 (50/50 width, fallback to 100% if only one) */}
        <div className=" mx-auto mt-6">
          {(() => {
            const secondRowAds = advertisements.filter(a => [4,5].includes(a.id));
            if (secondRowAds.length === 0) return null;
              if (secondRowAds.length === 1) {
              const ad = secondRowAds[0];
              return (
                <div className="rounded-lg overflow-hidden" style={{ height: '220px' }}>
                    <img src={ad.image} alt={ad.name} className="w-full object-cover" style={{ height: '220px' }} />
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondRowAds.map(ad => (
                  <div key={ad.id} className="rounded-lg overflow-hidden" style={{ height: '220px' }}>
                      <img src={ad.image} alt={ad.name} className="w-full object-cover" style={{ height: '220px' }} />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        </div>
      </div>
      
      {/* Featured by Manufacturers Section */}
      <Manufacturers />
    </div>
  );
};

export default Categories;