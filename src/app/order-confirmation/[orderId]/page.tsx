"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';

type OrderDetails = {
  order_id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  order_date: string;
  order_status: string;
  total_amount: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
};

const OrderConfirmationPage = () => {
  const params = useParams();
  const { user, isLoggedIn } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.orderId as string;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (data.success) {
          setOrderDetails(data.order);
        } else {
          setError(data.message || 'Failed to fetch order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <LoadingPage message="Loading order details..." size="large" />;
  }

  if (!user || !isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Please log in to view order details</p>
          <Link 
            href="/login"
            className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4 text-red-600">{error}</p>
          <Link 
            href="/"
            className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Order not found</p>
          <Link 
            href="/"
            className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm text-black mb-4">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <span className="text-black">Order Confirmation</span>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-green-800">Order Confirmed!</h1>
              <p className="text-green-700 mt-1">
                Thank you for your order. Your order has been successfully placed and is being processed.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-black">Order Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium text-black">#{orderDetails.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="text-black">
                      {new Date(orderDetails.order_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {orderDetails.order_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-black capitalize">
                      {orderDetails.payment_method === 'cod' ? 'Cash on Delivery' : orderDetails.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      orderDetails.payment_status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetails.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="text-black font-medium">{orderDetails.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="text-black">{orderDetails.customer_email}</p>
                  </div>
                  {orderDetails.customer_phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="text-black">{orderDetails.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-black mb-4">Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-black">{orderDetails.shipping_address_line1}</p>
                {orderDetails.shipping_address_line2 && (
                  <p className="text-black">{orderDetails.shipping_address_line2}</p>
                )}
                <p className="text-black">
                  {orderDetails.shipping_city}, {orderDetails.shipping_state} {orderDetails.shipping_postal_code}
                </p>
                <p className="text-black">{orderDetails.shipping_country}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-black mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-black">${((Number(orderDetails.total_amount) || 0) - (Number(orderDetails.tax_amount) || 0) - (Number(orderDetails.shipping_cost) || 0) + (Number(orderDetails.discount_amount) || 0)).toFixed(2)}</span>
                  </div>
                  {(Number(orderDetails.discount_amount) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">-${(Number(orderDetails.discount_amount) || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-black">${(Number(orderDetails.shipping_cost) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-black">${(Number(orderDetails.tax_amount) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-lg font-bold text-black">Total:</span>
                    <span className="text-lg font-bold text-black">${(Number(orderDetails.total_amount) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/"
            className="flex-1 bg-amber-700 text-white py-3 px-6 rounded-lg hover:bg-black transition text-center"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/profile"
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition text-center"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 