'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getValidImageSrc, handleImageError } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/priceUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';


import ProductSkeleton from '@/components/ProductSkeleton';

type Category = {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
  dealer_id: string;
};

type SubCategory = {
  sub_category_id: string;
  name: string;
  slug: string;
  category_id: string;
  created_at: string;
  updated_at: string;
};

type Product = {
  product_id: string;
  name: string;
  slug: string;
  sale_price: string;
  original_price: string;
  rating: string;
  image_1: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  category_name: string;
  category_slug: string;
  subcategory_slug?: string;
  sub_brand_name?: string;
    brand_name: string;
  stock_quantity: string;
  is_active: string;
  is_featured: string;
  is_hot_deal: string;
};

// Remove filterOptions and all filter UI
// Sidebar: Shop by Categories
// Top carousel: clickable category images

export default function ShopPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, cartItems, loading: cartLoading, error: cartError, loadingItems } = useCart();

  const [startIndex, setStartIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(6);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<string, SubCategory[]>>({});
  const [loadingSubcategories, setLoadingSubcategories] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const productsRef = useRef<Product[]>([]);
  // Stable baseline of ALL featured products for counts and filter lists (not affected by current filters)
  const allFeaturedProductsRef = useRef<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openListCategoryId, setOpenListCategoryId] = useState<string | null>(null);
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const [isNavigating, setIsNavigating] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSubBrands, setSelectedSubBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const fetchCounterRef = useRef(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(16); // 4x4 grid

  // Brands accordion states
  const [brandsFromApi, setBrandsFromApi] = useState<string[]>([]);
  const [subBrandsByBrand, setSubBrandsByBrand] = useState<Record<string, { sub_brand_name: string; brand_name: string }[]>>({});
  const [loadingSubBrands, setLoadingSubBrands] = useState<Record<string, boolean>>({});
  const [openBrandName, setOpenBrandName] = useState<string | null>(null);
  const brandContentRefs = useRef<Record<string, HTMLDivElement | null>>({});



  // Function to get product status
  const getProductStatus = (product: Product) => {
    // Unavailable if inactive
    if ((parseInt(product.is_active) || 0) === 0) {
      return { status: 'unavailable', text: 'Unavailable', color: 'text-red-600', bgColor: 'bg-gray-300' };
    }
    // Compute available stock relative to cart
    const cartItem = cartItems.find(ci => ci.product_id === product.product_id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    const initialStock = (originalStockValues[product.product_id] ?? parseInt(product.stock_quantity) ?? 0) as number;
    const availableStock = Math.max(0, initialStock - cartQuantity);
    if (availableStock <= 0) {
      return { status: 'out-of-stock', text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-gray-300' };
    }
    // Available
    return { status: 'available', text: 'Add to Cart', color: 'text-white', bgColor: 'bg-blue-600' };
  };

  // 2. Add to Cart handler
  const handleAddToCart = async (productId: string, event: React.MouseEvent) => {
    // Stop event propagation to prevent Link navigation
    event.preventDefault();
    event.stopPropagation();
    
    try {
      // Find the product to get its details
      const product = products.find(p => p.product_id === productId);
      if (!product) {
        return;
      }

      // Quick stock check
      const cartItem = cartItems.find(item => item.product_id === product.product_id);
      const cartQuantity = cartItem ? cartItem.quantity : 0;
      const originalStock = originalStockValues[product.product_id] || parseInt(product.stock_quantity) || 0;
      const availableStock = originalStock - cartQuantity;
      
      if (availableStock <= 0) {
        return;
      }



      // Add to cart silently (pass only allowed fields)
      addToCart({
        product_id: product.product_id,
        name: product.name,
        price: parseFloat(product.sale_price),
        image: product.image_1,
        stock_quantity: parseInt(product.stock_quantity) || 0,
      }).catch(error => {
        console.error('Error adding to cart:', error);
      });
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Ultra-fast product navigation with progress bar
  const handleProductClick = useCallback(async (productSlug: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Product clicked:', productSlug);
    
    // Show immediate visual feedback
    const target = event.currentTarget as HTMLElement;
    target.style.transform = 'scale(0.98)';
    target.style.transition = 'transform 0.1s ease';
    
    // Set a timeout to detect slow navigation
    const slowNavigationTimeout = setTimeout(() => {
      console.log(`🐌 Slow navigation detected for product: ${productSlug}`);
      setIsNavigating(true);
      document.dispatchEvent(new CustomEvent('navigationStart'));
    }, 300); // Show progress bar if navigation takes longer than 300ms
    
    // Use direct navigation
    router.push(`/products/${productSlug}`);
    
    // Reset transform after navigation
    setTimeout(() => {
      target.style.transform = '';
      target.style.transition = '';
    }, 100);
    
    // Clear timeout if navigation was fast (we can't measure this directly, so we'll use a reasonable timeout)
    setTimeout(() => {
      clearTimeout(slowNavigationTimeout);
    }, 500);
  }, [router]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    }
  };

  // Fetch baseline: all featured products (no filters) for stable counts and filter options
  const fetchAllFeaturedProducts = async () => {
    try {
      const url = `/api/products/all?isFeatured=true`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data?.success && Array.isArray(data.products)) {
        allFeaturedProductsRef.current = data.products;
        // Initialize brands list from the baseline to avoid disappearing options
        const baselineBrands = [...new Set((data.products as Product[]).map(p => p.brand_name).filter(Boolean))] as string[];
        setBrandsFromApi(baselineBrands);
      }
    } catch (e) {
      console.error('Failed to fetch baseline featured products', e);
    }
  };

  // Fetch subcategories for a specific category and cache them
  const fetchSubcategories = async (categoryId: string) => {
    if (subcategoriesByCategory[categoryId]) return;
    setLoadingSubcategories(prev => ({ ...prev, [categoryId]: true }));
    try {
      const response = await fetch(`/api/subcategories?category_id=${categoryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSubcategoriesByCategory(prev => ({ ...prev, [categoryId]: data.subcategories }));
      } else {
        console.error('Failed to fetch subcategories:', data.message);
        // Set empty array to prevent repeated failed requests
        setSubcategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      // Set empty array to prevent repeated failed requests
      setSubcategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
    }
    finally {
      setLoadingSubcategories(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Store original stock values to track changes
  const [originalStockValues, setOriginalStockValues] = useState<{ [key: string]: number }>({});

  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Show progress bar for product loading
      document.dispatchEvent(new CustomEvent('navigationStart'));
      const thisFetchId = ++fetchCounterRef.current;
      const params = new URLSearchParams();
      
      // Add search parameter for comprehensive search
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      // Add filter parameters
      if (selectedCategories.length > 0) {
        params.append('category', selectedCategories[0]);
      }
      if (priceRange[0] > 0) {
        params.append('minPrice', priceRange[0].toString());
      }
      if (priceRange[1] < 1000) {
        params.append('maxPrice', priceRange[1].toString());
      }
      if (selectedRatings.length > 0) {
        params.append('rating', Math.max(...selectedRatings).toString());
      }
      if (inStockOnly) {
        params.append('inStockOnly', 'true');
      }
      
      // Always fetch featured products
      params.append('isFeatured', 'true');

      const apiUrl = `/api/products/all?${params.toString()}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        // Drop stale responses
        if (thisFetchId !== fetchCounterRef.current) return;
        
        // Store original stock values
        const stockMap: { [key: string]: number } = {};
        data.products.forEach((product: any) => {
          stockMap[product.product_id] = parseInt(product.stock_quantity) || 0;
        });
        setOriginalStockValues(stockMap);
        
        setProducts(data.products);
        productsRef.current = data.products;
      } else {
        setError('Failed to fetch products');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
      // Hide progress bar when products finish loading
      document.dispatchEvent(new CustomEvent('navigationComplete'));
    }
  };

  // Prefetch frequent routes and load data on component mount
  useEffect(() => {
    // Show progress bar for initial page load
    if (loading) {
      document.dispatchEvent(new CustomEvent('navigationStart'));
    }
    
    // Immediate UI setup - don't block navigation
    const setupUI = () => {
      try {
        // @ts-ignore optional prefetch on app router
        router.prefetch?.('/shop');
        router.prefetch?.('/location');
      } catch {}
    };
    
    // Load data in background - non-blocking
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchAllFeaturedProducts()
        ]);
        // Hide progress bar when initial data loading is complete
        document.dispatchEvent(new CustomEvent('navigationComplete'));
      } catch (error) {
        console.error('Background data loading error:', error);
        // Hide progress bar even if there's an error
        document.dispatchEvent(new CustomEvent('navigationComplete'));
      }
    };
    
    // Setup UI immediately
    setupUI();
    
    // Load data in background with small delay to prioritize navigation
    const dataTimer = setTimeout(loadData, 20); // Reduced from 100ms to 20ms
    
    return () => clearTimeout(dataTimer);
  }, []);

  // Keep brands list stable based on baseline; refresh when baseline changes (set inside fetch)
  // No-op effect here on products to prevent flicker in brand list

  // API helpers for brands/sub-brands
  const fetchSubBrands = async (brandName: string) => {
    if (subBrandsByBrand[brandName]) return;
    setLoadingSubBrands(prev => ({ ...prev, [brandName]: true }));
    try {
      const resp = await fetch(`/api/subbrands?brand_name=${encodeURIComponent(brandName)}`);
      const data = await resp.json();
      if (data.success) {
        setSubBrandsByBrand(prev => ({ ...prev, [brandName]: data.subbrands || [] }));
      }
    } catch (e) {
      console.error('Failed to fetch sub-brands for', brandName, e);
    } finally {
      setLoadingSubBrands(prev => ({ ...prev, [brandName]: false }));
    }
  };

  // Prefetch subcategories for all categories after categories load (best-effort, limited concurrency) - Non-blocking
  useEffect(() => {
    if (categories.length === 0) return;
    let isCancelled = false;

    // Delay prefetching to prioritize navigation
    const prefetchTimer = setTimeout(() => {
      const concurrency = 2; // Reduced concurrency
      const queue = [...categories.map(c => c.category_id)];

      const runNext = async () => {
        if (isCancelled) return;
        const id = queue.shift();
        if (!id) return;
        if (!subcategoriesByCategory[id]) {
          await fetchSubcategories(id);
        }
        if (!isCancelled && queue.length > 0) {
          // Add delay between requests to prevent blocking
          setTimeout(() => runNext(), 50);
        }
      };

      const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => runNext());
      Promise.all(workers).catch(() => {});
    }, 500); // Delay prefetching

    return () => {
      isCancelled = true;
      clearTimeout(prefetchTimer);
    };
  }, [categories]);

  // Prefetch sub-brands for all brands after brands list is derived (best-effort, limited concurrency) - Non-blocking
  useEffect(() => {
    if (brandsFromApi.length === 0) return;
    let isCancelled = false;

    // Delay prefetching to prioritize navigation
    const prefetchTimer = setTimeout(() => {
      const concurrency = 2; // Reduced concurrency
      const queue = [...brandsFromApi];

      const runNext = async () => {
        if (isCancelled) return;
        const name = queue.shift();
        if (!name) return;
        if (!subBrandsByBrand[name]) {
          await fetchSubBrands(name);
        }
        if (!isCancelled && queue.length > 0) {
          // Add delay between requests to prevent blocking
          setTimeout(() => runNext(), 50);
        }
      };

      const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => runNext());
      Promise.all(workers).catch(() => {});
    }, 1000); // Longer delay for sub-brands

    return () => {
      isCancelled = true;
      clearTimeout(prefetchTimer);
    };
  }, [brandsFromApi]);

  // No hover timeouts needed

  // Initialize filters from URL and react to URL param changes via Next router
  useEffect(() => {
    if (!searchParams) return;
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const subcategoriesParam = searchParams.get('subcategories');
    const brandsParam = searchParams.get('brands');
    const subbrandsParam = searchParams.get('subbrands');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const ratingsParam = searchParams.get('ratings');
    const inStockOnlyParam = searchParams.get('inStockOnly');

    setSearchQuery(searchParam || '');
    setSelectedCategories(categoryParam ? [categoryParam] : []);
    setSelectedSubcategories(subcategoriesParam ? subcategoriesParam.split(',').filter(Boolean) : []);
    setSelectedBrands(brandsParam ? brandsParam.split(',').filter(Boolean) : []);
    setSelectedSubBrands(subbrandsParam ? subbrandsParam.split(',').filter(Boolean) : []);
    setPriceRange([
      minPriceParam ? parseInt(minPriceParam) : 0,
      maxPriceParam ? parseInt(maxPriceParam) : 1000,
    ]);
    setSelectedRatings(ratingsParam ? ratingsParam.split(',').map(r => parseInt(r)).filter(n => !isNaN(n)) : []);
    setInStockOnly(inStockOnlyParam === '1');
    setFiltersInitialized(true);
  }, [searchParams]);

  // Listen for cart updates to refresh products (for stock updates)
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      console.log('Shop page received cart update, updating products locally for stock updates');
      console.log('Cart update event detail:', event.detail);
      
      // Update products locally instead of reloading from server
      if (event.detail && event.detail.cartItems) {
        console.log('Cart items found:', event.detail.cartItems);
        setProducts(prevProducts => {
          return prevProducts.map(product => {
            // Find if this product is in the cart
            const cartItem = event.detail.cartItems.find((item: any) => item.product_id === product.product_id);
            if (cartItem) {
              // Product is in cart, calculate available stock using original stock value
              const originalStock = originalStockValues[product.product_id] || 0;
              const cartQuantity = cartItem.quantity || 0;
              const availableStock = Math.max(0, originalStock - cartQuantity);
              console.log(`Product ${product.name}: Original stock ${originalStock}, Cart quantity ${cartQuantity}, Available stock ${availableStock}`);
              return { ...product, stock_quantity: availableStock.toString() };
            } else {
              // Product is not in cart, restore original stock
              const originalStock = originalStockValues[product.product_id] || 0;
              return { ...product, stock_quantity: originalStock.toString() };
            }
          });
        });
      } else {
        // If no cart items, restore all products to original stock
        console.log('No cart items in event detail, restoring all products to original stock');
        setProducts(prevProducts => {
          return prevProducts.map(product => {
            const originalStock = originalStockValues[product.product_id] || 0;
            return { ...product, stock_quantity: originalStock.toString() };
          });
        });
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, [originalStockValues]); // Add originalStockValues to dependency array



  // Listen for cartItems changes from CartContext - only when products are loaded
  useEffect(() => {
    if (products.length > 0 && Object.keys(originalStockValues).length > 0) {
      console.log('Shop page cartItems changed, updating products locally');
      const updatedProducts = products.map(product => {
        // Find if this product is in the cart
        const cartItem = cartItems.find(item => item.product_id === product.product_id);
        if (cartItem) {
          // Product is in cart, calculate available stock using original stock value
          const originalStock = originalStockValues[product.product_id] || 0;
          const cartQuantity = cartItem.quantity || 0;
          const availableStock = Math.max(0, originalStock - cartQuantity);
          console.log(`Product ${product.name}: Original stock ${originalStock}, Cart quantity ${cartQuantity}, Available stock ${availableStock}`);
          return { ...product, stock_quantity: availableStock.toString() };
        } else {
          // Product is not in cart, restore original stock
          const originalStock = originalStockValues[product.product_id] || 0;
          return { ...product, stock_quantity: originalStock.toString() };
        }
      });
      
      // Only update if there are actual changes
      const hasChanges = updatedProducts.some((updatedProduct, index) => 
        updatedProduct.stock_quantity !== products[index].stock_quantity
      );
      
      if (hasChanges) {
        setProducts(updatedProducts);
        productsRef.current = updatedProducts;
      }
    }
  }, [cartItems, originalStockValues]);

  // Refetch products when filters change (after URL applied)
  useEffect(() => {
    if (!filtersInitialized) return;
    
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filtersInitialized, selectedCategories, selectedSubcategories, selectedBrands, selectedSubBrands, selectedRatings, priceRange, inStockOnly, searchQuery]);

  // Sync selected filters to URL via Next router (no reload)
  useEffect(() => {
    if (!filtersInitialized) return;
    
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedCategories[0]) params.set('category', selectedCategories[0]);
      if (selectedSubcategories.length) params.set('subcategories', selectedSubcategories.join(','));
      if (selectedBrands.length) params.set('brands', selectedBrands.join(','));
      if (selectedSubBrands.length) params.set('subbrands', selectedSubBrands.join(','));
      if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
      if (priceRange[1] < 1000) params.set('maxPrice', String(priceRange[1]));
      if (selectedRatings.length) params.set('ratings', selectedRatings.join(','));
      if (inStockOnly) params.set('inStockOnly', '1');
      if (searchQuery) params.set('search', searchQuery);
      const newQuery = params.toString();
      if (newQuery === searchParams?.toString()) return;
      
      router.push(`/shop${newQuery ? `?${newQuery}` : ''}`);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filtersInitialized, selectedCategories, selectedSubcategories, selectedBrands, selectedSubBrands, priceRange, selectedRatings, inStockOnly, searchQuery, router, searchParams]);

  // Extract unique values for filters from products
  const filterCategories = [...new Set(allFeaturedProductsRef.current.map(p => p.category_name))];
  const brands = [...new Set(products.map(p => p.brand_name))].filter(Boolean) as string[];
  const filteredBrands = brands.filter(brand => 
    (brand || '').toLowerCase().includes(brandSearch.toLowerCase())
  );
  const ratings = [1, 2, 3, 4, 5];



  // Update visible items based on screen size
  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth >= 1024) {
        setVisibleItems(6); // Desktop: show 6 items
      } else if (window.innerWidth >= 768) {
        setVisibleItems(4); // Tablet: show 4 items
      } else {
        setVisibleItems(2); // Mobile: show 2 items
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  const nextSlide = () => {
    setStartIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= categories.length - visibleItems + 1 ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setStartIndex((prevIndex) => {
      const prevIndexNew = prevIndex - 1;
      return prevIndexNew < 0 ? categories.length - visibleItems : prevIndexNew;
    });
  };

  const toggleFilterOption = (value: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelected(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  // Filter and sort products (unavailable/out-of-stock last)
  const filteredProducts = products.filter(product => {
    // Convert string values to numbers for comparison
    const salePrice = parseFloat(product.sale_price) || 0;
    const originalPrice = parseFloat(product.original_price) || 0;
    const rating = parseFloat(product.rating) || 0;
    const stockQuantity = parseInt(product.stock_quantity) || 0;
    const isActive = parseInt(product.is_active) || 0;
    
    // Only apply filters if they are actually selected
    // If subcategories are selected, ignore category filter; otherwise use category filter
    const categoryMatch = selectedSubcategories.length > 0
      ? true
      : selectedCategories.length === 0 || selectedCategories.includes(product.category_slug);
    // Note: Subcategory filtering is currently handled through category selection
    // TODO: Add subcategory_id to products table and update API to include subcategory data
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand_name);
    const ratingMatch = selectedRatings.length === 0 || selectedRatings.some(r => Math.floor(rating) === r);
    const priceMatch = salePrice >= priceRange[0] && salePrice <= priceRange[1];
    const stockMatch = !inStockOnly || stockQuantity > 0;
    
    // If subcategories selected, additionally match by product subcategory if available
    const subcategoryMatch = selectedSubcategories.length === 0 || selectedSubcategories.includes(product.subcategory_slug || '');
    // If subbrands selected, match by product sub_brand_name
    const subBrandMatch = selectedSubBrands.length === 0 || selectedSubBrands.includes((product as any).sub_brand_name || '');
    const passes = categoryMatch && subcategoryMatch && subBrandMatch && brandMatch && ratingMatch && priceMatch && stockMatch;
    
    return passes;
  }).sort((a, b) => {
    // Sort products: available first, then unavailable, then out-of-stock
    const statusA = getProductStatus(a);
    const statusB = getProductStatus(b);
    
    // Available products first
    if (statusA.status === 'available' && statusB.status !== 'available') return -1;
    if (statusA.status !== 'available' && statusB.status === 'available') return 1;
    
    // Then unavailable, then out-of-stock
    if (statusA.status === 'unavailable' && statusB.status === 'out-of-stock') return -1;
    if (statusA.status === 'out-of-stock' && statusB.status === 'unavailable') return 1;
    
    return 0;
  });

  // Get paginated products
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedSubcategories, selectedBrands, selectedSubBrands, selectedConditions, selectedMaterials, selectedRatings, priceRange, inStockOnly]);

  // Debug: Log final counts
  console.log(`Products: ${products.length} fetched, ${filteredProducts.length} displayed`);
  console.log('Current filters:', { selectedCategories, selectedSubcategories, selectedBrands, selectedConditions, selectedMaterials, priceRange, selectedRatings, inStockOnly });



  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto px-4">
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold mb-2 text-red-600">Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
          <div className="min-h-screen bg-gray-100 p-6">
        {/* Progress Bar */}
        {(isNavigating || loading) && (
          <div className="fixed top-0 left-0 w-full z-[1700]">
            <div className="h-1 bg-gradient-to-r from-[#D27208] to-orange-500 animate-pulse" style={{ width: '100%' }} />
          </div>
        )}
        
        {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 mb-3">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link 
                href="/" 
                className="inline-flex items-center text-sm font-medium text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  // Set a timeout to detect slow navigation
                  const slowNavigationTimeout = setTimeout(() => {
                    console.log(`🐌 Slow navigation detected for home`);
                    document.dispatchEvent(new CustomEvent('navigationStart'));
                  }, 300);
                  
                  router.push('/');
                  
                  // Clear timeout if navigation was fast
                  setTimeout(() => {
                    clearTimeout(slowNavigationTimeout);
                  }, 500);
                }}
              >
                <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                </svg>
                Home
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 relative after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-gray-500">
                  Shop
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      <div className='w-full bg-gray-200 h-[1px] mb-3'></div>

      {/* Search Results Display */}
      {searchQuery && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  Search filter: <span className="font-bold">"{searchQuery}"</span>
                </span>
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  // Update URL to remove search parameter
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('search');
                    window.history.replaceState({}, '', url.toString());
                  }
                  
                  // Trigger product reload with progress bar
                  if (loading) {
                    document.dispatchEvent(new CustomEvent('navigationStart'));
                  }
                }}
                className="text-blue-600 text-sm font-medium"
              >
                Clear Filter
              </button>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              Found {products.length} product{products.length !== 1 ? 's' : ''} matching your search and filters
            </p>
          </div>
        </div>
      )}

      {/* Categories Carousel */}
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shop</h2>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          {/* Right-side navigation arrows (icon-only) */}
          {categories.length > 0 && (
            <div className="absolute top-[8px]  -translate-y-1/2 right-0 z-10 flex items-center gap-3 p-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous categories"
                className="p-2 text-gray-700 hover:text-black focus:outline-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next categories"
                className="p-2 text-gray-700 hover:text-black focus:outline-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}



          <div 
            className="flex transition-transform duration-500 gap-2 sm:gap-4 py-4"
            style={{ transform: `translateX(-${startIndex * (100/visibleItems)}%)` }}
          >
            {categories.map((category) => (
              <div key={category.category_id} className="relative">
                <button
                  onClick={() => {
                    // Immediate visual feedback
                    const newCategory = selectedCategories[0] === category.slug ? [] : [category.slug];
                    setSelectedCategories(newCategory);
                    
                    // Show loading state immediately
                    setLoading(true); // Resume after 3 seconds
                  }}
                  className={`flex-shrink-0 w-40 sm:w-58 gap-3 sm:gap-5 h-16 sm:h-22 bg-white overflow-hidden flex items-center p-3 sm:p-5 py-4 sm:py-7 border rounded-lg cursor-pointer transition-all duration-200 ${selectedCategories[0] === category.slug ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-12 h-12 sm:w-18 sm:h-18 relative mr-2">
                    <Image
                      src={`/api/categories/image/${category.category_id}`}
                      alt={category.name}
                      fill
                      className="object-cover rounded"
                      onError={handleImageError}
                      unoptimized
                    />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800">
                    {category.name}
                  </h3>
                </button>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          {categories.length > visibleItems && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: Math.ceil(categories.length / visibleItems) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setStartIndex(i * visibleItems);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === Math.floor(startIndex / visibleItems) 
                      ? 'bg-blue-500 w-4' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-4 lg:gap-8 mt-7 text-black">
        {/* Left Column - Filters */}
        <div className="w-full lg:w-1/4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setActiveFilter(activeFilter === 1 ? null : 1)}
              className="w-full bg-gray-300 p-4 rounded-lg flex justify-between items-center"
            >
              <h3 className="font-bold text-lg">Filters</h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeFilter === 1 ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Filters Content */}
          <div className={`${activeFilter === 1 ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-gray-300 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Shop by Categories</h3>
              {(selectedCategories.length > 0 || selectedSubcategories.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedSubcategories([]);
                  }}
                  className="text-sm text-red-600 underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {/* Show selected subcategories */}
            {selectedSubcategories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedSubcategories.map((subcategorySlug) => {
                  const allSubcategories = Object.values(subcategoriesByCategory).flat();
                  const subcategory = allSubcategories.find(sc => sc.slug === subcategorySlug);
                  return subcategory ? (
                    <span
                      key={subcategorySlug}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {subcategory.name}
                      <button
                        onClick={() => setSelectedSubcategories(selectedSubcategories.filter(sc => sc !== subcategorySlug))}
                      className="ml-1 text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <ul className="bg-white border border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-200">
            {categories.map((category) => {
              const isExpanded = openListCategoryId === category.category_id;
              const listSubcategories = subcategoriesByCategory[category.category_id] || [];
              const hasSubcategories = listSubcategories.length > 0;
              return (
              <li 
                key={category.category_id} 
                className="relative"
              >
                {/* Main Category Row */}
                <button
                  onClick={() => {
                    // Handle category selection with immediate feedback
                    const newCategory = selectedCategories[0] === category.slug ? [] : [category.slug];
                    setSelectedCategories(newCategory);
                    
                    // Show loading state immediately
                    setLoading(true);
                    
                    // Single-open: open this one, close previous
                    if (!hasSubcategories && !loadingSubcategories[category.category_id]) {
                      // No subcategories loaded yet; attempt to load once
                      fetchSubcategories(category.category_id);
                      return;
                    }
                    const willOpen = openListCategoryId !== category.category_id;
                    setOpenListCategoryId(willOpen ? category.category_id : null);
                  }}
                  className={`w-full px-4 py-3 text-left flex justify-between items-center transition-all duration-200 ${selectedCategories[0] === category.slug ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}
                  aria-expanded={isExpanded}
                >
                  <span className="flex items-center gap-2">
                    {category.name}
                    <span className="text-xs text-gray-500">({allFeaturedProductsRef.current.filter(p => p.category_slug === category.slug).length})</span>
                  </span>
                  {hasSubcategories && (
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  )}
                </button>
                
                {/* Expanded Subcategories Section */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ height: isExpanded ? (contentRefs.current[category.category_id]?.scrollHeight || 0) : 0 }}
                >
                  {hasSubcategories && loadingSubcategories[category.category_id] && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      <div className="px-6 py-3 text-sm text-gray-500">Loading...</div>
                    </div>
                  )}
                  {hasSubcategories && listSubcategories.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      <div className="max-h-[60vh] overflow-y-auto" ref={(el) => { contentRefs.current[category.category_id] = el; }}>
                        {listSubcategories.map((subcategory, index) => (
                          <button
                            key={subcategory.sub_category_id}
                            onClick={() => {
                              // Handle subcategory selection
                              const parentCategory = categories.find(cat => cat.category_id === subcategory.category_id);
                              
                              if (selectedSubcategories.includes(subcategory.slug)) {
                                // Remove subcategory
                                setSelectedSubcategories(selectedSubcategories.filter(sc => sc !== subcategory.slug));
                              } else {
                                // Add subcategory and ensure parent category is selected
                                setSelectedSubcategories([...selectedSubcategories, subcategory.slug]);
                                // Remove category filter when a subcategory is selected
                                if (selectedCategories.length > 0) {
                                  setSelectedCategories([]);
                                }
                              }
                              // Don't close the expansion when selecting subcategory
                            }}
                            className={`w-full px-6 py-3 text-left flex items-center border-b border-gray-100 last:border-b-0 border-l-4 ${
                              selectedSubcategories.includes(subcategory.slug) ? 'bg-orange-50 text-orange-600 font-medium border-orange-500' : 'text-gray-700 border-transparent'
                            }`}
                          >
                            {/* Tree Structure Icon */}
                            <div className="flex items-center mr-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            
                            {/* Subcategory Name */}
                            <span className="text-sm font-medium flex-1">{subcategory.name}</span>
                             <span className="text-xs text-gray-500 mr-2">({allFeaturedProductsRef.current.filter(p => (p.subcategory_slug || '') === subcategory.slug).length})</span>
                            

                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
              );
            })}
          </ul>

          {/* Brands Accordion */}
          <div className="bg-gray-300 p-4 rounded-t-lg mt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Shop by Brands</h3>
              {(selectedBrands.length > 0 || selectedSubBrands.length > 0) && (
                <button
                  onClick={() => { setSelectedBrands([]); setSelectedSubBrands([]); }}
                  className="text-sm text-red-600 underline"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          <ul className="bg-white border border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-200">
            {brandsFromApi.map((brandName) => {
              const isBrandExpanded = openBrandName === brandName;
              const subBrandList = subBrandsByBrand[brandName] || [];
              const hasSubBrands = subBrandList.length > 0;
              const isLoadingSubBrands = !!loadingSubBrands[brandName];
              return (
                <li key={brandName} className="relative">
                  <button
                    onClick={() => {
                      const willOpen = openBrandName !== brandName;
                      setOpenBrandName(willOpen ? brandName : null);
                      if (willOpen && !subBrandsByBrand[brandName]) {
                        fetchSubBrands(brandName);
                      }
                    }}
                    className={`w-full px-4 py-3 text-left flex justify-between items-center ${selectedBrands.includes(brandName) ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      {brandName}
                      <span className="text-xs text-gray-500">({allFeaturedProductsRef.current.filter(p => (p.brand_name || '') === brandName).length})</span>
                    </span>
                    {(hasSubBrands || isBrandExpanded || isLoadingSubBrands) && (
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isBrandExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isBrandExpanded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ height: isBrandExpanded ? (brandContentRefs.current[brandName]?.scrollHeight || 48) : 0 }}
                  >
                    <div ref={(el) => { brandContentRefs.current[brandName] = el; }}>
                      {isLoadingSubBrands && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          <div className="px-6 py-3 text-sm text-gray-500">Loading...</div>
                        </div>
                      )}
                      {subBrandList.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          <div className="max-h-[60vh] overflow-y-auto">
                            {subBrandList.map((sb) => (
                              <button
                                key={`${sb.brand_name}:${sb.sub_brand_name}`}
                                onClick={() => {
                                  if (selectedSubBrands.includes(sb.sub_brand_name)) {
                                    setSelectedSubBrands(selectedSubBrands.filter(s => s !== sb.sub_brand_name));
                                  } else {
                                    setSelectedSubBrands([...selectedSubBrands, sb.sub_brand_name]);
                                    if (!selectedBrands.includes(sb.brand_name)) {
                                      setSelectedBrands([sb.brand_name]);
                                    }
                                  }
                                }}
                                className={`w-full px-6 py-3 text-left flex items-center border-b border-gray-100 last:border-b-0 border-l-4 ${selectedSubBrands.includes(sb.sub_brand_name) ? 'bg-orange-50 text-orange-600 font-medium border-orange-500' : 'text-gray-700 border-transparent'}`}
                              >
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                <span className="text-sm font-medium flex-1">{sb.sub_brand_name}</span>
                                 <span className="text-xs text-gray-500 mr-2">({allFeaturedProductsRef.current.filter(p => (p.sub_brand_name || '') === sb.sub_brand_name).length})</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {/* Price Range Filter */}
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h3 className="font-bold text-lg mb-3 pb-2 border-b text-center">Price Range</h3>
            <div className="px-3 mt-2">
              <input
                type="range"
                min="0"
                 max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full mb-2"
              />
              <div className="flex justify-between text-sm">
                                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Brands Filter removed per request */}

          {/* Ratings Filter */}
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h3 className="font-bold text-lg mb-3 pb-2 border-b text-center">Customer Ratings</h3>
            <ul className="space-y-2 mt-2">
              {ratings.map(rating => (
                <li key={rating}>
                  <button
                    onClick={() => toggleRating(rating)}
                    className={`w-full text-left px-3 py-2 rounded flex items-center ${selectedRatings.includes(rating) ? 'bg-blue-100 text-blue-700' : ''}`}
                  >
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-500 text-sm">
                       & Up ({productsRef.current.filter(p => Math.floor(parseFloat(p.rating) || 0) >= rating).length})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* In Stock Filter */}
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h3 className="font-bold text-lg mb-3 pb-2 border-b text-center">Availability</h3>
            <label className="flex items-center space-x-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">In Stock Only</span>
            </label>
          </div>

          {/* Clear All Button */}
          <button
            onClick={() => {
              setSelectedCategories([]);
              setSelectedSubcategories([]);
              setSelectedBrands([]);
              setSelectedSubBrands([]);
              setOpenListCategoryId(null);
              setOpenBrandName(null);
              setSelectedConditions([]);
              setSelectedMaterials([]);
              setSelectedRatings([]);
              setPriceRange([0, 1000]);
              setInStockOnly(false);
              setBrandSearch('');
            }}
            className="w-full py-2 bg-gray-200 rounded-lg font-medium mt-6"
          >
            Clear All Filters
          </button>
        </div>
        </div>

        {/* Right Column - Products */}
        <div className="flex-1">
          {/* Products Grid Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Products</h2>
            <div className="text-sm text-gray-500">
              {loading ? 'Loading...' : `Showing ${paginatedProducts.length} of ${filteredProducts.length} products (${totalPages} pages)`}
            </div>
          </div>

          {/* Loading State - Optimized for faster feedback */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              {/* Simple, fast loading animation */}
              <div className="relative mb-4">
                {/* Fast spinning loader */}
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                
                {/* Quick pulse dots */}
                <div className="flex space-x-2 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-black rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-lg font-semibold text-black mb-2">Loading products...</p>
              <p className="text-gray-500">Please wait while we fetch the best products for you!</p>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedProducts.map(product => (
  <div key={product.product_id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
    {/* Product Image and Name as Link */}
    <div 
      className="flex flex-col flex-grow cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={(e) => handleProductClick(product.slug, e)}
    > 
      <div className="relative h-40 sm:h-48 w-full">
        <Image
                          src={getValidImageSrc(product.image_1)}
          alt={product.name}
          fill
          className="object-cover"
          onError={handleImageError}
                        unoptimized={(() => { const src = getValidImageSrc(product.image_1 as any); return src.startsWith('http://') || src.startsWith('https://'); })()}
        />
        {/* Hot Deal Badge */}
        {product.is_hot_deal === "1" && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            HOT DEAL
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-1 line-clamp-1">{product.brand_name} • {product.category_name} • {product.stock_quantity} in stock</p>
        {/* Rating */}
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(Number(product.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500 ml-1">({Number(product.rating || 0).toFixed(1)})</span>
        </div>
        {/* Price */}
        <div className="mb-3">
                          <p className="text-base sm:text-lg font-bold text-gray-800">{formatPrice(product.sale_price)}</p>
        </div>
      </div>
    </div>
    {/* Add to Cart Button (outside Link) */}
    <div className="p-3 sm:p-4 pt-0 mt-auto">
      {(() => {
        const isLoading = loadingItems.has(product.product_id);
        const status = getProductStatus(product);
        if (status.status === 'unavailable') {
          return (
            <button disabled className={`w-full py-2 rounded-md text-sm sm:text-base flex items-center justify-center ${status.bgColor} ${status.color}`}>
              {status.text}
            </button>
          );
        }
        if (status.status === 'out-of-stock') {
          return (
            <div className="w-full py-2 text-center text-red-600 font-medium">Out of Stock</div>
          );
        }
        return (
          <button
            onClick={(e) => {
              if (isLoading) return;
              handleAddToCart(product.product_id.toString(), e)
            }}
            disabled={isLoading}
            className={`w-full py-2 rounded-md text-sm sm:text-base flex items-center justify-center ${isLoading ? 'bg-blue-400 cursor-wait' : status.bgColor} ${status.color}`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              status.text
            )}
          </button>
        );
      })()}
    </div>
  </div>
))}
          </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                }`}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </span>
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                }`}
              >
                <span className="flex items-center gap-1">
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          )}

          {/* Page Info */}
          {!loading && totalPages > 1 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Page {currentPage} of {totalPages} • Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          )}

          {/* No Products Found Message */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 text-sm sm:text-base">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}