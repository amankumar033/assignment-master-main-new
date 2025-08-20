"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { getValidImageSrc, handleImageError } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/priceUtils';
import ProductSkeleton from './ProductSkeleton';

const Products = () => {
  const router = useRouter();
  useEffect(() => {
    // Immediate prefetch - don't block UI
    const prefetchRoutes = () => {
      try {
        router.prefetch?.('/shop');
        router.prefetch?.('/location');
      } catch {}
    };
    
    // Execute immediately
    prefetchRoutes();
  }, [router]);
  const { user, isLoggedIn } = useAuth();
  const { cartItems, addToCart, loadingItems } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [adsLoading, setAdsLoading] = useState<boolean>(true);


  // Debug logging removed for performance

  // Fetch featured products from API - Non-blocking
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/featured');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to prioritize navigation
    const timer = setTimeout(fetchProducts, 10); // Reduced from 50ms to 10ms
    return () => clearTimeout(timer);
  }, []);

  // Fetch advertisements from API - Non-blocking
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await fetch('/api/advertisements');
        const data = await response.json();
        if (data.success) {
          setAdvertisements(data.advertisements);
        } else {
          console.error('Failed to fetch advertisements:', data.message);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
      } finally {
        setAdsLoading(false);
      }
    };

    // Delay to prioritize navigation
    const timer = setTimeout(fetchAdvertisements, 20); // Reduced from 100ms to 20ms
    return () => clearTimeout(timer);
  }, []);



  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category_name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Get products organized in 3x3 grid with navigation (3 rows max)
  const ROWS = 3;
  const VISIBLE_COLUMNS = 3; // 3 columns visible to show 3 rows
  const ITEMS_PER_COLUMN = ROWS;
  const VISIBLE_ITEMS = VISIBLE_COLUMNS * ITEMS_PER_COLUMN; // 9 items visible at once (3x3)

  const allProductsForCategory = activeCategory 
    ? productsByCategory[activeCategory] || []
    : products;

  // Calculate total columns needed (max 5 columns as per requirement)
  const totalColumns = Math.min(Math.ceil(allProductsForCategory.length / ITEMS_PER_COLUMN), 5);
  const maxColumnIndex = Math.max(0, totalColumns - VISIBLE_COLUMNS);

  // Get products for current view (4 columns starting from currentColumnIndex)
  const getVisibleProducts = () => {
    // Organize products into columns first
    const columns: Product[][] = [];
    for (let i = 0; i < totalColumns; i++) {
      const startIdx = i * ITEMS_PER_COLUMN;
      const endIdx = startIdx + ITEMS_PER_COLUMN;
      columns[i] = allProductsForCategory.slice(startIdx, endIdx);
    }
    
    // Get the 4 visible columns starting from currentColumnIndex
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

  // Reset navigation when category changes
  useEffect(() => {
    setCurrentColumnIndex(0);
  }, [activeCategory]);



  // Function to handle adding product to cart - optimized for speed
  const handleAddToCart = (product: Product, event: React.MouseEvent) => {
    // Prevent event bubbling immediately for better performance
    event.preventDefault();
    event.stopPropagation();
    
    // Add to cart with optimized call
    addToCart({
      product_id: product.product_id,
      name: product.name,
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
          <>
            {productStatus.text} <span className='text-xl font-bold text-center'>➜</span>
          </>
        )}
      </button>
    );
  };



  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-20 bg-gray-100 mt-2.5 sm:mt-8">
      {/* First Div - Heading with Navigation */}
      <div className="flex justify-between items-center mb-6  sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Featured Products</h1>
          <p className="text-sm text-gray-600 mt-1">
            Showing {productsToDisplay.length} of {allProductsForCategory.length} products
          </p>
        </div>
        
        {/* Navigation Arrows */}
        {!loading && !error && totalColumns > VISIBLE_COLUMNS && (
          <div className="flex space-x-2">
            <button
              onClick={navigateLeft}
              disabled={!canNavigateLeft}
              className={`p-2 rounded-full ${
                canNavigateLeft 
                  ? 'text-gray-700' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous columns"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={navigateRight}
              disabled={!canNavigateRight}
              className={`p-2 rounded-full ${
                canNavigateRight 
                  ? 'text-gray-700' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
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
          {[...Array(6)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-6 sm:py-8">
          <div className="text-red-600 text-lg sm:text-xl">Error: {error}</div>
        </div>
      )}



      {/* Products Display */}
      {!loading && !error && (
        <>


          {/* Products Grid - Responsive with max 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {productsToDisplay.map((product) => {
    const validImageSrc = getValidImageSrc(product.image_1);
              return (
              <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <div className="flex p-3 sm:p-4 cursor-pointer" onClick={() => window.location.href = `/products/${product.slug}`}>
                  {/* Product Image */}
                  <div className="w-28 h-28 sm:w-40 sm:h-40 relative flex-shrink-0">
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


                    
                    {/* Price and Add to Cart */}
                    <div className="mt-3 sm:mt-4 flex flex-col justify-between items-center">
                      <div className="flex items-center mb-2 gap-1">
                        {product.original_price && product.original_price > 0 && (
                          <span className="font-bold text-lg text-black line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                        <span className="font-bold text-xl text-black mr-2">
                          {formatPrice(product.sale_price || 0)}
                        </span>
                      </div>

                      {renderActionButton(product)}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </>
      )}



      {/* Advertisement Section - IDs 6 and 7 */}
      {!adsLoading && (
        <div className="mt-12 sm:mt-16 px-4 sm:px-4 md:px-8 lg:px-10">
          {(() => {
            const targetAds = advertisements.filter(ad => [6, 7].includes(ad.id));
            if (targetAds.length === 0) return null;
            
            if (targetAds.length === 1) {
              const ad = targetAds[0];
              return (
                <div className="w-full">
                  <div className="rounded-lg overflow-hidden h-40 sm:h-56 md:h-72 lg:h-[300px]">
                    <img src={ad.image} alt={ad.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              );
            }
            
            // Two advertisements - 50/50 layout
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {targetAds.map(ad => (
                  <div key={ad.id} className="rounded-lg overflow-hidden h-40 sm:h-56 md:h-72 lg:h-[300px]">
                    <img src={ad.image} alt={ad.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Products;