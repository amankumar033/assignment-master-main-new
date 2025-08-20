"use client";
import React, { useState, useRef, useEffect } from 'react';

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  className = "",
  name,
  id,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const timeOptions = [
    { value: "09:00:00", label: "9:00 AM" },
    { value: "10:00:00", label: "10:00 AM" },
    { value: "11:00:00", label: "11:00 AM" },
    { value: "12:00:00", label: "12:00 PM" },
    { value: "13:00:00", label: "1:00 PM" },
    { value: "14:00:00", label: "2:00 PM" },
    { value: "15:00:00", label: "3:00 PM" },
    { value: "16:00:00", label: "4:00 PM" },
    { value: "17:00:00", label: "5:00 PM" },
    { value: "18:00:00", label: "6:00 PM" }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeSelect = (timeValue: string) => {
    onChange(timeValue);
    setIsOpen(false);
  };

  const selectedTime = timeOptions.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Input Field with Dropdown Icon */}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={selectedTime ? selectedTime.label : ''}
          placeholder="Select time"
          readOnly
          onFocus={(e) => e.target.blur()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="w-full px-2 sm:px-3 py-2 sm:py-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base cursor-pointer"
          style={{ 
            fontSize: '16px',
            minHeight: '44px',
            touchAction: 'manipulation'
          }}
          required={required}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                value === option.value ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
