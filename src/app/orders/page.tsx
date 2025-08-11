"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';

type Order = {
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

const OrdersPage = () => {
  const { user, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.user_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/user/${user.user_id}`);
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.user_id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingPage message="Loading your orders..." size="large" />;
  }

  if (!user || !isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Please log in to view your orders</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm text-black mb-4">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <span className="text-black">My Orders</span>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-black">My Orders</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl mb-4 text-black">You haven't placed any orders yet</p>
            <Link 
              href="/"
              className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        Order #{order.order_id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Details */}
                    <div>
                      <h4 className="font-medium text-black mb-3">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium text-black">${(Number(order.total_amount) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="text-black capitalize">
                            {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                          </span>
                        </div>
                        {(Number(order.discount_amount) || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="text-green-600">-${(Number(order.discount_amount) || 0).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-medium text-black mb-3">Shipping Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shipping_address_line1}</p>
                        {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                        <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                        <p>{order.shipping_country}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className="font-medium text-black mb-3">Actions</h4>
                      <div className="space-y-2">
                        <Link
                          href={`/order-confirmation/${order.order_id}`}
                          className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-center text-sm"
                        >
                          View Details
                        </Link>
                        {order.order_status.toLowerCase() === 'processing' && (
                          <button className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition text-sm">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 