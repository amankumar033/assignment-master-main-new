'use client';

import React from 'react';
import ProgressBar from './ProgressBar';

interface ServiceBookingProgressProps {
  isVisible: boolean;
  progress: number;
  message: string;
  showSuccess?: boolean;
}

const ServiceBookingProgress: React.FC<ServiceBookingProgressProps> = ({
  isVisible,
  progress,
  message,
  showSuccess = false
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
        {showSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed</h3>
            <p className="text-sm text-gray-600">Redirecting to confirmation...</p>
          </div>
        ) : (
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Your Service</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        )}

        {/* Progress Bar */}
        {!showSuccess && (
        <div className="mb-6">
          <ProgressBar 
            progress={progress} 
            message="Processing..." 
            color="red"
            className="mb-4"
          />
        </div>
        )}

        {/* Loading Steps */}
        {!showSuccess && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Validating service availability</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${progress > 30 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Processing booking request</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${progress > 60 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Preparing confirmation</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${progress > 90 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Finalizing booking</span>
          </div>
        </div>
        )}

        {/* Estimated Time */}
        {!showSuccess && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Estimated time: {Math.max(2, Math.ceil((100 - progress) / 30))} seconds
          </p>
        </div>
        )}
      </div>
    </div>
  );
};

export default ServiceBookingProgress;
