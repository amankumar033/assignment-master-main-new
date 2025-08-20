"use client";
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/utils/priceUtils';

interface Location {
  latitude: number;
  longitude: number;
}

interface Service {
  service_id: string; // Changed from number to string to match varchar type
  dealer_id: string; // Changed from number to string to match varchar type
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
}

const LocationPage = () => {
  // Display helpers for missing/blank labels
  const getDisplayLabel = (value: unknown, fallback: string = 'Other'): string => {
    const str = (value ?? '').toString().trim();
    return str.length > 0 ? str : fallback;
  };

  const [location, setLocation] = useState<Location | null>(null);
  const [pincode, setPincode] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [searchCompleted, setSearchCompleted] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1000); // Default max price
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<string>('10');
  const [filteringMode, setFilteringMode] = useState<'distance_based' | 'all_services'>('distance_based');
  
  // const router = useRouter();

  // Derive a category label for filters: prefer category, then type, then name; fallback 'Other'
  const getCategoryLabel = (service: Service): string => {
    const cat = (service.category || '').trim();
    if (cat) return cat;
    const typ = (service.type || '').trim();
    if (typ) return typ;
    const nm = (service.name || '').trim();
    return nm || 'Other';
  };

  // Update price range when services are loaded
  useEffect(() => {
    if (services.length > 0) {
      const maxPrice = Math.max(...services.map(s => Number(s.base_price)));
      setPriceRange(maxPrice);
    }
  }, [services]);

  // Debug logging for distance filter changes
  useEffect(() => {
    console.log('🎯 Distance filter state changed:', {
      selectedDistance,
      hasLocation: !!location,
      hasPincode: !!pincode,
      servicesCount: services.length
    });
  }, [selectedDistance, location, pincode, services.length]);

  // Get user location
  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setShowPincodeInput(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationPermission('granted');
        setLoading(false);
        
        // Console log the user's location coordinates
        console.log('📍 User Location Detected:');
        console.log(`   Latitude: ${latitude}`);
        console.log(`   Longitude: ${longitude}`);
        console.log(`   Coordinates: [${latitude}, ${longitude}]`);
        
        // Automatically fetch services based on coordinates
        fetchServicesByCoordinates(latitude, longitude);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationPermission('denied');
        setShowPincodeInput(true);
        setLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access was denied. Please enter your pincode manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please enter your pincode manually.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please enter your pincode manually.');
            break;
          default:
            setError('An unknown error occurred. Please enter your pincode manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Fetch services by coordinates (convert to pincode first)
  const fetchServicesByCoordinates = async (latitude: number, longitude: number) => {
    // Console log the coordinates being used for API call
    console.log('🔍 Fetching services for coordinates:');
    console.log(`   Latitude: ${latitude}`);
    console.log(`   Longitude: ${longitude}`);
    console.log(`   Radius: ${selectedDistance} km`);
    
    try {
      setLoading(true);
      const radius = selectedDistance === 'any' ? 1000 : parseInt(selectedDistance);
      const showAllServices = selectedDistance === 'any';
      
      const response = await fetch('/api/services/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude, radius, showAllServices }),
      });

      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
        setFilteringMode(data.filteringMode || 'distance_based');
        setSearchCompleted(true);
        console.log('✅ Services fetched successfully (by coordinates):');
        console.log(`   Total services found: ${data.services.length}`);
        console.log(`   Filtering mode: ${data.filteringMode}`);
        console.log('   Services:', data.services);
      } else {
        setError(data.message || 'Failed to fetch services');
        setSearchCompleted(true);
        console.log('❌ Failed to fetch services (by coordinates):', data.message);
      }
    } catch (err) {
      setError('Failed to fetch services');
      setSearchCompleted(true);
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to initial state
  const resetToInitialState = () => {
    setLocation(null);
    setPincode('');
    setServices([]);
    setError(null);
    setShowPincodeInput(false);
    setLocationPermission('pending');
    setFilteringMode('distance_based');
    setSearchCompleted(false);
  };

  // Fetch services by pincode
  const fetchServicesByPincode = async () => {
    if (!pincode.trim()) {
      setError('Please enter a valid pincode');
      return;
    }

    // Console log the user's pincode
    console.log('📮 User Pincode Entered:');
    console.log(`   Pincode: ${pincode.trim()}`);

    try {
      setLoading(true);
      setError(null);
      
      const radius = selectedDistance === 'any' ? 1000 : parseInt(selectedDistance);
      const showAllServices = selectedDistance === 'any';
      
      const response = await fetch('/api/services/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pincode: pincode.trim(), radius, showAllServices }),
      });

      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
        setFilteringMode(data.filteringMode || 'distance_based');
        setSearchCompleted(true);
        console.log('✅ Services fetched successfully (by pincode):');
        console.log(`   Total services found: ${data.services.length}`);
        console.log(`   Filtering mode: ${data.filteringMode}`);
        console.log('   Services:', data.services);
      } else {
        setError(data.message || 'Failed to fetch services');
        setSearchCompleted(true);
        console.log('❌ Failed to fetch services (by pincode):', data.message);
      }
    } catch (err) {
      setError('Failed to fetch services');
      setSearchCompleted(true);
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter helper functions
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category];
      console.log('Category filter changed:', { category, newCategories });
      return newCategories;
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const newTypes = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
      console.log('Type filter changed:', { type, newTypes });
      return newTypes;
    });
  };

  // Handle distance filter changes
  const handleDistanceChange = async (distance: string) => {
    console.log('Distance filter changed:', distance);
    setSelectedDistance(distance);
    
    // If we have location or pincode, refetch services with new distance settings
    if (location || pincode) {
      const showAllServices = distance === 'any';
      const radius = distance === 'any' ? 1000 : parseInt(distance); // Use very large radius for "any" to get all services
      
      try {
        setLoading(true);
        let response;
        
        if (location) {
          // Refetch by coordinates
          response = await fetch('/api/services/nearby', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              latitude: location.latitude, 
              longitude: location.longitude, 
              radius, 
              showAllServices 
            }),
          });
        } else {
          // Refetch by pincode
          response = await fetch('/api/services/nearby', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              pincode: pincode.trim(), 
              radius, 
              showAllServices 
            }),
          });
        }

        const data = await response.json();
        
        if (data.success) {
          setServices(data.services);
          setFilteringMode(data.filteringMode || 'distance_based');
          console.log(`✅ Services refetched for ${distance === 'any' ? 'all distances' : distance + ' km'}:`);
          console.log(`   Total services found: ${data.services.length}`);
          console.log(`   Filtering mode: ${data.filteringMode}`);
        } else {
          setError(data.message || 'Failed to refetch services');
        }
      } catch (err) {
        setError('Failed to refetch services');
        console.error('Error refetching services:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setSelectedCategories([]);
    setSelectedTypes([]);
    setPriceRange(services.length > 0 ? Math.max(...services.map(s => Number(s.base_price))) : 1000);
    setAvailableOnly(false);
    setSelectedDistance('10');
    setFilteringMode('distance_based');
  };

  // Apply filters to services
  const filteredServices = services.filter(service => {
    const derivedCategory = getCategoryLabel(service);
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(derivedCategory);
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(service.type);
    const priceMatch = Number(service.base_price) <= priceRange;
    const availabilityMatch = !availableOnly || service.is_available;
    
    // Distance filtering - only apply if not "any" distance
    const distanceMatch = selectedDistance === 'any' || 
      (service.distance !== undefined && Number(service.distance) <= Number(selectedDistance));
    
    // Debug logging for filter issues
    if (!categoryMatch || !typeMatch || !priceMatch || !availabilityMatch || !distanceMatch) {
      console.log('Service filtered out:', service.name, {
        categoryMatch,
        typeMatch,
        priceMatch,
        availabilityMatch,
        distanceMatch,
        selectedCategories,
        selectedTypes,
        priceRange,
        availableOnly,
        selectedDistance,
        serviceDistance: service.distance
      });
    }
    
    return categoryMatch && typeMatch && priceMatch && availabilityMatch && distanceMatch;
  });

  // Debug logging for current filter state
  console.log('🔍 Current filter state:', {
    selectedDistance,
    totalServices: services.length,
    filteredServices: filteredServices.length,
    selectedCategories,
    selectedTypes,
    priceRange,
    availableOnly
  });

  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">Discover Services Near You</h1>
          <p className="text-gray-700">Find automotive services in your area</p>
        </div>

        {/* Location Options Section */}
        {!showPincodeInput && locationPermission === 'pending' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-black mb-2">Choose Your Location Method</h2>
                <p className="text-gray-700 mb-6">
                  Select how you'd like to find services near you
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Access Option */}
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <img src="/location.png" alt="Location" className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-black mb-2">Use GPS Location</h3>
                    <p className="text-gray-700 text-sm">
                      Allow location access to automatically find services near you using your device's GPS.
                    </p>
                  </div>
                  
                  <button
                    onClick={getUserLocation}
                    disabled={loading}
                    className="w-full bg-[#034c8c] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#023a6b] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Detecting Location...' : 'Allow Location Access'}
                  </button>
                </div>

                {/* Pincode Option */}
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-bold text-black mb-2">Enter Pincode</h3>
                    <p className="text-gray-700 text-sm">
                      Manually enter your pincode to find services in your specific area.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowPincodeInput(true)}
                    disabled={loading}
                    className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Enter Pincode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pincode Input Section */}
        {showPincodeInput && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-black mb-2">Enter Your Pincode</h2>
                <p className="text-gray-700 mb-4">
                  Please enter your pincode to find services in your area
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter your pincode"
                  className="px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#034c8c] focus:border-transparent"
                  maxLength={6}
                />
                <button
                  onClick={fetchServicesByPincode}
                  disabled={loading || !pincode.trim()}
                  className="bg-[#034c8c] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#023a6b] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Find Services'}
                </button>
              </div>
              
              {/* Back Button */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowPincodeInput(false);
                    setPincode('');
                    setError(null);
                  }}
                  className="text-gray-700 hover:text-gray-900 text-sm underline"
                >
                  ← Back to location options
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-700">Searching for services...</div>
          </div>
        )}

        {/* No Services Found Message */}
        {!loading && searchCompleted && services.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No Services Found</h3>
            <p className="text-gray-700 mb-4">
              {location 
                ? `No services found within ${selectedDistance === 'any' ? 'any distance' : selectedDistance + ' km'} of your location.`
                : `No services found for pincode ${pincode} within ${selectedDistance === 'any' ? 'any distance' : selectedDistance + ' km'}.`
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSelectedDistance('any');
                  if (location) {
                    fetchServicesByCoordinates(location.latitude, location.longitude);
                  } else {
                    fetchServicesByPincode();
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Search All Services
              </button>
              <button
                onClick={resetToInitialState}
                className="text-gray-700 hover:text-gray-900 text-sm underline"
              >
                ← Back to location options
              </button>
            </div>
          </div>
        )}

        {/* Services Display - Shop Page Style */}
        {!loading && services.length > 0 && (
          <div className="w-full bg-gray-100">
            {/* Breadcrumb Navigation */}
            <div className="w-full px-4 mb-3">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2">
                  <li className="inline-flex items-center">
                    <button
                      onClick={resetToInitialState}
                      className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                      <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                      </svg>
                      Back to Location
                    </button>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                      </svg>
                      <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 relative after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-gray-500">
                        Services
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            <div className='w-full bg-gray-200 h-[1px] mb-3'></div>

            <div className="w-full px-4 p-6">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Left Column - Filters */}
                <div className="w-full lg:w-80 lg:flex-shrink-0">
                  {/* Mobile Filter Toggle */}
                  <div className="lg:hidden mb-4">
                    <button
                      onClick={() => setActiveFilter(activeFilter === 1 ? null : 1)}
                      className="w-full bg-white p-4 rounded-lg shadow flex justify-between items-center"
                    >
                      <h3 className="font-bold text-black text-lg">Filters</h3>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${activeFilter === 1 ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Filters Content */}
                  <div className={`${activeFilter === 1 ? 'block' : 'hidden'} lg:block`}>
                    {/* Service Categories Filter */}
                    <div className="bg-gray-300 p-5 rounded-t-lg text-gray-600 ">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-600 text-lg">Service Categories</h3>
                        {selectedCategories.length > 0 && (
                          <button
                            onClick={() => setSelectedCategories([])}
                            className="text-sm text-red-600 underline"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    <ul className="bg-white border text-gray-600  border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-200">
                      {Array.from(new Set(services.map(s => getCategoryLabel(s)))).map(category => (
                        <li key={getDisplayLabel(category, 'Other')}>
                          <button 
                            onClick={() => toggleCategory(category)}
                            className={`w-full px-5 py-4 text-left flex justify-between items-center transition-all duration-200 ${
                              selectedCategories.includes(category) 
                                ? 'bg-blue-100 text-blue-700 font-bold' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {getDisplayLabel(category)}
                              <span className="text-xs text-gray-500">
                                ({services.filter(s => getCategoryLabel(s) === category).length})
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Service Types Filter */}
                    <div className="bg-gray-300 p-5 rounded-t-lg mt-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-600  text-lg">Service Types</h3>
                        {selectedTypes.length > 0 && (
                          <button
                            onClick={() => setSelectedTypes([])}
                            className="text-sm text-red-600 underline"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    <ul className="bg-white border text-gray-600  border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-200">
                      {Array.from(new Set(services.map(s => s.type))).map(type => (
                        <li key={getDisplayLabel(type, 'other')}>
                          <button 
                            onClick={() => toggleType(type)}
                            className={`w-full px-5 py-4 text-left flex justify-between items-center transition-all duration-200 ${
                              selectedTypes.includes(type) 
                                ? 'bg-blue-100 text-blue-700 font-bold' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {getDisplayLabel(type)}
                              <span className="text-xs text-gray-500">
                                ({services.filter(s => s.type === type).length})
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Price Range Filter */}
                    <div className="bg-white p-5 rounded-lg shadow mt-6">
                      <h3 className="font-bold text-lg mb-4 pb-2 border-b text-center text-gray-600 ">Price Range</h3>
                      <div className="px-3 mt-2 text-gray-600 ">
                        <input
                          type="range"
                          min="0"
                          max={services.length > 0 ? Math.max(...services.map(s => Number(s.base_price))) : 1000}
                          value={priceRange}
                          onChange={(e) => {
                            const newPrice = Number(e.target.value);
                            console.log('Price range changed:', newPrice);
                            setPriceRange(newPrice);
                          }}
                          className="w-full mb-2 text-gray-600 "
                        />
                        <div className="flex justify-between text-sm">
                          <span>₹0</span>
                          <span>₹{priceRange}</span>
                        </div>
                      </div>
                    </div>

                    {/* Availability Filter */}
                    <div className="bg-white p-5 rounded-lg shadow mt-6">
                      <h3 className="font-bold text-lg mb-4 pb-2 border-b text-center text-gray-600 ">Availability</h3>
                      <label className="flex items-center space-x-2 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={availableOnly}
                          onChange={(e) => {
                            console.log('Availability filter changed:', e.target.checked);
                            setAvailableOnly(e.target.checked);
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">Available Only</span>
                      </label>
                    </div>

                    {/* Distance Filter */}
                    <div className="bg-gray-300 p-5 rounded-t-lg mt-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-600 +">Distance</h3>
                      </div>
                    </div>
                    <ul className="bg-white border border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-200">
                      <li>
                        <label className="flex items-center px-5 py-4 cursor-pointer hover:bg-gray-50">
                          <input 
                            type="radio" 
                            name="distance" 
                            value="5"
                            checked={selectedDistance === '5'}
                            onChange={(e) => handleDistanceChange(e.target.value)}
                            className="text-blue-600 mr-3" 
                          />
                          <span className="text-sm text-gray-700">Within 5 km</span>
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center px-5 py-4 cursor-pointer hover:bg-gray-50">
                          <input 
                            type="radio" 
                            name="distance" 
                            value="10"
                            checked={selectedDistance === '10'}
                            onChange={(e) => handleDistanceChange(e.target.value)}
                            className="text-blue-600 mr-3" 
                          />
                          <span className="text-sm text-gray-700">Within 10 km</span>
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center px-5 py-4 cursor-pointer hover:bg-gray-50">
                          <input 
                            type="radio" 
                            name="distance" 
                            value="25"
                            checked={selectedDistance === '25'}
                            onChange={(e) => handleDistanceChange(e.target.value)}
                            className="text-blue-600 mr-3" 
                          />
                          <span className="text-sm text-gray-700">Within 25 km</span>
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center px-5 py-4 cursor-pointer hover:bg-gray-50">
                          <input 
                            type="radio" 
                            name="distance" 
                            value="50"
                            checked={selectedDistance === '50'}
                            onChange={(e) => handleDistanceChange(e.target.value)}
                            className="text-blue-600 mr-3" 
                          />
                          <span className="text-sm text-gray-700">Within 50 km</span>
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center px-5 py-4 cursor-pointer hover:bg-gray-50">
                          <input 
                            type="radio" 
                            name="distance" 
                            value="any"
                            checked={selectedDistance === 'any'}
                            onChange={(e) => handleDistanceChange(e.target.value)}
                            className="text-blue-600 mr-3" 
                          />
                          <span className="text-sm text-gray-700">Any distance (All services)</span>
                        </label>
                      </li>
                    </ul>

                    {/* Clear Filters Button */}
                    <button
                      onClick={clearAllFilters}
                      className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium text-gray-700"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>

                {/* Right Column - Services */}
                <div className="flex-1">
                  {/* Services Grid Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-black">Services</h2>
                    <div className="text-sm text-gray-700">
                      Showing {filteredServices.length} of {services.length} services 
                      {filteringMode === 'all_services' ? ' (all distances)' : ` (within ${selectedDistance} km)`}
                      {filteringMode === 'all_services' && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          All Services Mode
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Services Grid */}
                  {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {filteredServices.map(service => (
                        <Link key={service.service_id} href={`/services/${service.service_id}`}>
                          <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition flex flex-col h-full cursor-pointer">
                          {/* Service Icon */}
                          <div className="relative h-40 sm:h-48 w-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[#034c8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {!service.is_available && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                Unavailable
                              </div>
                            )}
                            {service.distance && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                {service.distance} km
                              </div>
                            )}
                          </div>

                          {/* Service Details */}
                          <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-base sm:text-lg mb-1 text-black line-clamp-2">{service.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-700 mb-1 line-clamp-1">
                              {[getDisplayLabel(service.category), getDisplayLabel(service.type)]
                                .filter(Boolean)
                                .join(' • ')}
                            </p>
                            
                            {/* Duration */}
                            <div className="flex items-center mb-2">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs sm:text-sm text-gray-700">{service.duration_minutes} min</span>
                            </div>

                            {/* Price */}
                            <p className="text-base sm:text-lg font-bold text-black mb-3 mt-auto">{formatPrice(service.base_price)}</p>

                            {/* View Service Button */}
                            <button
                              disabled={!service.is_available}
                              className={`w-full py-2 rounded-md text-sm sm:text-base ${service.is_available ? 'bg-[#034c8c] hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} transition font-medium mt-auto`}
                            >
                              {service.is_available ? 'View Details' : 'Currently Unavailable'}
                            </button>
                          </div>
                        </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    /* No Services Found Message */
                    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                        </svg>
                        <h3 className="text-lg sm:text-xl font-bold text-black mb-2">No Services Match Your Filters</h3>
                        <p className="text-sm sm:text-base text-gray-700 mb-4">
                          No services match your current filter criteria. Try adjusting your filters or clearing them to see all available services.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <button
                            onClick={clearAllFilters}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm sm:text-base"
                          >
                            Clear All Filters
                          </button>
                          <button
                            onClick={resetToInitialState}
                            className="text-gray-700 hover:text-gray-900 text-sm underline"
                          >
                            ← Back to location options
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPage; 