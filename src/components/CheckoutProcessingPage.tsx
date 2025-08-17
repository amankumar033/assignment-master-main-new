'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutProcessingPageProps {
  isVisible: boolean;
  progress: number;
  message: string;
  onComplete?: () => void;
  orderData?: any;
  autoRedirect?: boolean;
}

const CheckoutProcessingPage: React.FC<CheckoutProcessingPageProps> = ({
  isVisible,
  progress,
  message,
  onComplete,
  orderData,
  autoRedirect = false
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const steps = [
    {
      title: 'Validating Order Details',
      description: 'Checking your information and cart items',
      color: 'blue'
    },
    {
      title: 'Checking Product Availability',
      description: 'Verifying stock levels and pricing',
      color: 'purple'
    },
    {
      title: 'Processing Payment',
      description: 'Securing your payment information',
      color: 'green'
    },
    {
      title: 'Creating Order',
      description: 'Generating your order confirmation',
      color: 'orange'
    },
    {
      title: 'Preparing Confirmation',
      description: 'Setting up your order details',
      color: 'pink'
    }
  ];

  // Update current step based on progress
  useEffect(() => {
    if (progress <= 20) setCurrentStep(0);
    else if (progress <= 40) setCurrentStep(1);
    else if (progress <= 60) setCurrentStep(2);
    else if (progress <= 80) setCurrentStep(3);
    else if (progress <= 100) setCurrentStep(4);
  }, [progress]);

  // Handle completion
  useEffect(() => {
    if (progress === 100 && !showSuccess) {
      setShowSuccess(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [progress, showSuccess, onComplete]);

  // Handle redirect countdown
  useEffect(() => {
    if (!autoRedirect) return;
    if (showSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccess && redirectCountdown === 0) {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('justRedirectedFromCheckout', '1');
        }
      } catch {}
      if (orderData?.order_ids?.length > 1) {
        const queryParams = new URLSearchParams({
          order_ids: orderData.order_ids.join(','),
          total_amount: orderData.total_amount.toString(),
          total_items: orderData.total_items.toString()
        });
        router.push(`/multi-order-confirmation?${queryParams.toString()}`);
      } else if (orderData?.order_ids?.length === 1) {
        router.push(`/order-confirmation/${orderData.order_ids[0]}`);
      } else {
        router.push('/profile');
      }
    }
  }, [autoRedirect, showSuccess, redirectCountdown, orderData, router]);

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colorMap = {
      blue: isActive ? 'bg-blue-500' : 'bg-blue-100 text-blue-600',
      purple: isActive ? 'bg-purple-500' : 'bg-purple-100 text-purple-600',
      green: isActive ? 'bg-green-500' : 'bg-green-100 text-green-600',
      orange: isActive ? 'bg-orange-500' : 'bg-orange-100 text-orange-600',
      pink: isActive ? 'bg-pink-500' : 'bg-pink-100 text-pink-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-50">
      {/* Main Content */}
      <div className="h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full p-6">
          {!showSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-lg font-semibold text-gray-800 mb-1">Processing Your Order</h1>
                <p className="text-gray-600 text-xs">{message}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-800">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                        : index < currentStep 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : index < currentStep 
                          ? 'bg-green-500 text-white' 
                          : getColorClasses(step.color)
                    }`}>
                      {index < currentStep ? (
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium text-xs transition-colors duration-300 ${
                        index === currentStep ? 'text-blue-800' : index < currentStep ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs transition-colors duration-300 ${
                        index === currentStep ? 'text-blue-600' : index < currentStep ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimated Time */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 rounded-full border border-blue-200">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-blue-700 font-medium">
                    {Math.max(2, Math.ceil((100 - progress) / 25))} seconds remaining
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Order placed successfully!</h2>
              <p className="text-gray-600 mb-3 text-xs">Redirecting to order confirmation...</p>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-2 mb-3">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 font-medium text-xs">
                    Redirecting in {redirectCountdown} seconds...
                  </span>
                </div>
              </div>

              <div className="space-x-2">
                {orderData?.order_ids?.length > 1 ? (
                  <button
                    onClick={() => {
                      const queryParams = new URLSearchParams({
                        order_ids: orderData.order_ids.join(','),
                        total_amount: orderData.total_amount.toString(),
                        total_items: orderData.total_items.toString()
                      });
                      router.push(`/multi-order-confirmation?${queryParams.toString()}`);
                    }}
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs"
                  >
                    View Order Confirmation Now
                  </button>
                ) : orderData?.order_ids?.length === 1 ? (
                  <button
                    onClick={() => router.push(`/order-confirmation/${orderData.order_ids[0]}`)}
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs"
                  >
                    View Order Details Now
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/profile')}
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs"
                  >
                    View Orders Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutProcessingPage;
