'use client';

import React from 'react';
import { CheckoutStep } from '@/hooks/useCheckoutProgress';
import ProgressBar from './ProgressBar';

interface CheckoutProgressProps {
  steps: CheckoutStep[];
  overallProgress: number;
  isVisible: boolean;
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({
  steps,
  overallProgress,
  isVisible
}) => {
  if (!isVisible) return null;

  const getStepIcon = (status: CheckoutStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
        );
    }
  };

  const getStepTextColor = (status: CheckoutStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Order</h3>
          <p className="text-sm text-gray-600">Please wait while we process your order...</p>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <ProgressBar 
            progress={overallProgress} 
            message="Overall Progress" 
            color="green"
            className="mb-4"
          />
        </div>

        {/* Step Progress */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${getStepTextColor(step.status)}`}>
                    {step.name}
                  </span>
                  {step.status === 'processing' && (
                    <span className="text-xs text-blue-600">{Math.round(step.progress)}%</span>
                  )}
                </div>
                {step.status === 'processing' && (
                  <ProgressBar 
                    progress={step.progress} 
                    showPercentage={false}
                    color="blue"
                    className="h-1"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estimated Time */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Estimated time: {Math.max(5, Math.ceil((100 - overallProgress) / 20))} seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProgress;
