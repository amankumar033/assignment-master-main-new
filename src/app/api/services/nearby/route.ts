import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Function to get coordinates from pincode (placeholder implementation)
async function getCoordinatesFromPincode(pincode: string): Promise<{ lat: number, lng: number } | null> {
  // This is a placeholder implementation
  // In a real application, you would use a geocoding service like Google Maps API
  // For now, we'll return a default location for testing
  
  // Simple mapping for common pincodes (you should replace this with proper geocoding)
  const pincodeCoordinates: { [key: string]: { lat: number, lng: number } } = {
    '110001': { lat: 28.6139, lng: 77.2090 }, // New Delhi
    '400001': { lat: 19.0760, lng: 72.8777 }, // Mumbai
    '700001': { lat: 22.5726, lng: 88.3639 }, // Kolkata
    '600001': { lat: 13.0827, lng: 80.2707 }, // Chennai
    '500001': { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    '560001': { lat: 12.9716, lng: 77.5946 }, // Bangalore
    '380001': { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
    '302001': { lat: 26.9124, lng: 75.7873 }, // Jaipur
    '226001': { lat: 26.8467, lng: 80.9462 }, // Lucknow
    '800001': { lat: 25.5941, lng: 85.1376 }, // Patna
  };

  if (pincodeCoordinates[pincode]) {
    return pincodeCoordinates[pincode];
  }

  // For unknown pincodes, return a default location (New Delhi)
  console.log(`⚠️  Unknown pincode: ${pincode}, using default coordinates`);
  return { lat: 28.6139, lng: 77.2090 };
}

// Function to get pincode from coordinates (placeholder implementation)
function getPincodeFromCoordinates(lat: number, lng: number): string {
  // This is a placeholder implementation
  // In a real application, you would use reverse geocoding
  // For now, we'll return a default pincode
  
  // Simple mapping for common coordinates (you should replace this with proper reverse geocoding)
  if (lat >= 28.5 && lat <= 28.7 && lng >= 77.1 && lng <= 77.3) {
    return '110001'; // New Delhi area
  } else if (lat >= 19.0 && lat <= 19.2 && lng >= 72.8 && lng <= 73.0) {
    return '400001'; // Mumbai area
  } else if (lat >= 22.5 && lat <= 22.7 && lng >= 88.3 && lng <= 88.4) {
    return '700001'; // Kolkata area
  } else if (lat >= 13.0 && lat <= 13.2 && lng >= 80.2 && lng <= 80.3) {
    return '600001'; // Chennai area
  } else if (lat >= 17.3 && lat <= 17.5 && lng >= 78.4 && lng <= 78.5) {
    return '500001'; // Hyderabad area
  } else if (lat >= 12.9 && lat <= 13.1 && lng >= 77.5 && lng <= 77.6) {
    return '560001'; // Bangalore area
  } else if (lat >= 23.0 && lat <= 23.1 && lng >= 72.5 && lng <= 72.6) {
    return '380001'; // Ahmedabad area
  } else if (lat >= 26.8 && lat <= 27.0 && lng >= 75.7 && lng <= 75.8) {
    return '302001'; // Jaipur area
  } else if (lat >= 26.8 && lat <= 26.9 && lng >= 80.9 && lng <= 81.0) {
    return '226001'; // Lucknow area
  } else if (lat >= 25.5 && lat <= 25.7 && lng >= 85.1 && lng <= 85.2) {
    return '800001'; // Patna area
  }

  // Default pincode for unknown coordinates
  console.log(`⚠️  Unknown coordinates: [${lat}, ${lng}], using default pincode`);
  return '110001';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, pincode, radius = 10, showAllServices = false } = body;

    console.log('🚀 API Request received:');
    console.log('   Body:', body);
    console.log('   Distance filtering mode:', showAllServices ? 'Show all services' : `Filter by ${radius} km radius`);

    // Validate input
    if (!latitude && !longitude && !pincode) {
      return NextResponse.json({
        success: false,
        message: 'Either coordinates (latitude, longitude) or pincode is required'
      }, { status: 400 });
    }

    // Determine user location
    let userLat: number, userLng: number, userPincode: string;

    if (latitude && longitude) {
      // Direct coordinates provided
      userLat = parseFloat(latitude);
      userLng = parseFloat(longitude);
      userPincode = getPincodeFromCoordinates(userLat, userLng);
      
      console.log('📍 User location determined from coordinates:');
      console.log(`   Latitude: ${userLat}`);
      console.log(`   Longitude: ${userLng}`);
      console.log(`   Approximate pincode: ${userPincode}`);
    } else if (pincode) {
      // Pincode provided, convert to coordinates
      const coords = await getCoordinatesFromPincode(pincode);
      if (!coords) {
        return NextResponse.json({
          success: false,
          message: 'Invalid pincode provided'
        }, { status: 400 });
      }
      userLat = coords.lat;
      userLng = coords.lng;
      userPincode = pincode;
      
      console.log('📍 User location determined from pincode:');
      console.log(`   Pincode: ${userPincode}`);
      console.log(`   Converted coordinates: [${userLat}, ${userLng}]`);
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid input parameters'
      }, { status: 400 });
    }

    // Fetch all services with their pincodes and category information
    const rows = await query(`
      SELECT 
        s.service_id,
        s.vendor_id,
        s.name,
        s.description,
        s.service_category_id,
        sc.name as category_name,
        s.type,
        s.base_price,
        s.duration_minutes,
        s.is_available,
        s.service_pincodes,
        s.created_at,
        s.updated_at,
        sp.pincode
      FROM kriptocar.services s
      INNER JOIN kriptocar.service_pincodes sp ON s.service_id = sp.service_id
      LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id
      WHERE s.is_available = 1
    `);

    console.log(`📊 Database query executed successfully`);
    console.log(`   Total services found: ${(rows as any[]).length}`);

    // Filter services by distance
    const servicesWithinRadius: any[] = [];
    const processedServices = new Set();

    for (const service of rows as any[]) {
      if (processedServices.has(service.service_id)) {
        continue; // Skip if we've already processed this service
      }

      // Get coordinates for service pincode
      const serviceCoords = await getCoordinatesFromPincode(service.pincode);
      if (!serviceCoords) {
        console.log(`⚠️  Could not get coordinates for service pincode: ${service.pincode}`);
        continue;
      }

      // Calculate distance
      const distance = calculateDistance(
        userLat, userLng,
        serviceCoords.lat, serviceCoords.lng
      );

      console.log(`🔍 Processing service: ${service.name}`);
      console.log(`   Service pincode: ${service.pincode}`);
      console.log(`   Service coordinates: [${serviceCoords.lat}, ${serviceCoords.lng}]`);
      console.log(`   Distance from user: ${distance.toFixed(2)} km`);

      // If showAllServices is true, include all services regardless of distance
      if (showAllServices) {
        servicesWithinRadius.push({
          ...service,
          category: service.category_name, // Map category_name to category for backward compatibility
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          pincode: service.pincode
        });
        console.log(`✅ Service added to results (showing all services - distance: ${distance.toFixed(2)} km)`);
      } else if (distance <= radius) {
        // Only apply distance filtering when showAllServices is false
        servicesWithinRadius.push({
          ...service,
          category: service.category_name, // Map category_name to category for backward compatibility
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          pincode: service.pincode
        });
        console.log(`✅ Service added to results (within ${radius} km radius - distance: ${distance.toFixed(2)} km)`);
      } else {
        console.log(`❌ Service skipped (outside ${radius} km radius - distance: ${distance.toFixed(2)} km)`);
      }

      processedServices.add(service.service_id);
    }



    console.log(`📋 Final results:`);
    if (showAllServices) {
      console.log(`   All services returned: ${servicesWithinRadius.length}`);
    } else {
      console.log(`   Services within ${radius} km: ${servicesWithinRadius.length}`);
    }
    console.log(`   Services processed: ${processedServices.size}`);

    return NextResponse.json({
      success: true,
      services: servicesWithinRadius,
      totalFound: servicesWithinRadius.length,
      filteringMode: showAllServices ? 'all_services' : 'distance_based',
      radius: showAllServices ? null : radius,
      userLocation: {
        latitude: userLat,
        longitude: userLng,
        pincode: userPincode
      }
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
} 