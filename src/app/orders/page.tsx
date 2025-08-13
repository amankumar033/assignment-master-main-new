"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/utils/priceUtils';

type Order = {
  order_id: number;
  user_id: number;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_description: string;
  quantity: number;
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
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.user_id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/user/${user.user_id}`);
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
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

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_status: 'Cancelled',
          updated_by: user?.user_id
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the order status in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.order_id.toString() === orderId 
              ? { ...order, order_status: 'Cancelled' }
              : order
          )
        );
        showToast('success', 'Order cancelled successfully!');
      } else {
        showToast('error', data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('error', 'Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
      setShowCancelConfirm(null);
    }
  };

  const openCancelConfirmation = (orderId: string) => {
    setShowCancelConfirm(orderId);
  };

  const closeCancelConfirmation = () => {
    setShowCancelConfirm(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
    return <LoadingPage message="Loading orders..." size="large" />;
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

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showCancelConfirm}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone and will notify the dealer."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        onConfirm={() => handleCancelOrder(showCancelConfirm!)}
        onCancel={closeCancelConfirmation}
        type="danger"
        isLoading={!!cancellingOrderId}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm text-black mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <span className="text-black">My Orders</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4 text-black">No orders found</p>
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
              <div key={order.order_id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-black">Order #{order.order_id}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Product Details */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-3">Product Details</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h5 className="font-semibold text-black text-lg mb-1">{order.product_name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{order.product_description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Qty: {order.quantity}
                          </span>
                          <span className="font-semibold text-black text-lg">
                            {formatPrice(order.product_price)} each
                          </span>
                        </div>
                      </div>
                      {order.product_image ? (
                        <div className="flex-shrink-0">
                          <img 
                            src={order.product_image} 
                            alt={order.product_name}
                            className="w-24 h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg border flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Order Details */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-black mb-3">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-semibold text-black">{formatPrice(order.total_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="text-black capitalize">
                            {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                          </span>
                        </div>
                        {(Number(order.discount_amount) || 0) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Discount:</span>
                            <span className="text-green-600 font-medium">-{formatPrice(order.discount_amount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="text-black">
                            {new Date(order.order_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-black mb-3">Shipping Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-black">{order.shipping_address_line1}</p>
                        {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                        <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                        <p>{order.shipping_country}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-black mb-3">Actions</h4>
                      <div className="space-y-2">
                        <Link
                          href={`/order-confirmation/${order.order_id}`}
                          className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-center text-sm font-medium"
                        >
                          View Details
                        </Link>
                        {(order.order_status.toLowerCase() === 'pending' || order.order_status.toLowerCase() === 'processing') && (
                          <button 
                            className="block w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => openCancelConfirmation(order.order_id.toString())}
                            disabled={cancellingOrderId === order.order_id.toString()}
                          >
                            {cancellingOrderId === order.order_id.toString() ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Cancelling...</span>
                              </div>
                            ) : (
                              'Cancel Order'
                            )}
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
    </>
  );
};

export default OrdersPage; 