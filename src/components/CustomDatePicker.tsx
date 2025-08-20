"use client";
import React, { useState, useRef, useEffect } from 'react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  className = "",
  name,
  id,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [inputValue, setInputValue] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync internal state with external value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentDate(date);
      setInputValue(`${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`);
    } else {
      setSelectedDate(null);
      setInputValue('');
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = formatDate(newDate);
    

    
    setSelectedDate(newDate);
    setInputValue(`${newDate.getDate().toString().padStart(2, '0')}/${(newDate.getMonth() + 1).toString().padStart(2, '0')}/${newDate.getFullYear()}`);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    
    // Check if today is allowed based on minDate
    if (minDate) {
      const minDateObj = new Date(minDate);
      if (today < minDateObj) {
        // If today is before minDate, go to minDate instead
        setCurrentDate(minDateObj);
        setSelectedDate(minDateObj);
        setInputValue(`${minDateObj.getDate().toString().padStart(2, '0')}/${(minDateObj.getMonth() + 1).toString().padStart(2, '0')}/${minDateObj.getFullYear()}`);
        onChange(formatDate(minDateObj));
        setIsOpen(false);
        return;
      }
    }
    
    setCurrentDate(today);
    setSelectedDate(today);
    setInputValue(`${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`);
    onChange(formatDate(today));
    setIsOpen(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
    setInputValue('');
    onChange('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Reset invalid state when user starts typing
    setIsInvalid(false);
    
    // Remove all non-digit characters
    let digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 8 digits (DDMMYYYY)
    if (digitsOnly.length > 8) {
      digitsOnly = digitsOnly.slice(0, 8);
    }
    
    // Format with slashes
    let formattedValue = '';
    if (digitsOnly.length >= 1) {
      formattedValue += digitsOnly.slice(0, 2);
    }
    if (digitsOnly.length >= 3) {
      formattedValue += '/' + digitsOnly.slice(2, 4);
    }
    if (digitsOnly.length >= 5) {
      formattedValue += '/' + digitsOnly.slice(4, 8);
    }
    
    setInputValue(formattedValue);
    
    // Only validate and update when the date is complete (10 characters)
    if (formattedValue.length === 10) {
      const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = formattedValue.match(dateRegex);
      
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // Month is 0-indexed
        const year = parseInt(match[3]);
        
        const date = new Date(year, month, day);
        
        // Only validate basic date format, not minimum date requirement
        if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
          setSelectedDate(date);
          setCurrentDate(date);
          onChange(formatDate(date));
        }
      }
    }
  };

  const handleInputBlur = () => {
    // If there's a selected date, format it properly
    if (selectedDate) {
      setInputValue(`${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`);
      
      // Check if the selected date meets minimum date requirement
      let isValidDate = true;
      
      if (minDate) {
        const minDateObj = new Date(minDate);
        if (selectedDate < minDateObj) {
          isValidDate = false;
        }
      } else {
        // Default to tomorrow if no minDate provided
        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        if (selectedDate < tomorrow) {
          isValidDate = false;
        }
      }
      
      if (!isValidDate) {
        // Clear the invalid date but keep the input for user to see
        setSelectedDate(null);
        onChange('');
        setIsInvalid(true);
      } else {
        setIsInvalid(false);
      }
    } else if (inputValue && inputValue.length === 10) {
      // If there's input but no valid selected date, clear it
      setInputValue('');
    }
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // If minDate is provided, use it; otherwise, default to tomorrow
    if (minDate) {
      const minDateObj = new Date(minDate);
      if (date < minDateObj) return true;
    } else {
      // Default to tomorrow if no minDate provided
      const today = new Date();
      const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      if (date < tomorrow) return true;
    }
    
    if (maxDate && formatDate(date) > maxDate) return true;
    return false;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentDate.getMonth() && 
           selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-5 h-5"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      const today = isToday(day);

      days.push(
        <button
          key={day}
          onClick={() => !disabled && handleDateSelect(day)}
          disabled={disabled}
          className={`w-5 h-5 text-xs rounded-full flex items-center justify-center transition-colors ${
            disabled 
              ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
              : selected 
                ? 'bg-blue-500 text-white' 
                : today 
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                  : 'text-gray-700 hover:bg-gray-100'
          }`}
          title={disabled ? 'Date not available for booking' : ''}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Input Field with Calendar Icon */}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={inputValue}
          placeholder="DD/MM/YYYY"
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={(e) => {
            // Don't blur on focus, allow typing
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
                     className={`w-full px-2 sm:px-3 py-2 sm:py-3 pr-8 border rounded-md focus:outline-none focus:ring-2 text-sm sm:text-base cursor-pointer ${
             isInvalid 
               ? 'border-red-300 focus:ring-red-500 bg-red-50' 
               : 'border-gray-300 focus:ring-amber-500'
           }`}
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
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white border border-gray-300 rounded flex items-center justify-center text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          style={{ minHeight: '20px', minWidth: '20px' }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      
      {/* Error message */}
      {isInvalid && (
        <div className="text-xs text-red-600 mt-1">
          {minDate ? (
            <span>Date must be from {new Date(minDate).toLocaleDateString()} onwards</span>
          ) : (
            <span>Date must be from tomorrow onwards</span>
          )}
        </div>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-64 p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPreviousMonth}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={goToNextMonth}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="w-5 h-5 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {renderCalendar()}
          </div>

          {/* Footer */}
          <div className="flex justify-between text-xs">
            <button
              onClick={clearDate}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
            <button
              onClick={goToToday}
              className="text-gray-500 hover:text-gray-700"
            >
              Today
            </button>
          </div>
          
          {/* Date restriction info */}
          <div className="text-xs text-gray-500 mt-2 text-center">
            {minDate ? (
              <span>Available from {new Date(minDate).toLocaleDateString()}</span>
            ) : (
              <span>Available from tomorrow</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
