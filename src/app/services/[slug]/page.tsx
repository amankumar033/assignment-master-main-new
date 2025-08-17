"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import Link from 'next/link';
// import Image from 'next/image';
// import { getValidImageSrc, handleImageError } from '@/utils/imageUtils';
import DescriptionDropdown from '@/components/DescriptionDropdown';

type Service = {
  service_id: number;
  vendor_id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  base_price: number;
  duration_minutes: number;
  is_available: boolean;
  service_pincodes: string;
  created_at: string;
  updated_at: string;
  distance?: number;
  pincode?: string;
};

type Review = {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
};

const ServiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user: _user, isLoggedIn: _isLoggedIn } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const serviceId = params.slug;

  // Static customer reviews
  const customerReviews: Review[] = [
    {
      id: 1,
      user_name: "John Smith",
      rating: 5,
      comment: "Excellent service! The technician was professional and completed the work quickly. Highly recommend!",
      date: "2024-01-15",
      verified: true
    },
    {
      id: 2,
      user_name: "Sarah Johnson",
      rating: 4,
      comment: "Good service quality. The only minor issue was the waiting time, but the work was done well.",
      date: "2024-01-10",
      verified: true
    },
    {
      id: 3,
      user_name: "Mike Davis",
      rating: 5,
      comment: "Amazing service! Exceeded my expectations. Will definitely use this service again.",
      date: "2024-01-08",
      verified: true
    },
    {
      id: 4,
      user_name: "Emily Wilson",
      rating: 4,
      comment: "Solid service, good value for money. The technician was knowledgeable and friendly.",
      date: "2024-01-05",
      verified: true
    },
    {
      id: 5,
      user_name: "David Brown",
      rating: 5,
      comment: "Perfect service! Very satisfied with the quality and professionalism.",
      date: "2024-01-03",
      verified: true
    }
  ];

  // Fetch service details
  const fetchService = async () => {
    if (!serviceId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      const data = await response.json();

      if (data.success) {
        setService(data.service);
        // Fetch related services after getting the main service
        fetchRelatedServices(data.service.category, data.service.service_id);
      } else {
        setError(data.message || 'Service not found');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch related services
  const fetchRelatedServices = async (category: string, excludeServiceId: number) => {
    try {
      setRelatedLoading(true);
      const response = await fetch(`/api/services/related?category=${category}&excludeServiceId=${excludeServiceId}`);
      const data = await response.json();

      if (data.success) {
        setRelatedServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching related services:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  // Fast navigation to related services with progress bar
  const handleRelatedServiceClick = async (serviceId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Related service clicked:', serviceId);
    
    // Show immediate visual feedback
    const target = event.currentTarget as HTMLElement;
    target.style.transform = 'scale(0.98)';
    target.style.transition = 'transform 0.1s ease';
    
    // Set a timeout to detect slow navigation
    const slowNavigationTimeout = setTimeout(() => {
      console.log(`🐌 Slow navigation detected for service: ${serviceId}`);
      document.dispatchEvent(new CustomEvent('navigationStart'));
    }, 300); // Show progress bar if navigation takes longer than 300ms
    
    // Navigate with direct router
    router.push(`/services/${serviceId}`);
    
    // Clear timeout if navigation was fast
    setTimeout(() => {
      clearTimeout(slowNavigationTimeout);
    }, 500);
    
    // Reset transform after navigation
    setTimeout(() => {
      target.style.transform = '';
      target.style.transition = '';
    }, 100);
  };

  // Book service functionality - redirect to booking page
  const handleBookService = () => {
    if (!_isLoggedIn) {
      setBookingMessage({ type: 'error', message: 'Please login to book services' });
      setTimeout(() => setBookingMessage(null), 3000);
      return;
    }

    if (!service) return;

    // Redirect to the service booking page
    router.push(`/service-booking/${service.service_id}`);
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
          className={`w-5 h-5 ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
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

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Service Not Found</h1>
          <p className="text-black mb-6">{error || 'The service you are looking for does not exist.'}</p>
          <Link href="/location" className="bg-[var(--global-palette10)] text-white px-6 py-2 rounded-md">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Booking Message */}
      {bookingMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          bookingMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {bookingMessage.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-black">
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
                <Link href="/location" className="ml-1 text-sm font-medium text-black md:ml-2">
                  Services
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-black mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-black md:ml-2">{service.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Image */}
          <div className="relative lg:col-span-1">
            <div className="aspect-square max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <div className="w-full h-full bg-gray-50 flex items-center justify-center relative">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            {service.distance && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                📍 {service.distance} km
              </div>
            )}
            {!service.is_available && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                ⚠️ Unavailable
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Status */}
            {!service.is_available && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-600 font-medium">This service is currently unavailable</p>
                </div>
              </div>
            )}

            {/* Service Name */}
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{service.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {renderStars(4.5)} {/* Default rating for services */}
                  <span className="text-black ml-2 font-medium">(4.5/5)</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">{formatDuration(service.duration_minutes)}</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-[var(--global-palette10)]">
                  {formatPrice(service.base_price)}
                </span>
                <span className="text-lg text-gray-600">base price</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Final price may vary based on requirements</p>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-black mb-4">Service Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
                    <p className="text-black font-medium">{service.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</span>
                    <p className="text-black font-medium">{service.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</span>
                    <p className="text-black font-medium">{formatDuration(service.duration_minutes)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${service.is_available ? 'bg-green-100' : 'bg-red-100'}`}>
                    <svg className={`w-4 h-4 ${service.is_available ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                    <p className={`font-medium ${service.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {service.is_available ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <DescriptionDropdown
              title="Service Description"
              content={service.description}
              defaultOpen={false}
            />

            {/* Service Pincodes */}
            {service.service_pincodes && (
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Service Areas</h3>
                <p className="text-black">
                  Available in: {service.service_pincodes}
                </p>
              </div>
            )}

            {/* Book Service Section */}
            {service.is_available && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-1 text-black">Ready to Book?</h3>
                  <p className="mb-3 text-sm text-gray-600">Get this service scheduled at your convenience</p>
                  <button
                    onClick={handleBookService}
                    disabled={!_isLoggedIn}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-base ${
                      !_isLoggedIn
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[var(--global-palette10)] text-white'
                    }`}
                  >
                    {_isLoggedIn ? (
                      'Book This Service'
                    ) : (
                      'Login to Book Service'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Service Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {service.category}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {service.type}
              </span>
              {service.distance && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {service.distance} km away
                </span>
              )}
            </div>
          </div>
        </div>

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
                    Verified Service
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-black mb-8">Related Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedServices.map((relatedService) => (
                <div 
                  key={relatedService.service_id} 
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
                  onClick={(e) => handleRelatedServiceClick(relatedService.service_id.toString(), e)}
                >
                    <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {!relatedService.is_available && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Unavailable
                        </div>
                      )}
                      {relatedService.distance && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          {relatedService.distance} km
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 text-black">{relatedService.name}</h3>
                      <p className="text-sm text-gray-700 mb-1">{relatedService.category} • {relatedService.type}</p>
                      
                      {/* Duration */}
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{formatDuration(relatedService.duration_minutes)}</span>
                      </div>

                      {/* Price */}
                      <p className="text-lg font-bold text-black mb-3">{formatPrice(relatedService.base_price)}</p>

                      {/* View Service Button */}
                      <button
                        disabled={!relatedService.is_available}
                        className={`w-full py-2 rounded-md font-medium ${
                          relatedService.is_available 
                            ? 'bg-[var(--global-palette10)] text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {relatedService.is_available ? 'View Details' : 'Currently Unavailable'}
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailPage; 