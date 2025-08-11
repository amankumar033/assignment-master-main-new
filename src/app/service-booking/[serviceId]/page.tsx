"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';

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
    if (!formData.service_time) {
      setError('Please select a service time');
      return false;
    }
    if (!formData.service_address.trim()) {
      setError('Please enter your service address');
      return false;
    }
    if (!formData.service_pincode.trim()) {
      setError('Please enter your pincode');
      return false;
    }
    if (!/^\d{6}$/.test(formData.service_pincode.trim())) {
      setError('Please enter a valid 6-digit pincode');
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

    try {
      console.log('🔍 Service object:', service);
      console.log('🔍 Service vendor_id:', service.vendor_id);
    
      
      const bookingData = {
        user_id: user?.user_id,
        service_id: service.service_id,
        vendor_id: service.vendor_id,
        service_name: service.name,
        service_description: service.description,
        service_category: service.category, // This will be the category name
        service_type: service.type,
        base_price: service.base_price,
        final_price: service.base_price, // Can be modified for discounts
        duration_minutes: service.duration_minutes,
        service_date: formData.service_date,
        service_time: formData.service_time,
        service_address: formData.service_address,
        service_pincode: formData.service_pincode,
        payment_method: formData.payment_method,
        additional_notes: formData.additional_notes
      };
      
      console.log('🔍 Booking data being sent:', bookingData);

      const response = await fetch('/api/service-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'Service booked successfully!');
        setTimeout(() => {
          router.push(`/service-confirmation/${data.service_order_id}`);
        }, 2000);
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
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Service</h1>
          <p className="text-gray-600">Complete your service booking</p>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service Name</p>
              <p className="font-medium">{service.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium">{service.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium">{service.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-medium">₹{service.base_price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{service.duration_minutes} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{service.description}</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Booking Information</h2>
          
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Date */}
            <div>
              <label htmlFor="service_date" className="block text-sm font-medium text-gray-700 mb-2">
                Service Date *
              </label>
              <input
                type="date"
                id="service_date"
                name="service_date"
                value={formData.service_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Service Time */}
            <div>
              <label htmlFor="service_time" className="block text-sm font-medium text-gray-700 mb-2">
                Service Time *
              </label>
              <select
                id="service_time"
                name="service_time"
                value={formData.service_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select time</option>
                <option value="09:00:00">9:00 AM</option>
                <option value="10:00:00">10:00 AM</option>
                <option value="11:00:00">11:00 AM</option>
                <option value="12:00:00">12:00 PM</option>
                <option value="13:00:00">1:00 PM</option>
                <option value="14:00:00">2:00 PM</option>
                <option value="15:00:00">3:00 PM</option>
                <option value="16:00:00">4:00 PM</option>
                <option value="17:00:00">5:00 PM</option>
                <option value="18:00:00">6:00 PM</option>
              </select>
            </div>

            {/* Service Address */}
            <div className="md:col-span-2">
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
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment</option>
                <option value="card">Card Payment</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2">
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
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-amber-700 text-white py-3 px-6 rounded-md hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Booking...' : 'Book Service'}
            </button>
            <Link
              href="/location"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceBookingPage; 