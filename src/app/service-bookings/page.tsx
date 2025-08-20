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
  const [retryCount, setRetryCount] = useState(0);

  // Fetch service bookings
  const fetchServiceBookings = async () => {
    if (!user?.user_id) {
      console.log('No user ID available, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching service bookings for user:', user.user_id);
      
      const response = await fetch(`/api/service-orders/user/${user.user_id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Service bookings response:', data);

      if (data.success) {
        setServiceBookings(data.orders || []);
        console.log('Service bookings loaded:', data.orders?.length || 0, 'bookings');
      } else {
        setError(data.message || 'Failed to fetch service bookings');
        console.error('API error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching service bookings:', error);
      setError('Failed to fetch service bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - isLoggedIn:', isLoggedIn, 'user:', user?.user_id);
    
    if (isLoggedIn && user?.user_id) {
      console.log('Conditions met, fetching service bookings...');
      fetchServiceBookings();
    } else if (isLoggedIn && !user?.user_id) {
      console.log('User is logged in but no user ID yet, waiting...');
      // Wait a bit for user data to load
      const timer = setTimeout(() => {
        if (user?.user_id) {
          fetchServiceBookings();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('User not logged in, clearing bookings');
      setServiceBookings([]);
      setLoading(false);
    }
  }, [isLoggedIn, user?.user_id]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/profile" className="hover:text-amber-600 transition-colors">Profile</Link>
          <span className="text-gray-400">/</span>
          <span className="text-amber-700 font-medium">Service Bookings</span>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Service Bookings</h1>
            <p className="text-gray-600">Manage and track your service appointments</p>
          </div>
        
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            {error}
              </div>
              <button
                onClick={() => {
                  setRetryCount(prev => prev + 1);
                  fetchServiceBookings();
                }}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {serviceBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Service Bookings Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your journey by booking your first service. We're here to help you maintain your vehicle.</p>
            <Link 
              href="/location"
              className="inline-flex items-center bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {serviceBookings.map((booking) => (
              <div key={booking.service_order_id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 w-full max-w-none">
                {/* Header with Service Info and Status */}
                <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-700 mb-1">
                        {booking.service_name}
                      </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(booking.booking_date)}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            #{booking.service_order_id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-7 lg:mt-0 flex flex-row gap-6 justify-between flex-shrink-0">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-2">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(booking.service_status)}`}>
                        {booking.service_status}
                      </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-2">Payment:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-semibold shadow-sm ${getPaymentStatusColor(booking.payment_status)}`}>
                        {booking.payment_status}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-6">
                  {/* Service Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-bold text-lg">₹</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Total Amount</p>
                          <p className="text-lg font-bold text-gray-600">{formatPrice(booking.final_price)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Service Date</p>
                          <p className="text-lg font-bold text-gray-600">{formatDate(booking.service_date)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Service Time</p>
                          <p className="text-lg font-bold text-gray-600">{new Date(`2000-01-01T${booking.service_time}`).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Duration</p>
                          <p className="text-lg font-bold text-gray-600">{booking.duration_minutes} min</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vendor and Service Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vendor Information */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-blue-700 uppercase tracking-wide" style={{color: '#1d4ed8'}}>Vendor Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vendor Name:</span>
                          <span className="text-gray-800 font-medium">{booking.vendor_name || 'N/A'}</span>
                        </div>
                        {booking.vendor_email && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Contact Email:</span>
                            <span className="text-gray-800 font-medium">{booking.vendor_email}</span>
                        </div>
                      )}
                      {booking.vendor_phone && (
                          <div className="flex justify-between items-center">
                          <span className="text-gray-600">Contact Phone:</span>
                            <span className="text-gray-800 font-medium">{booking.vendor_phone}</span>
                        </div>
                      )}
                      {booking.vendor_address && (
                          <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vendor Address:</span>
                            <span className="text-gray-800 font-medium">{booking.vendor_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                    {/* Service Information */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-blue-700 uppercase tracking-wide" style={{color: '#1d4ed8'}}>Service Information</h4>
                        </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Service Address:</span>
                          <span className="text-gray-800 font-medium">{booking.service_address}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pincode:</span>
                          <span className="text-gray-800 font-medium">{booking.service_pincode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="text-gray-800 font-medium capitalize">
                            {booking.payment_method === 'cod' ? 'Cash on Delivery' : booking.payment_method}
                          </span>
                        </div>
                        {booking.additional_notes && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Additional Notes:</span>
                            <span className="text-gray-800 font-medium">{booking.additional_notes}</span>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>

                    {/* Actions */}
                  <div className="mt-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-4">Actions</h4>
                      <div className="space-y-3">
                        <Link
                          href={`/service-confirmation/${booking.service_order_id}`}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Details</span>
                        </Link>
                        {['pending','scheduled'].includes(booking.service_status.toLowerCase()) && (
                          <button 
                            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Cancel Booking</span>
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