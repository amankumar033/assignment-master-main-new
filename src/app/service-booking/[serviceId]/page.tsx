"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';
import ServiceBookingProgress from '@/components/ServiceBookingProgress';
import { formatPrice } from '@/utils/priceUtils';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';
import CustomDropdown from '@/components/CustomDropdown';

type Service = {
  service_id: string; // Changed from number to string to match varchar type
  vendor_id: string; // Changed from number to string to match varchar type
  name: string;
  description: string;
  category: string; // This will be populated from category_name for backward compatibility
  category_name?: string; // New field from the updated API
  type: string;
  base_price: number;
  duration_minutes: number;
  is_available: boolean;
  service_pincodes: string;
  created_at: string;
  updated_at: string;
};

type BookingForm = {
  service_date: string;
  service_time: string;
  service_address: string;
  service_pincode: string;
  payment_method: string;
  additional_notes: string;
};

const ServiceBookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
  const [bookingProgress, setBookingProgress] = useState(0);
  const [bookingMessage, setBookingMessage] = useState('Initializing booking...');
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectCountdown, _setRedirectCountdown] = useState(3);

  const [formData, setFormData] = useState<BookingForm>({
    service_date: '',
    service_time: '',
    service_address: '',
    service_pincode: '',
    payment_method: 'cod',
    additional_notes: ''
  });

  // Fetch service details
  const fetchService = async () => {
    if (!params.serviceId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/services/${params.serviceId}`);
      const data = await response.json();

      if (data.success) {
        // Ensure category field is available for backward compatibility
        const serviceData = data.service;
        if (serviceData.category_name && !serviceData.category) {
          serviceData.category = serviceData.category_name;
        }
        setService(serviceData);
      } else {
        setError(data.message || 'Failed to fetch service details');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [params.serviceId]);

  // Parse service pincodes into an array
  const getServicePincodes = (): string[] => {
    if (!service?.service_pincodes) return [];
    
    // Split by common delimiters and clean up
    const pincodes = service.service_pincodes
      .split(/[,;\s]+/) // Split by comma, semicolon, or whitespace
      .map(pincode => pincode.trim())
      .filter(pincode => pincode.length === 6 && /^\d{6}$/.test(pincode)); // Only valid 6-digit pincodes
    
    return [...new Set(pincodes)]; // Remove duplicates
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
    if (!formData.service_date) {
      setError('Please select a service date');
      return false;
    }

    // Enhanced date validation
    const selectedDate = new Date(formData.service_date);
    
    // Check if the date is valid
    if (isNaN(selectedDate.getTime())) {
      setError('Please select a valid service date');
      return false;
    }
    
    // Create tomorrow's date in local timezone
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Create selected date in local timezone for comparison
    const selectedDateLocal = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    

    
    if (selectedDateLocal < tomorrow) {
      setError('Service date must be from tomorrow onwards. Please select a future date.');
      return false;
    }

    // Check if year is more than 4 digits (unlikely but good to validate)
    const year = selectedDate.getFullYear();
    if (year.toString().length > 4) {
      setError('Invalid year format. Please select a valid date.');
      return false;
    }

    // Check if date is too far in the future (e.g., more than 1 year)
    const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    if (selectedDateLocal > oneYearFromNow) {
      setError('Service date cannot be more than 1 year in the future.');
      return false;
    }

    if (!formData.service_time) {
      setError('Please select a service time');
      return false;
    }
    if (!formData.service_address.trim()) {
      setError('Please enter your service address');
      return false;
    }
    if (!formData.service_pincode.trim()) {
      setError('Please select your pincode');
      return false;
    }
    if (!/^\d{6}$/.test(formData.service_pincode.trim())) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    
    // Validate if the selected pincode is available for this service
    const availablePincodes = getServicePincodes();
    if (availablePincodes.length > 0 && !availablePincodes.includes(formData.service_pincode.trim())) {
      setError(`Service is not available in pincode ${formData.service_pincode}. Available pincodes: ${availablePincodes.join(', ')}`);
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!service) {
      setError('Service details not available');
      return;
    }

    setSubmitting(true);
    setError(null);
    setBookingProgress(0);
    setBookingMessage('Processing booking...');

    try {
      console.log('🔍 Service object:', service);
      console.log('🔍 Service vendor_id:', service.vendor_id);
    
      const bookingData = {
        user_id: user?.user_id,
        service_id: service.service_id,
        vendor_id: service.vendor_id,
        service_name: service.name,
        service_description: service.description,
        service_category: service.category,
        service_type: service.type,
        base_price: service.base_price,
        final_price: service.base_price,
        duration_minutes: service.duration_minutes,
        service_date: formData.service_date,
        service_time: formData.service_time,
        service_address: formData.service_address,
        service_pincode: formData.service_pincode,
        payment_method: formData.payment_method,
        additional_notes: formData.additional_notes
      };
      
      console.log('🔍 Booking data being sent:', bookingData);

      setBookingProgress(50);
      setBookingMessage('Submitting booking...');

      const response = await fetch('/api/service-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (data.success) {
        setBookingProgress(100);
        setBookingMessage('Booking completed successfully!');
        showToast('success', 'Service booked successfully!');
        setShowSuccess(true);
        // Auto-redirect after short countdown
        const countdownTimer = setInterval(() => {
          _setRedirectCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              router.push(`/service-confirmation/${data.service_order_id}`);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to book service');
        showToast('error', data.message || 'Failed to book service');
      }
    } catch (error) {
      console.error('Error booking service:', error);
      setError('Failed to book service. Please try again.');
      showToast('error', 'Failed to book service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <LoadingPage message="Loading service details..." size="large" />;
  }

  if (!user || !isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Please log in to book a service</p>
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

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Service not found</p>
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
    <>
      {/* Service Booking Progress Modal */}
      <ServiceBookingProgress 
        isVisible={submitting || showSuccess}
        progress={bookingProgress}
        message={bookingMessage}
        showSuccess={showSuccess}
      />
      
      <div className="container mx-auto px-4 py-8 text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Service</h1>
          <p className="text-gray-600">Complete your service booking</p>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Service Details</h2>
          </div>
          <div className="space-y-4">
            {/* Service Name */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Service Name</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 ml-9">{service.name}</p>
            </div>
            
            {/* Category and Type */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Category</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 ml-9">{service.category}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Type</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 ml-9">{service.type}</p>
              </div>
            </div>
            
            {/* Price and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Price</p>
                </div>
                <p className="text-base sm:text-lg font-bold text-amber-800 ml-9">{formatPrice(service.base_price)}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Duration</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 ml-9">{service.duration_minutes} minutes</p>
              </div>
            </div>
            
            {/* Description */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-teal-100 to-teal-200 rounded-md flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Description</p>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed ml-9">{service.description}</p>
            </div>
            
            {/* Available Service Areas */}
            {getServicePincodes().length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Available Service Areas</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 ml-9">
                  {getServicePincodes().map((pincode) => (
                    <span 
                      key={pincode} 
                      className="inline-block bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-medium border border-orange-200 shadow-sm"
                    >
                      {pincode}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Booking Information</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {toast && (
            <div className={`mb-4 p-3 rounded ${
              toast.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
              toast.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
              'bg-yellow-100 border border-yellow-400 text-yellow-700'
            }`}>
              {toast.message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Service Date */}
            <div>
              <label htmlFor="service_date" className="block text-sm font-medium text-gray-700 mb-2">
                Service Date *
              </label>
              <CustomDatePicker
                value={formData.service_date}
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, service_date: date }));
                }}
                minDate={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full"
                name="service_date"
                id="service_date"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Select a date from tomorrow to 1 year from now
              </p>
            </div>

            {/* Service Time */}
            <div>
              <label htmlFor="service_time" className="block text-sm font-medium text-gray-700 mb-2">
                Service Time *
              </label>
              <CustomTimePicker
                value={formData.service_time}
                onChange={(time) => {
                  setFormData(prev => ({ ...prev, service_time: time }));
                }}
                className="w-full"
                name="service_time"
                id="service_time"
                required
              />
            </div>

            {/* Service Address */}
            <div className="sm:col-span-2">
              <label htmlFor="service_address" className="block text-sm font-medium text-gray-700 mb-2">
                Service Address *
              </label>
              <textarea
                id="service_address"
                name="service_address"
                value={formData.service_address}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter your complete address where service will be provided"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="service_pincode" className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              {getServicePincodes().length > 0 ? (
                <div>
                  <CustomDropdown
                    value={formData.service_pincode}
                    onChange={(pincode) => {
                      setFormData(prev => ({ ...prev, service_pincode: pincode }));
                    }}
                    options={[
                      { value: "", label: "Select your pincode" },
                      ...getServicePincodes().map((pincode) => ({
                        value: pincode,
                        label: pincode
                      }))
                    ]}
                    placeholder="Select your pincode"
                    className="w-full"
                    required
                    name="service_pincode"
                    id="service_pincode"
                  />
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Service available in {getServicePincodes().length} area{getServicePincodes().length > 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    id="service_pincode"
                    name="service_pincode"
                    value={formData.service_pincode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please enter your pincode to check service availability
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <CustomDropdown
                value={formData.payment_method}
                onChange={(method) => {
                  setFormData(prev => ({ ...prev, payment_method: method }));
                }}
                options={[
                  { value: "cod", label: "Cash on Delivery" },
                  { value: "online", label: "Online Payment" },
                  { value: "card", label: "Card Payment" }
                ]}
                placeholder="Select payment method"
                className="w-full"
                name="payment_method"
                id="payment_method"
              />
            </div>

            {/* Additional Notes */}
            <div className="sm:col-span-2">
              <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="additional_notes"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special instructions or notes for the service provider"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-amber-700 text-white py-3 px-4 sm:px-6 rounded-md hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Booking...' : 'Book Service'}
            </button>
            <Link
              href="/location"
              className="px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-center font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default ServiceBookingPage; 