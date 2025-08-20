"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';
import { formatPrice } from '@/utils/priceUtils';

type ServiceOrder = {
  service_order_id: number;
  user_id: number;
  service_id: number;
  vendor_id: number;
  service_name: string;
  service_description: string;
  service_category: string;
  service_type: string;
  base_price: number;
  final_price: number;
  duration_minutes: number;
  booking_date: string;
  service_date: string;
  service_time: string;
  service_status: string;
  service_pincode: string;
  service_address: string;
  payment_method: string;
  payment_status: string;
  additional_notes: string;
  transaction_id?: string;
  was_available?: number;
};

const ServiceConfirmationPage = () => {
  const params = useParams();
  const { user, isLoggedIn } = useAuth();
  const [ServiceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  const ServiceOrderId = params.serviceOrderId;

  // Fetch service order details
  const fetchServiceOrder = useCallback(async () => {
    if (!ServiceOrderId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/service-orders/${ServiceOrderId}`);
      const data = await response.json();

      if (data.success) {
        setServiceOrder(data.order);
      } else {
        _setError(data.message || 'Failed to fetch service order details');
      }
    } catch (error) {
      console.error('Error fetching service order:', error);
      _setError('Failed to fetch service order details');
    } finally {
      setLoading(false);
    }
  }, [ServiceOrderId]);

  useEffect(() => {
    fetchServiceOrder();
  }, [fetchServiceOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingPage message="Loading service confirmation..." size="large" />;
  }

  if (!user || !isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Please log in to view service confirmation</p>
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

  if (!ServiceOrder) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Service order not found</p>
          <Link 
            href="/location"
            className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
          >
            Back to Services
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
          <Link href="/location" className="hover:text-gray-700">Services</Link>
          <span>/</span>
          <span className="text-black">Service Confirmation</span>
        </div>

        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Service Booked Successfully!</h1>
          <p className="text-lg text-gray-600 mb-6">Your service has been confirmed and scheduled.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Order ID:</strong> #{ServiceOrder.service_order_id}
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-black">Service Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-black text-lg">{ServiceOrder.service_name}</h3>
                <p className="text-sm text-gray-600">{ServiceOrder.service_category} • {ServiceOrder.service_type}</p>
              </div>
              
              {ServiceOrder.service_description && (
                <div>
                  <p className="text-gray-700">{ServiceOrder.service_description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Duration:</span>
                  <p className="font-medium text-black">{ServiceOrder.duration_minutes} minutes</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Price:</span>
                  <p className="font-medium text-black">{formatPrice(ServiceOrder.final_price)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-black">Booking Details</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600">Service Date:</span>
                <p className="font-medium text-black">{formatDate(ServiceOrder.service_date)}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Service Time:</span>
                <p className="font-medium text-black">{formatTime(ServiceOrder.service_time)}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Booking Date:</span>
                <p className="font-medium text-black">{formatDate(ServiceOrder.booking_date)}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ServiceOrder.service_status)}`}>
                  {ServiceOrder.service_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Location */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold mb-6 text-black">Service Location</h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Address:</span>
              <p className="font-medium text-black">{ServiceOrder.service_address}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Pincode:</span>
              <p className="font-medium text-black">{ServiceOrder.service_pincode}</p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold mb-6 text-black">Payment Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-600">Payment Method:</span>
              <p className="font-medium text-black capitalize">
                {ServiceOrder.payment_method === 'cod' ? 'Cash on Delivery' : ServiceOrder.payment_method}
              </p>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Payment Status:</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(ServiceOrder.payment_status)}`}>
                {ServiceOrder.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {ServiceOrder.additional_notes && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-6 text-black">Additional Notes</h2>
            <p className="text-gray-700">{ServiceOrder.additional_notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/location"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-center"
          >
            Book Another Service
          </Link>
          
          <Link
            href="/profile#recent-services"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium text-center"
          >
            View My Bookings
          </Link>
          
          <Link
            href="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfirmationPage; 