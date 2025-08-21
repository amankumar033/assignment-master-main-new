'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getValidImageSrc, handleImageError } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/priceUtils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

type CartDropdownProps = {
  onNavigate: (href: string) => void;
  onClose: () => void;
};

const CartDropdown: React.FC<CartDropdownProps> = ({ onNavigate, onClose }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalItems, 
    loadingItems,
    getTotalPrice,
    getDiscountedPrice,
    applyCoupon: applyCouponToCart,
    removeCoupon,
    couponCode,
    discountPercentage
  } = useCart();
  const { isLoggedIn } = useAuth();

  const [localCouponCode, setLocalCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  // const couponCode = localCouponCode; // Unused variable

  const subtotal = getTotalPrice();
  const total = getDiscountedPrice();

  const applyCoupon = () => {
    const result = applyCouponToCart(localCouponCode);
    setCouponMessage(result.message);
    if (result.success) {
      setLocalCouponCode('');
    }
  };

  const itemCount = getTotalItems();
  const isAnyLoading = loadingItems.size > 0;

  // Entrance animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Local stock cache for items missing stock info
  const [stockById, setStockById] = useState<Record<string, number>>({});
  useEffect(() => {
    const missing = cartItems.filter((i) => typeof (i as any).stock_quantity !== 'number' && stockById[i.product_id] === undefined);
    if (missing.length === 0) return;
    let aborted = false;
    const controller = new AbortController();
    (async () => {
      try {
        const results = await Promise.allSettled(
          missing.map(async (i) => {
            const resp = await fetch(`/api/products/stock?product_id=${encodeURIComponent(i.product_id)}`, { signal: controller.signal });
            const data = await resp.json();
            if (data?.success) {
              return { id: i.product_id, stock: Number(data.stock_quantity) || 0 };
            }
            return null;
          })
        );
        if (aborted) return;
        const updates: Record<string, number> = {};
        results.forEach((r: any) => {
          if (r.status === 'fulfilled' && r.value && typeof r.value.stock === 'number') {
            updates[r.value.id] = r.value.stock;
          }
        });
        if (Object.keys(updates).length > 0) {
          setStockById((prev) => ({ ...prev, ...updates }));
        }
      } catch {}
    })();
    return () => { aborted = true; controller.abort(); };
  }, [cartItems, stockById]);

  const ensureStock = async (productId: string) => {
    if (stockById[productId] !== undefined) return;
    try {
      const resp = await fetch(`/api/products/stock?product_id=${encodeURIComponent(productId)}`);
      const data = await resp.json();
      if (data?.success) {
        setStockById((prev) => ({ ...prev, [productId]: Number(data.stock_quantity) || 0 }));
      }
    } catch {}
  };

  return (
    <div
      className={`absolute right-[-10px] sm:right-0 mt-2 w-[20rem] sm:w-[26rem] bg-white text-black rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden z-[10000] transform transition-all duration-200 ease-out mr-[-15px] sm:mr-0 ${mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'}`}
    >
      <div className="p-3 bg-[#02427A] text-white font-semibold text-sm flex items-center justify-between">
        <span>My Cart ({itemCount})</span>
        <div className="flex items-center gap-2">
          {discountPercentage > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/20">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              {discountPercentage}% OFF
            </span>
          )}
          {/* Close Button */}
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            title="Close cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {isAnyLoading && <div className="h-0.5 bg-amber-500 animate-pulse" />}

      {/* Items - replicated grid structure */}
      <div className="max-h-72 overflow-y-auto">
        {/* Header row (desktop) */}
        <div className="hidden md:grid grid-cols-12 bg-amber-50 p-2 sm:p-3 text-black font-semibold text-[11px] uppercase">
          <div className="col-span-5">Product</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-3 text-center">Quantity</div>
          <div className="col-span-2 text-center">Total</div>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Your cart is empty</div>
        ) : (
          cartItems.map((item) => {
            const isLoading = loadingItems.has(item.product_id);
            const imgSrc = getValidImageSrc(item.image || item.product?.image_1 || '/engine1.png');
            const stock: number | undefined = (item as any).stock_quantity ?? (item as any).product?.stock_quantity ?? stockById[item.product_id];
            // const stockClass =
            //   stock === undefined
            //     ? 'hidden'
            //     : stock === 0
            //     ? 'bg-red-100 text-red-700'
            //     : stock <= 5
            //     ? 'bg-amber-100 text-amber-700'
            //     : 'bg-green-100 text-green-700';
            return (
              <div key={item.product_id} className="grid grid-cols-12 p-2 sm:p-3 border-b border-gray-200 items-center hover:bg-amber-50/60 hover:shadow-sm hover:ring-1 ring-amber-300 rounded-md transition-all">
                <div className="col-span-12 md:col-span-5 flex items-center">
                  <div className="relative w-12 h-12 mr-2 sm:mr-3 flex-shrink-0 rounded overflow-hidden ring-1 ring-gray-200">
                    <Image
                      src={imgSrc}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                      onError={(e: any) => handleImageError(e)}
                      sizes="48px"
                      unoptimized={typeof imgSrc === 'string' && imgSrc.startsWith('https://')}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-black text-sm sm:text-[15px] line-clamp-1 max-w-[11rem] sm:max-w-[14rem]">{item.name}</h3>
                    <button
                      className="inline-flex items-center gap-1 text-red-600 text-xs mt-1 hover:underline"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2 text-center text-amber-700 text-sm font-semibold">{formatPrice(item.price)}</div>
                <div className="col-span-5 md:col-span-3 flex justify-center">
                  <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                    <button
                      className="px-2 sm:px-2.5 py-1 text-black hover:bg-amber-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      ) : (
                        '-'
                      )}
                    </button>
                    <span className="px-2 sm:px-3 text-black text-sm min-w-[2rem] sm:min-w-[2.5rem] text-center bg-white">{item.quantity}</span>
                    <button
                      className="px-2 sm:px-2.5 py-1 text-black hover:bg-amber-100 active:scale-95 disabled:cursor-not-allowed text-sm transition"
                      onMouseEnter={() => ensureStock(item.product_id)}
                      onFocus={() => ensureStock(item.product_id)}
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={isLoading || (typeof stock === 'number' && item.quantity >= stock)}
                      aria-disabled={isLoading || (typeof stock === 'number' && item.quantity >= stock)}
                    >
                      <span className="inline-flex items-center gap-1">+
                        {isLoading && (
                          <span className="inline-block h-3 w-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </span>
                    </button>
                  </div>

                </div>
                <div className="col-span-3 md:col-span-2 text-center font-bold text-[#02427A] text-sm">
                  {formatPrice((Number(item.price) || 0) * item.quantity)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom actions */}
      {cartItems.length > 0 && (
        <div className="px-3 sm:px-4 py-2 flex justify-between">
          <button onClick={() => onNavigate('/')} className="text-amber-700 hover:text-black transition text-xs sm:text-sm">
            ← Continue Shopping
          </button>
          <button onClick={() => clearCart()} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition text-xs sm:text-sm">
            Clear Cart
          </button>
        </div>
      )}

      {/* Order Summary (replicated) */}
      <div className="p-3 sm:p-4 border-t bg-gray-50 sticky bottom-0">
        <h2 className="text-lg font-bold mb-3 text-black">Order Summary</h2>
        {discountPercentage > 0 && (
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              {discountPercentage}% discount applied
            </span>
            <button
              className="text-xs text-red-600 hover:underline"
              onClick={() => { removeCoupon(); setCouponMessage('Coupon removed'); }}
            >
              Remove
            </button>
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="coupon" className="block text-xs font-medium mb-1.5 text-black">
            Coupon Code
          </label>
          <div className="flex">
            <input
              type="text"
              id="coupon"
                              value={localCouponCode}
                              onChange={(e) => setLocalCouponCode(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              placeholder="Enter coupon code"
            />
            <button
              onClick={applyCoupon}
              className="bg-[#02427A] hover:bg-[#023a6b] text-white px-3.5 py-2 rounded-r transition text-sm"
            >
              Apply
            </button>
          </div>
          {couponMessage && (
            <p className={`text-xs mt-1.5 ${couponMessage.includes('applied') ? 'text-green-600' : 'text-red-600'}`}>
              {couponMessage}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between text-black">
            <span>Subtotal:</span>
                            <span>{formatPrice(subtotal)}</span>
          </div>
                    {discountPercentage > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discountPercentage}%):</span>
              <span>-{formatPrice((subtotal * discountPercentage) / 100)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2 text-black">
            <span>Total:</span>
                            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* View My Cart button */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => onNavigate('/cart')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-black py-2.5 rounded-md transition text-sm"
          >
            View My Cart
          </button>
          {isLoggedIn && (
            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full bg-[#02427A] hover:bg-[#023a6b] text-white py-2.5 rounded-md transition text-sm"
            >
              Proceed to Checkout
            </button>
          )}
        </div>

        {!isLoggedIn && (
          <div className="mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-amber-800 text-xs font-medium">
                  Login required to checkout
                </span>
              </div>
              <p className="text-amber-700 text-[10px] mt-1">
                Your cart items will be saved when you log in.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/login')}
              className="w-full bg-amber-600 text-white py-2.5 rounded-md hover:bg-amber-700 transition text-sm"
            >
              Login to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDropdown;


