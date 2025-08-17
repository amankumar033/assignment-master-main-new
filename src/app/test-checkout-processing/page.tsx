'use client';

import React, { useState } from 'react';
import CheckoutProcessingPage from '@/components/CheckoutProcessingPage';

const TestCheckoutProcessingPage = () => {
  const [showProcessing, setShowProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Starting order processing...');
  const [orderData, setOrderData] = useState<any>(null);

  const startProcessing = () => {
    setShowProcessing(true);
    setProgress(0);
    setMessage('Starting order processing...');
    setOrderData(null);

    // Simulate order processing
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 8 + 2;
        
        if (newProgress > 20 && prev <= 20) {
          setMessage('Validating order details...');
        } else if (newProgress > 40 && prev <= 40) {
          setMessage('Checking product availability...');
        } else if (newProgress > 60 && prev <= 60) {
          setMessage('Processing payment...');
        } else if (newProgress > 80 && prev <= 80) {
          setMessage('Creating order...');
        } else if (newProgress > 90 && prev <= 90) {
          setMessage('Preparing confirmation...');
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setProgress(100);
          setMessage('Order completed successfully!');
          
          // Simulate order data
          setTimeout(() => {
            setOrderData({
              order_ids: ['ORD001', 'ORD002'],
              total_amount: 2500,
              total_items: 3
            });
          }, 1000);
          
          return 100;
        }
        
        return Math.min(newProgress, 100);
      });
    }, 300);
  };

  const startSingleOrderProcessing = () => {
    setShowProcessing(true);
    setProgress(0);
    setMessage('Starting order processing...');
    setOrderData(null);

    // Simulate order processing
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 8 + 2;
        
        if (newProgress > 20 && prev <= 20) {
          setMessage('Validating order details...');
        } else if (newProgress > 40 && prev <= 40) {
          setMessage('Checking product availability...');
        } else if (newProgress > 60 && prev <= 60) {
          setMessage('Processing payment...');
        } else if (newProgress > 80 && prev <= 80) {
          setMessage('Creating order...');
        } else if (newProgress > 90 && prev <= 90) {
          setMessage('Preparing confirmation...');
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setProgress(100);
          setMessage('Order completed successfully!');
          
          // Simulate single order data
          setTimeout(() => {
            setOrderData({
              order_ids: ['ORD001'],
              total_amount: 1500,
              total_items: 2
            });
          }, 1000);
          
          return 100;
        }
        
        return Math.min(newProgress, 100);
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Checkout Processing Page Demo
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Test the new checkout processing experience
            </h2>
            <p className="text-gray-600 mb-6">
              This page demonstrates the new full-screen checkout processing page with beautiful animations and progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Multi-Order Processing</h3>
              <p className="text-blue-700 mb-4">
                Simulates processing multiple orders with different vendors.
              </p>
              <button
                onClick={startProcessing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Start Multi-Order Processing
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Single Order Processing</h3>
              <p className="text-green-700 mb-4">
                Simulates processing a single order from one vendor.
              </p>
              <button
                onClick={startSingleOrderProcessing}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Start Single Order Processing
              </button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Features Demonstrated</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Full-screen immersive experience
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Animated background with floating elements
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Step-by-step progress tracking
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time progress bar with gradient
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Success state with countdown redirect
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Responsive design for all devices
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Checkout Processing Page Component */}
      <CheckoutProcessingPage 
        isVisible={showProcessing}
        progress={progress}
        message={message}
        orderData={orderData}
        onComplete={() => {
          // Optional: Add any completion logic here
          console.log('Processing completed');
        }}
      />
    </div>
  );
};

export default TestCheckoutProcessingPage;
