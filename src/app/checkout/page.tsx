"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import LoadingPage from '@/components/LoadingPage';
import { getValidImageSrc } from '@/utils/imageUtils';

type CartItem = {
  product_id: number;
  name: string;
  price: number; // This is the price stored when item was added to cart
  quantity: number;
  image?: string;
  description?: string;
  original_price?: number;
  rating?: number;
  brand?: string;
  stock_quantity?: number;
  product?: {
    product_id: number;
    name: string;
    image: string;
    stock_quantity: number;
    sale_price: number;
    [key: string]: any;
  };
};

type CheckoutForm = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string; // Single address field as per orders table
  shipping_pincode: string; // Single pincode field as per orders table
  payment_method: string;
};

const CheckoutPage = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, loading: cartLoading, clearCart } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [formData, setFormData] = useState<CheckoutForm>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_pincode: '',
    payment_method: 'cod'
  });

  useEffect(() => {
    // Set loading to false when cart is loaded
    if (!cartLoading) {
      setLoading(false);
    }
    
    // Pre-fill form with user data if available
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.full_name || '',
        customer_email: user.email || ''
      }));
    }
  }, [cartLoading, isLoggedIn, user]);

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountedSubtotal = subtotal - (subtotal * discount / 100);
    return discountedSubtotal + shippingCost + taxAmount;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = [
      'customer_name',
      'customer_email',
      'customer_phone',
      'shipping_address',
      'shipping_pincode'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof CheckoutForm]) {
        setError(`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer_email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.customer_phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      showToast('error', 'Your cart is empty');
      return;
    }

    setSubmitting(true);
    setError(null);
    showToast('info', 'Processing your order...');

    // Store cart items before clearing
    const currentCartItems = [...cartItems];

    try {
      // Start a global progress indicator immediately for perceived speed
      document.dispatchEvent(new CustomEvent('navigationStart'));
      const orderData = {
        user_id: user?.user_id?.toString(),
        dealer_id: null, // Will be set by backend based on products
        product_id: currentCartItems[0]?.product_id, // For single product orders, or will be handled by backend
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        shipping_pincode: formData.shipping_pincode,
        order_date: new Date().toISOString(),
        order_status: 'Pending',
        total_amount: calculateTotal(),
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        discount_amount: (calculateSubtotal() * discount / 100),
        payment_method: formData.payment_method,
        payment_status: 'Pending',
        transaction_id: null,
        cart_items: currentCartItems // For backend processing
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log('📥 Checkout API response:', data);
      console.log('📥 Response status:', response.status);
      console.log('📥 order_id from response:', data.order_id);
      console.log('📥 order_ids from response:', data.order_ids);

      if (data.success) {
        setOrderSuccess(true);
        showToast('success', 'Order placed successfully!');
        
        // Clear the cart after successful order
        try {
          await clearCart();
          console.log('Cart cleared successfully after order');
        } catch (clearError) {
          console.error('Error clearing cart after order:', clearError);
        }
        
        // Redirect to order confirmation page immediately
        router.push(`/order-confirmation/${data.order_id}`);
      } else {
        setError(data.message || 'Failed to place order');
        showToast('error', data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
      showToast('error', 'Failed to place order. Please try again.');
    } finally {
      document.dispatchEvent(new CustomEvent('navigationComplete'));
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Checkout</h2>
            <p className="text-gray-600">Please wait while we prepare your order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="w-16 h-16 text-amber-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-4">Login Required for Checkout</h2>
          <p className="text-lg text-gray-600 mb-6">
            You need to be logged in to complete your purchase. 
            {cartItems.length > 0 && (
              <span className="block mt-2">
                Don't worry! Your cart items will be saved and available after you log in.
              </span>
            )}
          </p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
            >
              Login to Continue
            </Link>
            <Link 
              href="/"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Order Placed Successfully!</h2>
          <p className="text-lg text-gray-600 mb-6">Your order has been confirmed and is being processed.</p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting to order confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link 
            href="/"
            className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading Overlay */}
        {submitting && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <video
                  src="/mobile-shipping-process-12728435-10453894.mp4"
                  className="w-full rounded mb-3"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <h3 className="text-lg font-semibold text-gray-800">Order processing...</h3>
                <p className="text-gray-600 text-sm mt-1">Please wait while we confirm your order.</p>
              </div>
            </div>
          </div>
        )}



        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-gray-900">Cart</Link>
          <span>/</span>
          <span className="text-gray-900">Checkout</span>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-black">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-6 text-black">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium mb-2 text-black">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="customer_email" className="block text-sm font-medium mb-2 text-black">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium mb-2 text-black">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-6 text-black">Shipping Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="shipping_address" className="block text-sm font-medium mb-2 text-black">
                    Shipping Address *
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                    placeholder="Enter your complete shipping address"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="shipping_pincode" className="block text-sm font-medium mb-2 text-black">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    id="shipping_pincode"
                    name="shipping_pincode"
                    value={formData.shipping_pincode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter 6-digit pincode"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6 text-black">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={formData.payment_method === 'cod'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span className="text-black">Cash on Delivery (COD)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={formData.payment_method === 'card'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span className="text-black">Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={formData.payment_method === 'upi'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span className="text-black">UPI</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6 text-black">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.product_id} className="flex items-center space-x-3">
                    <img 
                      src={getValidImageSrc(item.image)} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/engine1.png';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-black">{item.name}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-black">
                      ${((Number(item.price) || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-black">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span>-${(calculateSubtotal() * discount / 100).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-black">
                  <span>Shipping:</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-black">
                  <span>Tax:</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg border-t pt-3 text-black">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">Processing...</div>
                ) : (
                  `Place Order - $${calculateTotal().toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage; 