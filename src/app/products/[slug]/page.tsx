"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

import Link from 'next/link';
import Image from 'next/image';
import { getValidImageSrc, handleImageError } from '@/utils/imageUtils';
import DescriptionDropdown from '@/components/DescriptionDropdown';

type Product = {
  product_id: string;
  name: string;
  description: string;
  sale_price: number;
  original_price: number;
  rating: number;
  image_1: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  category_id: string;
  brand_name: string;
  stock_quantity: number;
  is_active: number;
  is_featured: number;
  is_hot_deal: number;
  created_at: string;
  updated_at: string;
  dealer_id: string;
};

type Review = {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
};

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // Default quantity should be 1
  const [originalStock, setOriginalStock] = useState(0);

  const productSlug = params.slug;

  // Static customer reviews
  const customerReviews: Review[] = [
    {
      id: 1,
      user_name: "John Smith",
      rating: 5,
      comment: "Excellent quality product! Fast delivery and exactly as described. Highly recommend!",
      date: "2024-01-15",
      verified: true
    },
    {
      id: 2,
      user_name: "Sarah Johnson",
      rating: 4,
      comment: "Good product, works perfectly. The only minor issue was the packaging could be better.",
      date: "2024-01-10",
      verified: true
    },
    {
      id: 3,
      user_name: "Mike Davis",
      rating: 5,
      comment: "Amazing product quality! Exceeded my expectations. Will definitely buy again.",
      date: "2024-01-08",
      verified: true
    },
    {
      id: 4,
      user_name: "Emily Wilson",
      rating: 4,
      comment: "Solid product, good value for money. Delivery was on time.",
      date: "2024-01-05",
      verified: true
    },
    {
      id: 5,
      user_name: "David Brown",
      rating: 5,
      comment: "Perfect fit and excellent performance. Very satisfied with this purchase!",
      date: "2024-01-03",
      verified: true
    }
  ];

  console.log('Product detail page - productSlug:', productSlug, 'type:', typeof productSlug, 'params:', params);

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with slug:', productSlug);
      
      const response = await fetch(`/api/products/${productSlug}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Product API error:', data);
        setError(data.message || 'Failed to load product details');
        return;
      }
      
      console.log('Product data received:', data);
      setProduct(data);
      setOriginalStock(parseInt(data.stock_quantity) || 0);
      
      // Fetch related products
      if (data.category_id) {
        fetchRelatedProducts(data.category_id, data.product_id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products
  const fetchRelatedProducts = async (categoryId: string, excludeProductId: string) => {
    try {
      setRelatedLoading(true);
      const response = await fetch(`/api/products/related?categoryId=${categoryId}&excludeProductId=${excludeProductId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.products) {
          setRelatedProducts(data.products);
        } else {
          console.error('Related products API returned error:', data.message);
          setRelatedProducts([]);
        }
      } else {
        console.error('Related products API request failed');
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Fetch product data on component mount
  useEffect(() => {
    if (params?.slug) {
      fetchProduct();
    }
  }, [params?.slug]);

  // Listen for cart updates to refresh product (for stock updates)
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      console.log('Product detail page received cart update, updating product locally for stock updates');
      
      // Update product locally instead of reloading from server
      if (event.detail && event.detail.cartItems && product) {
        const cartItem = event.detail.cartItems.find((item: any) => item.product_id === product.product_id);
        if (cartItem) {
          // Product is in cart, calculate available stock using original stock value
          const cartQuantity = cartItem.quantity || 0;
          const availableStock = Math.max(0, originalStock - cartQuantity);
          setProduct(prev => prev ? { ...prev, stock_quantity: availableStock } : null);
        } else {
          // Product is not in cart, restore original stock
          setProduct(prev => prev ? { ...prev, stock_quantity: originalStock } : null);
        }
      } else if (event.detail && product) {
        // If no cart items, restore product to original stock
        console.log(`Product ${product.name}: Restored original stock ${originalStock} (no cart items)`);
        setProduct(prev => prev ? { ...prev, stock_quantity: originalStock } : null);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, [product, originalStock]);

  // Listen for cartItems changes from CartContext - only when product is loaded
  useEffect(() => {
    if (product && originalStock > 0) {
      console.log('Product detail page cartItems changed, updating product locally');
      const cartItem = cartItems.find(item => item.product_id === product.product_id);
      if (cartItem) {
        // Product is in cart, calculate available stock using original stock value
        const cartQuantity = cartItem.quantity || 0;
        const availableStock = Math.max(0, originalStock - cartQuantity);
        console.log(`Product ${product.name}: Original stock ${originalStock}, Cart quantity ${cartQuantity}, Available stock ${availableStock}`);
        
        // Only update if the stock quantity actually changed
        if (product.stock_quantity !== availableStock) {
          setProduct(prev => prev ? { ...prev, stock_quantity: availableStock } : null);
        }
      } else {
        // Product is not in cart, restore original stock
        console.log(`Product ${product.name}: Restored original stock ${originalStock} (not in cart)`);
        
        // Only update if the stock quantity actually changed
        if (product.stock_quantity !== originalStock) {
          setProduct(prev => prev ? { ...prev, stock_quantity: originalStock } : null);
        }
      }
    }
  }, [cartItems, product?.product_id, originalStock]);

  // Add to cart functionality
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.sale_price,
      image: product.image_1
    });
  };

  // Handle quantity increase (local only, no cart update)
  const handleQuantityIncrease = () => {
    if (!product) return;
    
    const cartItem = cartItems.find(item => item.product_id === product.product_id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    const availableStock = originalStock - cartQuantity;
    
    const newQuantity = quantity + 1;
    
    if (newQuantity <= availableStock) {
      setQuantity(newQuantity);
    } else {
      console.log(`Only ${availableStock} units available in stock`);
    }
  };

  // Handle quantity decrease (local only, no cart update)
  const handleQuantityDecrease = () => {
    if (quantity <= 1) return; // Minimum quantity should be 1
    setQuantity(quantity - 1);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading product details...</p>
          <p className="text-sm text-gray-500 mt-2">Product: {productSlug}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Product Not Found</h1>
          <p className="text-black mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/shop" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.original_price > product.sale_price 
    ? Math.round(((product.original_price - product.sale_price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-black hover:text-blue-600">
                <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                </svg>
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-black mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <Link href="/shop" className="ml-1 text-sm font-medium text-black hover:text-blue-600 md:ml-2">
                  Shop
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-black mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-black md:ml-2">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Image - Left */}
          <div className="relative lg:w-1/3 lg:ml-8">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={getValidImageSrc(product.image_1)}
                alt={product.name}
                fill
                className="object-cover"
                onError={handleImageError}
                                  unoptimized={!!(product.image_1 && product.image_1.startsWith('https://'))}
              />
            </div>
            {product.is_hot_deal && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                HOT DEAL
              </div>
            )}
          </div>

          {/* Product Details - Center */}
          <div className="space-y-4 lg:w-1/3 ml-2">
            {/* Product Status */}
            {!product.is_active && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 font-medium">⚠️ This product is currently unavailable</p>
              </div>
            )}

            {product.stock_quantity === 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-600 font-medium">⚠️ This product is out of stock</p>
              </div>
            )}

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-black">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-black">({product.rating}/5)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-black">
                  {formatPrice(product.sale_price)}
                </span>
                {product.original_price > product.sale_price && (
                  <>
                    <span className="text-xl text-black line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Product Info - Compact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-black">Brand</span>
                <p className="text-black">{product.brand_name || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-black">Category</span>
                <p className="text-black">{product.category_id || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-black">Stock</span>
                <p className="text-black">{(() => {
                  const cartItem = cartItems.find(item => item.product_id === product.product_id);
                  const cartQuantity = cartItem ? cartItem.quantity : 0;
                  const availableStock = originalStock - cartQuantity;
                  return `${availableStock} units available`;
                })()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-black">Status</span>
                <p className="text-black">{product.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            {/* Add to Cart Section - In center column */}
            {product.is_active && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-black">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={handleQuantityDecrease}
                      disabled={quantity <= 1 || product.stock_quantity === 0}
                      className="px-3 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center text-black">
                      {quantity}
                    </span>
                    <button
                      onClick={handleQuantityIncrease}
                      disabled={(() => {
                        const cartItem = cartItems.find(item => item.product_id === product.product_id);
                        const cartQuantity = cartItem ? cartItem.quantity : 0;
                        const availableStock = originalStock - cartQuantity;
                        return quantity >= availableStock;
                      })()}
                      className="px-3 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {(() => {
                  const cartItem = cartItems.find(item => item.product_id === product.product_id);
                  const cartQuantity = cartItem ? cartItem.quantity : 0;
                  const availableStock = originalStock - cartQuantity;
                  const isOutOfStock = availableStock <= 0;
                  
                  return (
                                          <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || quantity <= 0}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition ${
                          isOutOfStock || quantity <= 0
                            ? 'bg-gray-300 text-black cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isOutOfStock ? (
                          'Out of Stock'
                        ) : (
                          `Add to Cart - ${formatPrice(product.sale_price * quantity)}`
                        )}
                      </button>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Product Description - Right */}
          <div className="lg:w-1/3">
            <div className="space-y-4">
              <DescriptionDropdown
                title="Product Description"
                content={product.description}
                defaultOpen={true}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-black mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.product_id} href={`/products/${relatedProduct.product_id}`}>
                  <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer">
                    <div className="relative h-48 w-full">
                      <Image
                        src={getValidImageSrc(relatedProduct.image_1)}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                        onError={handleImageError}
                                                  unoptimized={!!(relatedProduct.image_1 && relatedProduct.image_1.startsWith('https://'))}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{relatedProduct.name}</h3>
                       <p className="text-sm text-black mb-2">{relatedProduct.brand_name}</p>
                      <p className="text-lg font-bold text-black">{formatPrice(relatedProduct.sale_price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-black mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {customerReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-black font-medium">{review.user_name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-black">{review.user_name}</h4>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-black">
                    {formatDate(review.date)}
                  </div>
                </div>
                <p className="text-black">{review.comment}</p>
                {review.verified && (
                  <div className="mt-3 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Purchase
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 