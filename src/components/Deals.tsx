"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Product } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { getValidImageSrc, handleImageError } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/priceUtils';
import ProductSkeleton from './ProductSkeleton';


const Deals = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, addToCart, removeFromCart, loadingItems } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 30,
    seconds: 45
  });

  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);

  // Get products organized in 3x3 grid with navigation (3 rows max)
  const ROWS = 3;
  const VISIBLE_COLUMNS = 3; // 3 columns visible to show 3 rows
  const ITEMS_PER_COLUMN = ROWS;
  const VISIBLE_ITEMS = VISIBLE_COLUMNS * ITEMS_PER_COLUMN; // 9 items visible at once (3x3)

  // Calculate total columns needed (max 5 columns as per requirement)
  const totalColumns = Math.min(Math.ceil(products.length / ITEMS_PER_COLUMN), 5);
  const maxColumnIndex = Math.max(0, totalColumns - VISIBLE_COLUMNS);

  // Debug logging
  useEffect(() => {
    console.log('Deals component - Auth state:', { user, isLoggedIn });
  }, [user, isLoggedIn]);

  // Fetch hot deal products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/hot-deals');
        const data = await response.json();
        
        if (data.success) {
          console.log('Fetched hot deal products:', data.products);
          setProducts(data.products);
        } else {
          setError(data.message || 'Failed to fetch hot deal products');
        }
      } catch (err) {
        setError('Failed to fetch hot deal products');
        console.error('Error fetching hot deal products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Refresh products when cart is updated (to reflect stock changes)
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      console.log('Cart updated, refreshing hot deal products to reflect stock changes');
      // Refresh products to show updated stock quantities
      const fetchProducts = async () => {
        try {
          const response = await fetch('/api/products/hot-deals');
          const data = await response.json();
          
          if (data.success) {
            setProducts(data.products);
          }
        } catch (err) {
          console.error('Error refreshing hot deal products:', err);
        }
      };
      
      fetchProducts();
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get products for current view (3 columns starting from currentColumnIndex)
  const getVisibleProducts = () => {
    // Organize products into columns first
    const columns: Product[][] = [];
    for (let i = 0; i < totalColumns; i++) {
      const startIdx = i * ITEMS_PER_COLUMN;
      const endIdx = startIdx + ITEMS_PER_COLUMN;
      columns[i] = products.slice(startIdx, endIdx);
    }
    
    // Get the 3 visible columns starting from currentColumnIndex
    const visibleColumns = columns.slice(currentColumnIndex, currentColumnIndex + VISIBLE_COLUMNS);
    
    // Flatten the visible columns back to a single array
    return visibleColumns.flat();
  };

  const productsToDisplay = getVisibleProducts();

  // Navigation functions
  const canNavigateLeft = currentColumnIndex > 0;
  const canNavigateRight = currentColumnIndex < maxColumnIndex;

  const navigateLeft = () => {
    if (canNavigateLeft) {
      setCurrentColumnIndex(prev => prev - 1);
    }
  };

  const navigateRight = () => {
    if (canNavigateRight) {
      setCurrentColumnIndex(prev => prev + 1);
    }
  };

  // Function to handle adding product to cart - optimized for speed
  const handleAddToCart = (product: Product, event: React.MouseEvent) => {
    // Prevent event bubbling immediately for better performance
    event.preventDefault();
    event.stopPropagation();
    
    // Add to cart with optimized call
    addToCart({
      product_id: product.product_id,
      name: product.name || 'Product',
      price: product.sale_price,
      image: product.image_1,
      stock_quantity: Number(product.stock_quantity) || 0
    });
  };

  // Function to get product status (respects current cart quantities)
  const getProductStatus = (product: Product) => {
    if (product.is_active === 0) {
      return { status: 'unavailable', text: 'Unavailable', color: 'text-red-600' };
    }
    const cartItem = cartItems.find(ci => ci.product_id === product.product_id);
    const cartQty = cartItem ? cartItem.quantity : 0;
    const initialStock = Number(product.stock_quantity) || 0;
    const availableStock = Math.max(0, initialStock - cartQty);
    if (availableStock <= 0) {
      return { status: 'out-of-stock', text: 'Out of Stock', color: 'text-red-600' };
    }
    return { status: 'available', text: 'Add to Cart', color: 'text-[#034c8c]' };
  };

  // Function to render action button
  const renderActionButton = (product: Product) => {
    const productStatus = getProductStatus(product);

    if (productStatus.status === 'unavailable') return (<div className="w-full py-2 text-center text-red-600 font-medium">Unavailable</div>);
    if (productStatus.status === 'out-of-stock') return (<div className="w-full py-2 text-center text-red-600 font-medium">Out of Stock</div>);

    const isLoading = loadingItems.has(product.product_id);
    return (
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          if (isLoading) return;
          e.stopPropagation();
          handleAddToCart(product, e);
        }}
        disabled={isLoading}
        className={`relative z-10 font-bold px-4 py-2 text-lg ${isLoading ? 'cursor-wait text-gray-400' : 'text-[#034c8c] cursor-pointer'}`}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Adding...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            {productStatus.text} <span className='text-xl font-bold'>➜</span>
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="container sm:px-[75px] px-[16px] bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 py-6 sm:py-10">
      {/* Header with countdown and navigation */}
      <div className="flex flex-col md:flex-row  justify-between items-center mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0 md:gap-[5px]">
          <div className="text-center md:text-left mb-4 md:mb-0" style={{ marginRight: '10px' }}>
            <h1 className="text-xl sm:text-2xl font-bold text-black ">Best Deals of the week!</h1>
            <p className="text-sm text-black/80 mt-1">
              Showing {productsToDisplay.length} of {products.length} deals
            </p>
          </div>
          <div className="flex items-center ">
            <div className="flex gap-1">
              {/* Days */}
              <div className="flex flex-col items-center">
                <span className="bg-amber-700 px-2 sm:px-3 py-1 sm:py-2 text-white rounded text-sm sm:text-lg font-bold">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
              </div>
              
              <span className="h-full text-amber-700 text-lg sm:text-2xl font-bold mt-1">:</span>
              
              {/* Hours */}
              <div className="flex flex-col items-center">
                <span className="bg-amber-700 px-2 sm:px-3 py-1 sm:py-2 text-white rounded text-sm sm:text-lg font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
              </div>
              
              <span className="h-full text-amber-700 text-lg sm:text-2xl font-bold mt-1">:</span>
              
              {/* Minutes */}
              <div className="flex flex-col items-center">
                <span className="bg-amber-700 px-2 sm:px-3 py-1 sm:py-2 text-white rounded text-sm sm:text-lg font-bold">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
              </div>
              
              <span className="h-full text-amber-700 text-lg sm:text-2xl font-bold mt-1">:</span>
              
              {/* Seconds */}
              <div className="flex flex-col items-center">
                <span className="bg-amber-700 px-2 sm:px-3 py-1 sm:py-2 text-white rounded text-sm sm:text-lg font-bold">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {!loading && !error && totalColumns > VISIBLE_COLUMNS && (
          <div className="flex space-x-2">
            <button
              onClick={navigateLeft}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canNavigateLeft) navigateLeft();
              }}
              disabled={!canNavigateLeft}
              className={`p-2 rounded-full transition-colors touch-manipulation select-none ${
                canNavigateLeft 
                  ? 'hover:bg-black/30 text-black bg-black/20' 
                  : 'text-black/40 cursor-not-allowed bg-black/10'
              }`}
              style={{ touchAction: 'manipulation' }}
              aria-label="Previous columns"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={navigateRight}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canNavigateRight) navigateRight();
              }}
              disabled={!canNavigateRight}
              className={`p-2 rounded-full transition-colors touch-manipulation select-none ${
                canNavigateRight 
                  ? 'hover:bg-black/30 text-black bg-black/20' 
                  : 'text-black/40 cursor-not-allowed bg-black/10'
              }`}
              style={{ touchAction: 'manipulation' }}
              aria-label="Next columns"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-6 sm:py-8">
          <div className="text-red-200 text-lg sm:text-xl">Error: {error}</div>
        </div>
      )}

      {/* Products Grid - 3x3 format */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {productsToDisplay.map((product) => {
            const validImageSrc = getValidImageSrc(product.image_1);
            return (
              <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                <div className="flex p-3 sm:p-4 cursor-pointer" onClick={() => router.push(`/products/${product.slug}`)}>
                  {/* Product Image */}
                  <div className="w-40 h-40 relative flex-shrink-0">
                    <Image
                      src={validImageSrc}
                      alt={product.name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/engine1.png';
                      }}
                      unoptimized={!!(product.image_1 && product.image_1.startsWith('https://'))}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="ml-3 flex-1 justify-end">
                    <h3 className="font-bold text-xl flex justify-center text-black text-center">{product.name}</h3>

                    <div className="flex justify-center items-center mt-1 font-bold">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(Number(product.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-lg text-black ml-1">({Number(product.rating || 0).toFixed(1)})</span>
                    </div>
                    
                    {/* Price Row */}
                    <div className="mt-3 sm:mt-4 flex justify-center">
                      <div className="flex items-center gap-1">
                        {product.original_price && product.original_price > 0 && (
                          <span className="font-bold text-lg text-black line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                        <span className="font-bold text-xl text-black">
                          {formatPrice(product.sale_price || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Row */}
                    <div className="mt-2 flex justify-center">
                      {renderActionButton(product)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Deals;
