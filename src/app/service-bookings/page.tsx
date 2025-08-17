"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/utils/priceUtils';

type ServiceBooking = {
  service_order_id: number;
  user_id: number;
  service_id: number;
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  vendor_address: string;
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

const ServiceBookingsPage = () => {
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service bookings
  const fetchServiceBookings = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/service-orders/user/${user.user_id}`);
      const data = await response.json();

      if (data.success) {
        setServiceBookings(data.orders);
      } else {
        setError(data.message || 'Failed to fetch service bookings');
      }
    } catch (error) {
      console.error('Error fetching service bookings:', error);
      setError('Failed to fetch service bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.user_id) {
      fetchServiceBookings();
    }
  }, [user?.user_id, isLoggedIn]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
        return 'bg-purple-100 text-purple-800';
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
    return <LoadingPage message="Loading service bookings..." size="large" />;
  }

  if (!user || !isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Please log in to view your service bookings</p>
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
          <Link href="/profile" className="hover:text-gray-700">Profile</Link>
          <span>/</span>
          <span className="text-black">Service Bookings</span>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-black">Service Bookings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {serviceBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xl mb-4 text-black">You haven't booked any services yet</p>
            <Link 
              href="/location"
              className="inline-block bg-amber-700 text-white px-6 py-3 rounded hover:bg-black transition"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {serviceBookings.map((booking) => (
              <div key={booking.service_order_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        {booking.service_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booked on {formatDate(booking.booking_date)} • Order #{booking.service_order_id}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.service_status)}`}>
                        {booking.service_status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Vendor Details */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-black mb-3">Vendor Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vendor Name:</span>
                        <span className="font-medium text-black">{booking.vendor_name || 'N/A'}</span>
                      </div>
                      {booking.vendor_email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Email:</span>
                          <span className="text-black">{booking.vendor_email}</span>
                        </div>
                      )}
                      {booking.vendor_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Phone:</span>
                          <span className="text-black">{booking.vendor_phone}</span>
                        </div>
                      )}
                      {booking.vendor_address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vendor Address:</span>
                          <span className="text-black">{booking.vendor_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Service Details */}
                    <div>
                      <h4 className="font-medium text-black mb-3">Service Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium text-black">{formatPrice(booking.final_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Date:</span>
                          <span className="text-black">{formatDate(booking.service_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Time:</span>
                          <span className="text-black">{formatTime(booking.service_time)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="text-black">{booking.duration_minutes} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="text-black capitalize">
                            {booking.payment_method === 'cod' ? 'Cash on Delivery' : booking.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Service Address */}
                    <div>
                      <h4 className="font-medium text-black mb-3">Service Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{booking.service_address}</p>
                        <p>Pincode: {booking.service_pincode}</p>
                        {booking.additional_notes && (
                          <div className="mt-2">
                            <p className="font-medium text-black">Additional Notes:</p>
                            <p>{booking.additional_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className="font-medium text-black mb-3">Actions</h4>
                      <div className="space-y-2">
                        <Link
                          href={`/service-confirmation/${booking.service_order_id}`}
                          className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-center text-sm"
                        >
                          View Details
                        </Link>
                        {['pending','scheduled'].includes(booking.service_status.toLowerCase()) && (
                          <button 
                            className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition text-sm"
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/service-cancel', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ service_order_id: booking.service_order_id, user_id: user.user_id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  showToast('success', 'Service cancelled successfully');
                                  await fetchServiceBookings(); // refresh
                                } else {
                                  showToast('error', data.message || 'Failed to cancel booking');
                                }
                              } catch (e) {
                                console.error('Cancel booking error', e);
                                showToast('error', 'Failed to cancel booking');
                              }
                            }}
                          >
                            Cancel Booking
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

export default ServiceBookingsPage; 